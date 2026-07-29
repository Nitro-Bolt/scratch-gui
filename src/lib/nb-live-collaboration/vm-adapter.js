const VM_OPERATION_TYPES = Object.freeze({
    SPRITE_ADD: 'sprite.add',
    SPRITE_RENAME: 'sprite.rename',
    SPRITE_DELETE: 'sprite.delete',
    SPRITE_DUPLICATE: 'sprite.duplicate',
    SPRITE_PROPERTIES_SET: 'sprite.properties.set',
    TARGET_ORDER_SET: 'target.order.set',

    COSTUME_ADD: 'costume.add',
    COSTUME_DUPLICATE: 'costume.duplicate',
    COSTUME_RENAME: 'costume.rename',
    COSTUME_DELETE: 'costume.delete',
    COSTUME_REORDER: 'costume.reorder',
    COSTUME_SET: 'costume.set',
    COSTUME_BITMAP_UPDATE: 'costume.bitmap.update',
    COSTUME_SVG_UPDATE: 'costume.svg.update',
    COSTUME_SHARE: 'costume.share',

    SOUND_ADD: 'sound.add',
    SOUND_DUPLICATE: 'sound.duplicate',
    SOUND_RENAME: 'sound.rename',
    SOUND_DELETE: 'sound.delete',
    SOUND_REORDER: 'sound.reorder',
    SOUND_BUFFER_UPDATE: 'sound.buffer.update',
    SOUND_SHARE: 'sound.share',

    ASSET_ADD: 'asset.add',
    ASSET_DUPLICATE: 'asset.duplicate',
    ASSET_RENAME: 'asset.rename',
    ASSET_DELETE: 'asset.delete',
    ASSET_REORDER: 'asset.reorder',
    ASSET_TEXT_UPDATE: 'asset.text.update',
    ASSET_SHARE: 'asset.share',

    BLOCKS_SHARE: 'blocks.share'
});

const cloneTransferValue = value => {
    if (value === null || typeof value !== 'object') return value;
    if (value instanceof ArrayBuffer) return value.slice(0);
    if (ArrayBuffer.isView(value)) {
        return new value.constructor(value);
    }
    if (Array.isArray(value)) return value.map(cloneTransferValue);

    const clone = {};
    for (const [key, item] of Object.entries(value)) {
        if (typeof item !== 'function') clone[key] = cloneTransferValue(item);
    }
    return clone;
};

/**
 * Strip renderer/audio-engine-local handles from media and include the storage
 * bytes required to reconstruct the item on another VM.
 * @param {object} item costume, sound, or custom asset
 * @returns {object} transferable media object
 */
const serializeMediaItem = item => {
    const serialized = cloneTransferValue(item);
    delete serialized.skinId;
    delete serialized.soundId;

    if (item.asset) {
        serialized.asset = {
            assetId: item.asset.assetId,
            dataFormat: item.asset.dataFormat,
            data: Array.from(item.asset.data || [])
        };
    }
    return serialized;
};

/**
 * Translate the VM's local mutation notifications into explicit semantic
 * operations and apply the same operations without dynamic method dispatch.
 */
class VMCollaborationAdapter {
    /**
     * @param {object} vm Scratch VM
     * @param {object} registry collaboration entity registry
     */
    constructor (vm, registry) {
        this.vm = vm;
        this.registry = registry;
    }

