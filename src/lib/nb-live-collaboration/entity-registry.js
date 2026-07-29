import {defaultUuidFactory} from './protocol';

const STAGE_TARGET_REF = 'stage';

/**
 * @param {*} value Value to inspect.
 * @returns {boolean} Whether the value is a non-empty identifier.
 */
const isIdentifier = value => typeof value === 'string' && value.length > 0 && value.length <= 256;

/**
 * @param {*} target Runtime target.
 * @returns {string} Current display name.
 */
const getTargetName = target => {
    if (target && typeof target.getName === 'function') return target.getName();
    if (target && target.sprite && typeof target.sprite.name === 'string') return target.sprite.name;
    if (target && typeof target.name === 'string') return target.name;
    return '';
};

/**
 * Return only project targets, excluding runtime clones.
 * @param {object} runtime Scratch VM runtime.
 * @returns {Array<object>} Original runtime targets in runtime order.
 */
const getOriginalTargets = runtime => {
    if (!runtime || !Array.isArray(runtime.targets)) {
        throw new TypeError('runtime.targets must be an array');
    }
    return runtime.targets.filter(target => target && (target.isStage || target.isOriginal));
};

/**
 * @param {object} runtime Scratch VM runtime.
 * @returns {object|null} Stage target.
 */
const getStage = runtime => {
    if (runtime && typeof runtime.getTargetForStage === 'function') {
        const stage = runtime.getTargetForStage();
        if (stage) return stage;
    }
    return getOriginalTargets(runtime).find(target => target.isStage) || null;
};

/**
 * Validate the canonical target manifest.
 * @param {*} manifest Manifest to validate.
 * @returns {Array<string>} Validation errors.
 */
const validateManifest = manifest => {
    const errors = [];
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        return ['manifest must be an object'];
    }
    if (!Array.isArray(manifest.targets)) {
        errors.push('manifest.targets must be an array');
        return errors;
    }

    const refs = new Set();
    const orders = new Set();
    let stageCount = 0;
    manifest.targets.forEach((entry, index) => {
        const prefix = `manifest.targets[${index}]`;
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            errors.push(`${prefix} must be an object`);
            return;
        }
        if (!isIdentifier(entry.targetRef)) {
            errors.push(`${prefix}.targetRef must be a non-empty string`);
        } else if (refs.has(entry.targetRef)) {
            errors.push(`${prefix}.targetRef must be unique`);
        } else {
            refs.add(entry.targetRef);
        }
        if (typeof entry.isStage !== 'boolean') {
            errors.push(`${prefix}.isStage must be a boolean`);
        } else if (entry.isStage) {
            stageCount++;
            if (entry.targetRef !== STAGE_TARGET_REF) {
                errors.push(`${prefix}.targetRef must be "${STAGE_TARGET_REF}" for the stage`);
            }
        } else if (entry.targetRef === STAGE_TARGET_REF) {
            errors.push(`${prefix}.targetRef is reserved for the stage`);
        }
        if (!Number.isSafeInteger(entry.order) || entry.order < 0) {
            errors.push(`${prefix}.order must be a non-negative safe integer`);
        } else if (orders.has(entry.order)) {
            errors.push(`${prefix}.order must be unique`);
        } else {
            orders.add(entry.order);
        }
        if (typeof entry.name !== 'string') {
            errors.push(`${prefix}.name must be a string`);
        }
    });
    if (stageCount !== 1) errors.push('manifest must contain exactly one stage');
    return errors;
};

/**
 * Maintain stable, session-scoped target references without changing VM target
 * IDs or depending on mutable sprite names.
 */
class EntityRegistry {
    /**
     * @param {object} [options] Registry options.
     * @param {Function} [options.uuidFactory] Injectable identifier factory.
     */
    constructor (options = {}) {
        if (typeof options.uuidFactory !== 'undefined' && typeof options.uuidFactory !== 'function') {
            throw new TypeError('uuidFactory must be a function');
        }
        this.uuidFactory = options.uuidFactory || defaultUuidFactory;
        this.runtime = null;
        this.canonicalToRecord = new Map();
        this.localToCanonical = new Map();
    }

    /**
     * Remove all bindings.
     */
    clear () {
        this.runtime = null;
        this.canonicalToRecord.clear();
        this.localToCanonical.clear();
    }

    /**
     * Generate a canonical reference which is not currently registered.
     * @returns {string} New canonical target reference.
     */
    createTargetRef () {
        let targetRef;
        do {
            targetRef = `target:${this.uuidFactory()}`;
        } while (this.canonicalToRecord.has(targetRef));
        return targetRef;
    }

    /**
     * Atomically replace registry maps.
     * @param {Map<string, object>} canonicalToRecord Canonical records.
     * @param {Map<string, string>} localToCanonical Reverse records.
     * @param {object} runtime Bound runtime.
     */
    replaceBindings (canonicalToRecord, localToCanonical, runtime) {
        this.canonicalToRecord = canonicalToRecord;
        this.localToCanonical = localToCanonical;
        this.runtime = runtime;
    }

    /**
     * Add a binding to temporary or live maps after checking both directions.
     * @param {string} targetRef Canonical target reference.
     * @param {object} target Local runtime target.
     * @param {Map<string, object>} canonicalToRecord Canonical records.
     * @param {Map<string, string>} localToCanonical Reverse records.
     * @returns {string} Canonical target reference.
     */
    addBinding (targetRef, target, canonicalToRecord, localToCanonical) {
        if (!isIdentifier(targetRef)) throw new TypeError('targetRef must be a non-empty string');
        if (!target || !isIdentifier(target.id)) throw new TypeError('target.id must be a non-empty string');
        if (target.isStage && targetRef !== STAGE_TARGET_REF) {
            throw new Error(`The stage must use target reference "${STAGE_TARGET_REF}"`);
        }
        if (!target.isStage && targetRef === STAGE_TARGET_REF) {
            throw new Error(`Target reference "${STAGE_TARGET_REF}" is reserved for the stage`);
        }

        const existingRecord = canonicalToRecord.get(targetRef);
        if (existingRecord && existingRecord.localId !== target.id) {
            throw new Error(`Target reference "${targetRef}" is already registered`);
        }
        const existingRef = localToCanonical.get(target.id);
        if (existingRef && existingRef !== targetRef) {
            throw new Error(`Local target "${target.id}" is already registered as "${existingRef}"`);
        }

        canonicalToRecord.set(targetRef, {
            localId: target.id,
            name: getTargetName(target),
            isStage: Boolean(target.isStage)
        });
        localToCanonical.set(target.id, targetRef);
        return targetRef;
    }

    /**
     * Register an explicitly identified target.
     * @param {string} targetRef Canonical target reference.
     * @param {object} target Local runtime target.
     * @returns {string} Canonical target reference.
     */
    registerTarget (targetRef, target) {
        return this.addBinding(targetRef, target, this.canonicalToRecord, this.localToCanonical);
    }

    /**
     * Register a newly created local target.
     * @param {object} target Local runtime target.
     * @param {string} [targetRef] Canonical reference supplied by the operation originator.
     * @returns {string} Canonical target reference.
     */
    registerNewTarget (target, targetRef) {
        const resolvedRef = targetRef || (target && target.isStage ? STAGE_TARGET_REF : this.createTargetRef());
        return this.registerTarget(resolvedRef, target);
    }

    /**
     * Create a target manifest and bind all current original targets. Existing
     * target references are preserved when possible.
     * @param {object} [runtime] Scratch VM runtime.
     * @returns {{targets: Array<object>}} Target manifest.
     */
    createManifest (runtime = this.runtime) {
        const targets = getOriginalTargets(runtime);
        const stage = getStage(runtime);
        if (!stage) throw new Error('Cannot create a target manifest without a stage');

        const canonicalToRecord = new Map();
        const localToCanonical = new Map();
        const entries = targets.map((target, order) => {
            let targetRef = target.isStage ? STAGE_TARGET_REF : this.localToCanonical.get(target.id);
            if (!targetRef) {
                do {
                    targetRef = `target:${this.uuidFactory()}`;
                } while (canonicalToRecord.has(targetRef) || this.canonicalToRecord.has(targetRef));
            }
            this.addBinding(targetRef, target, canonicalToRecord, localToCanonical);
            return {
                targetRef,
                isStage: Boolean(target.isStage),
                order,
                name: getTargetName(target)
            };
        });

        this.replaceBindings(canonicalToRecord, localToCanonical, runtime);
        return {
            targets: entries
        };
    }