    /**
     * Convert a local PROJECT_MUTATION event into a semantic operation.
     * @param {object} mutation VM mutation notification
     * @returns {?object} operation without protocol metadata
     */
    captureMutation (mutation) {
        if (!mutation || typeof mutation.fn !== 'string' || !Array.isArray(mutation.args)) {
            return null;
        }

        const args = mutation.args;
        const targetId = this._resolveMutationTargetReference(mutation);

        switch (mutation.fn) {
        case 'addSprite':
            return {
                type: VM_OPERATION_TYPES.SPRITE_ADD,
                targetId: null,
                payload: {
                    input: cloneTransferValue(args[0]),
                    createdTargets: this._registerUnknownTargets()
                }
            };
        case 'renameSprite': {
            if (!targetId) return null;
            const operation = {
                type: VM_OPERATION_TYPES.SPRITE_RENAME,
                targetId,
                payload: {name: args[1]}
            };
            if (targetId) this.registry.renameTarget(targetId, args[1]);
            return operation;
        }
        case 'deleteSprite': {
            if (!targetId) return null;
            const operation = {
                type: VM_OPERATION_TYPES.SPRITE_DELETE,
                targetId,
                payload: {}
            };
            if (targetId) this.registry.removeTarget(targetId);
            return operation;
        }
        case 'applyDuplicatedSprite':
            if (!targetId) return null;
            return {
                type: VM_OPERATION_TYPES.SPRITE_DUPLICATE,
                targetId,
                payload: {
                    transfer: cloneTransferValue(args[0]),
                    createdTargets: this._registerUnknownTargets()
                }
            };
        case 'postSpriteInfo':
            if (!targetId) return null;
            return {
                type: VM_OPERATION_TYPES.SPRITE_PROPERTIES_SET,
                targetId,
                payload: {properties: cloneTransferValue(args[0])}
            };
        case 'reorderTarget':
            return {
                type: VM_OPERATION_TYPES.TARGET_ORDER_SET,
                targetId: null,
                payload: {
                    order: this.vm.runtime.targets
                        .map(target => this.registry.getCanonicalRef(target.id))
                        .filter(Boolean)
                }
            };
        case 'addCostume':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_ADD,
                targetId,
                {
                    md5ext: args[0],
                    item: serializeMediaItem(args[1]),
                    format: args[3]
                }
            );
        case 'addBackdrop':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_ADD,
                this._getStageReference(),
                {
                    md5ext: args[0],
                    item: serializeMediaItem(args[1])
                }
            );
        case 'duplicateCostume':
            return this._indexOperation(VM_OPERATION_TYPES.COSTUME_DUPLICATE, targetId, args[0]);
        case 'renameCostume':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_RENAME,
                targetId,
                {index: args[0], name: args[1]}
            );
        case 'deleteCostume':
            return this._indexOperation(VM_OPERATION_TYPES.COSTUME_DELETE, targetId, args[0]);
        case 'reorderCostume':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_REORDER,
                targetId,
                {index: args[1], newIndex: args[2]}
            );
        case 'setCostume':
            return this._indexOperation(VM_OPERATION_TYPES.COSTUME_SET, targetId, args[0]);
        case 'updateBitmap':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_BITMAP_UPDATE,
                targetId,
                {
                    index: args[0],
                    bitmap: cloneTransferValue(args[1]),
                    rotationCenterX: args[2],
                    rotationCenterY: args[3],
                    bitmapResolution: args[4]
                }
            );
        case 'updateSvg':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_SVG_UPDATE,
                targetId,
                {
                    index: args[0],
                    svg: args[1],
                    rotationCenterX: args[2],
                    rotationCenterY: args[3]
                }
            );
        case 'addSound':
            return this._targetOperation(
                VM_OPERATION_TYPES.SOUND_ADD,
                targetId,
                {item: serializeMediaItem(args[0])}
            );
        case 'duplicateSound':
            return this._indexOperation(VM_OPERATION_TYPES.SOUND_DUPLICATE, targetId, args[0]);
        case 'renameSound':
            return this._targetOperation(
                VM_OPERATION_TYPES.SOUND_RENAME,
                targetId,
                {index: args[0], name: args[1]}
            );
        case 'deleteSound':
            return this._indexOperation(VM_OPERATION_TYPES.SOUND_DELETE, targetId, args[0]);
        case 'reorderSound':
            return this._targetOperation(
                VM_OPERATION_TYPES.SOUND_REORDER,
                targetId,
                {index: args[1], newIndex: args[2]}
            );
        case 'updateSoundBuffer':
            return this._targetOperation(
                VM_OPERATION_TYPES.SOUND_BUFFER_UPDATE,
                targetId,
                {
                    index: args[0],
                    buffer: cloneTransferValue(args[1]),
                    encoding: cloneTransferValue(args[2])
                }
            );
        case 'addAsset':
            return this._targetOperation(
                VM_OPERATION_TYPES.ASSET_ADD,
                targetId,
                {item: serializeMediaItem(args[0])}
            );
        case 'duplicateAsset':
            return this._indexOperation(VM_OPERATION_TYPES.ASSET_DUPLICATE, targetId, args[0]);
        case 'renameAsset':
            return this._targetOperation(
                VM_OPERATION_TYPES.ASSET_RENAME,
                targetId,
                {index: args[0], name: args[1], extension: args[2]}
            );
        case 'deleteAsset':
            return this._indexOperation(VM_OPERATION_TYPES.ASSET_DELETE, targetId, args[0]);
        case 'reorderAsset':
            return this._targetOperation(
                VM_OPERATION_TYPES.ASSET_REORDER,
                targetId,
                {index: args[1], newIndex: args[2]}
            );
        case 'updateTextAsset':
            return this._targetOperation(
                VM_OPERATION_TYPES.ASSET_TEXT_UPDATE,
                targetId,
                {index: args[0], value: args[1]}
            );
        case 'applySharedCostumeToTarget':
            return this._targetOperation(
                VM_OPERATION_TYPES.COSTUME_SHARE,
                targetId,
                {transfer: cloneTransferValue(args[0])}
            );
        case 'applySharedSoundToTarget':
            return this._targetOperation(
                VM_OPERATION_TYPES.SOUND_SHARE,
                targetId,
                {transfer: cloneTransferValue(args[0])}
            );
        case 'applySharedAssetToTarget':
            return this._targetOperation(
                VM_OPERATION_TYPES.ASSET_SHARE,
                targetId,
                {transfer: cloneTransferValue(args[0])}
            );
        case 'applySharedBlocksToTarget':
            return this._targetOperation(
                VM_OPERATION_TYPES.BLOCKS_SHARE,
                targetId,
                {transfer: cloneTransferValue(args[0])}
            );
        default:
            // Unknown VM methods are intentionally not forwarded. Adding a mutation
            // requires an explicit capture and apply implementation in this file.
            return null;
        }
    }

    /**
     * Apply one explicit VM operation.
     * @param {object} operation semantic collaboration operation
     * @returns {Promise<*>} handler result
     */
    apply (operation) {
        const payload = operation.payload || {};
        const target = operation.targetId ?
            this.registry.resolveTarget(operation.targetId, this.vm.runtime) :
            null;

        switch (operation.type) {
        case VM_OPERATION_TYPES.SPRITE_ADD:
            return this._applyCreatingTargets(operation, () =>
                this.vm.addSprite(cloneTransferValue(payload.input), false));
        case VM_OPERATION_TYPES.SPRITE_RENAME:
            this._requireTarget(operation, target);
            this.vm.renameSprite(target.id, payload.name, false, target);
            this.registry.renameTarget(operation.targetId, payload.name);
            return;
        case VM_OPERATION_TYPES.SPRITE_DELETE:
            this._requireTarget(operation, target);
            this.vm.deleteSprite(target.id, false, target);
            this.registry.removeTarget(operation.targetId);
            return;
        case VM_OPERATION_TYPES.SPRITE_DUPLICATE:
            this._requireTarget(operation, target);
            return this._applyCreatingTargets(operation, () =>
                this.vm.applyDuplicatedSprite(
                    cloneTransferValue(payload.transfer),
                    false,
                    target
                ));
        case VM_OPERATION_TYPES.SPRITE_PROPERTIES_SET:
            this._requireTarget(operation, target);
            this.vm.postSpriteInfo(payload.properties, false, target);
            return;
        case VM_OPERATION_TYPES.TARGET_ORDER_SET:
            this._applyTargetOrder(payload.order);
            return;
        case VM_OPERATION_TYPES.COSTUME_ADD:
            this._requireTarget(operation, target);
            return this.vm.addCostume(
                payload.md5ext || `${payload.item.assetId}.${payload.item.dataFormat}`,
                cloneTransferValue(payload.item),
                null,
                payload.format,
                false,
                target
            );
        case VM_OPERATION_TYPES.COSTUME_DUPLICATE:
            this._requireTarget(operation, target);
            return this.vm.duplicateCostume(payload.index, false, target);
        case VM_OPERATION_TYPES.COSTUME_RENAME:
            this._requireTarget(operation, target);
            this.vm.renameCostume(payload.index, payload.name, false, target);
            return;
        case VM_OPERATION_TYPES.COSTUME_DELETE:
            this._requireTarget(operation, target);
            this.vm.deleteCostume(payload.index, false, target);
            return;
        case VM_OPERATION_TYPES.COSTUME_REORDER:
            this._requireTarget(operation, target);
            this.vm.reorderCostume(null, payload.index, payload.newIndex, false, target);
            return;
        case VM_OPERATION_TYPES.COSTUME_SET:
            this._requireTarget(operation, target);
            this.vm.setCostume(payload.index, false, target);
            return;
        case VM_OPERATION_TYPES.COSTUME_BITMAP_UPDATE:
            this._requireTarget(operation, target);
            return this.vm.updateBitmap(
                payload.index,
                cloneTransferValue(payload.bitmap),
                payload.rotationCenterX,
                payload.rotationCenterY,
                payload.bitmapResolution,
                false,
                target
            );
        case VM_OPERATION_TYPES.COSTUME_SVG_UPDATE:
            this._requireTarget(operation, target);
            return this.vm.updateSvg(
                payload.index,
                payload.svg,
                payload.rotationCenterX,
                payload.rotationCenterY,
                false,
                target
            );
        case VM_OPERATION_TYPES.COSTUME_SHARE:
            this._requireTarget(operation, target);
            return this.vm.applySharedCostumeToTarget(
                cloneTransferValue(payload.transfer),
                false,
                target
            );
        case VM_OPERATION_TYPES.SOUND_ADD:
            this._requireTarget(operation, target);
            return this.vm.addSound(cloneTransferValue(payload.item), null, false, target);
        case VM_OPERATION_TYPES.SOUND_DUPLICATE:
            this._requireTarget(operation, target);
            return this.vm.duplicateSound(payload.index, false, target);
        case VM_OPERATION_TYPES.SOUND_RENAME:
            this._requireTarget(operation, target);
            this.vm.renameSound(payload.index, payload.name, false, target);
            return;
        case VM_OPERATION_TYPES.SOUND_DELETE:
            this._requireTarget(operation, target);
            this.vm.deleteSound(payload.index, false, target);
            return;
        case VM_OPERATION_TYPES.SOUND_REORDER:
            this._requireTarget(operation, target);
            this.vm.reorderSound(null, payload.index, payload.newIndex, false, target);
            return;
        case VM_OPERATION_TYPES.SOUND_BUFFER_UPDATE:
            this._requireTarget(operation, target);
            this.vm.updateSoundBuffer(
                payload.index,
                cloneTransferValue(payload.buffer),
                cloneTransferValue(payload.encoding),
                false,
                target
            );
            return;
        case VM_OPERATION_TYPES.SOUND_SHARE:
            this._requireTarget(operation, target);
            return this.vm.applySharedSoundToTarget(
                cloneTransferValue(payload.transfer),
                false,
                target
            );
        case VM_OPERATION_TYPES.ASSET_ADD:
            this._requireTarget(operation, target);
            return this.vm.addAsset(cloneTransferValue(payload.item), null, false, target);
        case VM_OPERATION_TYPES.ASSET_DUPLICATE:
            this._requireTarget(operation, target);
            return this.vm.duplicateAsset(payload.index, false, target);
        case VM_OPERATION_TYPES.ASSET_RENAME:
            this._requireTarget(operation, target);
            this.vm.renameAsset(payload.index, payload.name, payload.extension, false, target);
            return;
        case VM_OPERATION_TYPES.ASSET_DELETE:
            this._requireTarget(operation, target);
            this.vm.deleteAsset(payload.index, false, target);
            return;
        case VM_OPERATION_TYPES.ASSET_REORDER:
            this._requireTarget(operation, target);
            this.vm.reorderAsset(null, payload.index, payload.newIndex, false, target);
            return;
        case VM_OPERATION_TYPES.ASSET_TEXT_UPDATE:
            this._requireTarget(operation, target);
            this.vm.updateTextAsset(payload.index, payload.value, false, target);
            return;
        case VM_OPERATION_TYPES.ASSET_SHARE:
            this._requireTarget(operation, target);
            return this.vm.applySharedAssetToTarget(
                cloneTransferValue(payload.transfer),
                false,
                target
            );
        case VM_OPERATION_TYPES.BLOCKS_SHARE:
            this._requireTarget(operation, target);
            return this.vm.applySharedBlocksToTarget(
                cloneTransferValue(payload.transfer),
                false,
                target
            );
        default:
            throw new Error(`Unsupported VM collaboration operation: ${operation.type}`);
        }
    }

    _resolveMutationTargetReference (mutation) {
        if (!mutation.targetId) return null;
        return this.registry.getCanonicalRef(mutation.targetId);
    }

    _registerUnknownTargets () {
        const createdTargets = [];
        this.vm.runtime.targets.forEach((target, index) => {
            if (!target.isStage && !target.isOriginal) return;
            if (this.registry.getCanonicalRef(target.id)) return;
            const id = this.registry.createTargetRef();
            this.registry.registerTarget(id, target);
            createdTargets.push({
                id,
                name: target.isStage ? '_stage_' : target.getName(),
                isStage: target.isStage,
                index
            });
        });
        return createdTargets;
    }

    _targetOperation (type, targetId, payload) {
        if (!targetId) return null;
        return {type, targetId, payload};
    }

    _indexOperation (type, targetId, index) {
        return this._targetOperation(type, targetId, {index});
    }

    _getStageReference () {
        const stage = this.vm.runtime.getTargetForStage();
        return stage ? this.registry.getCanonicalRef(stage.id) : null;
    }

    _requireTarget (operation, target) {
        if (!target) {
            throw new Error(`Collaboration target does not exist: ${operation.targetId}`);
        }
    }

    async _applyCreatingTargets (operation, apply) {
        const before = new Set(this.vm.runtime.targets.map(target => target.id));
        const result = await apply();
        const created = this.vm.runtime.targets.filter(target => !before.has(target.id));
        const metadata = operation.payload.createdTargets || [];

        metadata.forEach((item, index) => {
            let target = created[index];
            if (!target && item.isStage) {
                target = this.vm.runtime.getTargetForStage();
            }
            if (!target && item.name && item.name !== '_stage_') {
                target = this.vm.runtime.getSpriteTargetByName(item.name);
            }
            if (!target) {
                throw new Error(`Created collaboration target was not found: ${item.id}`);
            }
            this.registry.registerTarget(item.id, target);
        });
        return result;
    }

    _applyTargetOrder (order) {
        if (!Array.isArray(order)) throw new Error('Invalid collaboration target order');
        const mentioned = [];
        for (const targetId of order) {
            const target = this.registry.resolveTarget(targetId, this.vm.runtime);
            if (target && !mentioned.includes(target)) mentioned.push(target);
        }
        const unmentioned = this.vm.runtime.targets.filter(target => !mentioned.includes(target));
        this.vm.runtime.targets = mentioned.concat(unmentioned);
        this.vm.emitTargetsUpdate();
    }
}

export {
    VM_OPERATION_TYPES,
    cloneTransferValue,
    serializeMediaItem
};

export default VMCollaborationAdapter;