    /**
     * Bind a host-created manifest to targets produced by loading its snapshot.
     * Binding is atomic: invalid or incomplete manifests leave existing bindings
     * untouched.
     * @param {object} manifest Host target manifest.
     * @param {object} runtime Scratch VM runtime after snapshot loading.
     * @returns {EntityRegistry} This registry.
     */
    bindManifest (manifest, runtime) {
        const errors = validateManifest(manifest);
        if (errors.length > 0) throw new Error(`Invalid target manifest: ${errors.join('; ')}`);

        const targets = getOriginalTargets(runtime);
        if (targets.length !== manifest.targets.length) {
            const manifestCount = manifest.targets.length;
            const runtimeCount = targets.length;
            throw new Error(
                `Target manifest contains ${manifestCount} targets, but the runtime contains ${runtimeCount}`
            );
        }

        const stage = getStage(runtime);
        if (!stage) throw new Error('Cannot bind a target manifest without a stage');
        const localSprites = targets.filter(target => !target.isStage);
        const manifestSprites = manifest.targets
            .filter(entry => !entry.isStage)
            .sort((a, b) => a.order - b.order);
        if (localSprites.length !== manifestSprites.length) {
            throw new Error('Target manifest sprite count does not match the runtime');
        }

        const canonicalToRecord = new Map();
        const localToCanonical = new Map();
        this.addBinding(STAGE_TARGET_REF, stage, canonicalToRecord, localToCanonical);

        const unboundTargets = new Set(localSprites);
        manifestSprites.forEach((entry, spriteIndex) => {
            const targetAtOrder = localSprites[spriteIndex];
            let target = null;

            if (targetAtOrder && unboundTargets.has(targetAtOrder) &&
                getTargetName(targetAtOrder) === entry.name) {
                target = targetAtOrder;
            } else {
                const nameMatches = localSprites.filter(candidate =>
                    unboundTargets.has(candidate) && getTargetName(candidate) === entry.name
                );
                if (nameMatches.length === 1) {
                    target = nameMatches[0];
                } else if (targetAtOrder && unboundTargets.has(targetAtOrder)) {
                    target = targetAtOrder;
                }
            }

            if (!target) {
                throw new Error(
                    `Unable to bind target "${entry.name}" at sprite order ${spriteIndex}`
                );
            }
            unboundTargets.delete(target);
            this.addBinding(entry.targetRef, target, canonicalToRecord, localToCanonical);
        });

        if (unboundTargets.size > 0) throw new Error('Target manifest left runtime targets unbound');
        this.replaceBindings(canonicalToRecord, localToCanonical, runtime);
        return this;
    }

    /**
     * Resolve a canonical reference to its local VM target ID.
     * @param {string} targetRef Canonical target reference.
     * @returns {string|null} Local target ID.
     */
    resolveLocalId (targetRef) {
        const record = this.canonicalToRecord.get(targetRef);
        return record ? record.localId : null;
    }

    /**
     * Resolve a canonical reference to a local runtime target.
     * @param {string} targetRef Canonical target reference.
     * @param {object} [runtime] Runtime to search.
     * @returns {object|null} Local runtime target.
     */
    resolveTarget (targetRef, runtime = this.runtime) {
        const localId = this.resolveLocalId(targetRef);
        if (!localId || !runtime) return null;
        if (typeof runtime.getTargetById === 'function') return runtime.getTargetById(localId) || null;
        if (!Array.isArray(runtime.targets)) return null;
        return runtime.targets.find(target => target && target.id === localId) || null;
    }

    /**
     * Resolve a local target or target ID to its canonical reference.
     * @param {object|string} targetOrId Local target or its ID.
     * @returns {string|null} Canonical target reference.
     */
    getCanonicalRef (targetOrId) {
        const localId = typeof targetOrId === 'string' ? targetOrId : targetOrId && targetOrId.id;
        return this.localToCanonical.get(localId) || null;
    }

    /**
     * Update cached display metadata after a VM rename. Names are never used as
     * the primary identity once a target is bound.
     * @param {string} targetRef Canonical target reference.
     * @param {string} name New display name.
     * @returns {boolean} Whether a binding was updated.
     */
    renameTarget (targetRef, name) {
        if (typeof name !== 'string') throw new TypeError('name must be a string');
        const record = this.canonicalToRecord.get(targetRef);
        if (!record) return false;
        record.name = name;
        return true;
    }

    /**
     * Get cached target display metadata.
     * @param {string} targetRef Canonical target reference.
     * @returns {string|null} Target name.
     */
    getTargetName (targetRef) {
        const record = this.canonicalToRecord.get(targetRef);
        return record ? record.name : null;
    }

    /**
     * Remove a canonical target binding.
     * @param {string} targetRef Canonical target reference.
     * @returns {boolean} Whether a binding was removed.
     */
    removeTarget (targetRef) {
        const record = this.canonicalToRecord.get(targetRef);
        if (!record) return false;
        this.canonicalToRecord.delete(targetRef);
        this.localToCanonical.delete(record.localId);
        return true;
    }
}

export {
    STAGE_TARGET_REF,
    validateManifest
};

export default EntityRegistry;
