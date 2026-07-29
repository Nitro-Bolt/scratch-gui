const IGNORED_EVENT_TYPES = new Set([
    'ui',
    'endDrag',
    'dragOutside',
    'group_end_drag',
    'group_drag_outside'
]);

const SMOOTH_EVENT_TYPES = new Set([
    'move',
    'group_change',
    'comment_move'
]);

const DERIVED_COMMENT_MOVE_REASONS = new Set([
    'block_move'
]);

const GROUP_BLOCK_MOVE_REASON = 'group_move';
const TRANSITION_DURATION_MS = 500;
const TRANSITION_STYLE = `transform ${TRANSITION_DURATION_MS}ms`;
const SINGLE_EVENT_OPERATION = 'blockly.event';
const BATCH_EVENT_OPERATION = 'blockly.events';
const VARIABLE_EVENT_TYPES = new Set([
    'var_create',
    'var_delete',
    'var_rename'
]);
const SUPPORTED_EVENT_TYPES = new Set([
    'create',
    'change',
    'move',
    'delete',
    'var_create',
    'var_delete',
    'var_rename',
    'comment_create',
    'comment_change',
    'comment_move',
    'comment_delete',
    'group_change'
]);

/**
 * Convert the target currently selected in the VM into a collaboration target
 * reference without leaking the VM's process-local target ID.
 * @param {object} vm Scratch VM
 * @param {object} registry collaboration entity registry
 * @returns {?string} collaboration target reference
 */
const getEditingTargetReference = (vm, registry) => {
    const target = vm.editingTarget;
    return target ? registry.getCanonicalRef(target.id) : null;
};

/**
 * Blockly-specific half of live collaboration.
 *
 * Blockly events are deliberately kept out of the transport/session layer. This
 * class owns remote replay suppression, visual smoothing, and the one visual
 * workspace which is currently mounted. The VM remains the source of truth for
 * workspaces belonging to targets which are not currently selected.
 */
class BlocklyCollaborationAdapter {
    /**
     * @param {object} options adapter dependencies
     * @param {object} options.vm Scratch VM
     * @param {object} options.ScratchBlocks Scratch Blocks namespace
     * @param {object} options.workspace mounted Blockly workspace
     * @param {object} options.registry collaboration entity registry
     * @param {Function} options.submitOperation submit a local operation
     * @param {Function} [options.refreshToolbox] refresh the selected toolbox category
     */
    constructor ({
        vm,
        ScratchBlocks,
        workspace,
        registry,
        submitOperation,
        refreshToolbox
    }) {
        this.vm = vm;
        this.ScratchBlocks = ScratchBlocks;
        this.workspace = workspace;
        this.registry = registry;
        this.submitOperation = submitOperation;
        this.refreshToolbox = refreshToolbox;

        this.applyingRemote = 0;
        this.transitionTimers = new Map();
        this.pendingLocalEvents = [];
        this.localEventFlushScheduled = false;
        this.document = typeof document === 'undefined' ? null : document;
        this.handleLocalEvent = this.handleLocalEvent.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    attach () {
        this.workspace.addChangeListener(this.handleLocalEvent);
        if (this.document) {
            this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
        }
    }

    detach () {
        this.workspace.removeChangeListener(this.handleLocalEvent);
        if (this.document) {
            this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
        this._flushLocalEvents();
        this._clearAllTransitions();
    }

    /**
     * Capture a supported local Blockly event as a semantic collaboration
     * operation. Remote replay is ignored without detaching the listener.
     * @param {object} event Blockly event
     */
    handleLocalEvent (event) {
        if (this.applyingRemote || !event || IGNORED_EVENT_TYPES.has(event.type)) {
            return;
        }

        const targetId = event.targetId ?
            this.registry.getCanonicalRef(event.targetId) :
            getEditingTargetReference(this.vm, this.registry);
        if (!targetId || typeof event.toJson !== 'function') return;

        const json = event.toJson();
        const refreshToolbox = (
            event.xml?.getAttribute('type') === 'procedures_definition' ||
            event.oldXml?.getAttribute('type') === 'procedures_definition' ||
            event.element === 'mutation'
        );

        this._queueLocalEvent({
            targetId,
            json,
            refreshToolbox,
            groupId: typeof json.group === 'string' && json.group ?
                json.group : null
        });
    }

    /**
     * Apply a committed Blockly operation.
     * @param {object} operation semantic collaboration operation
     */
    apply (operation) {
        this._flushPendingBlocklyEvents();
        let target;
        let payload;
        let jsonEvents;
        let events;
        let isVisibleTarget;
        try {
            if (operation.type !== SINGLE_EVENT_OPERATION &&
                operation.type !== BATCH_EVENT_OPERATION) {
                throw new Error(`Unsupported Blockly collaboration operation: ${operation.type}`);
            }

            target = this.registry.resolveTarget(operation.targetId, this.vm.runtime);
            if (!target) {
                throw new Error(`Collaboration target does not exist: ${operation.targetId}`);
            }

            payload = operation.payload || {};
            jsonEvents = operation.type === BATCH_EVENT_OPERATION ?
                payload.events :
                [payload.event];
            if (!Array.isArray(jsonEvents) || jsonEvents.length === 0 ||
                jsonEvents.some(json => !json || typeof json.type !== 'string' ||
                    !SUPPORTED_EVENT_TYPES.has(json.type))) {
                throw new Error('Invalid Blockly collaboration event');
            }

            events = jsonEvents.map(json => {
                const event = this.ScratchBlocks.Events.fromJson(json, this.workspace);
                event.isCollaborationReplay = true;
                return event;
            });
            const editingTarget = this.vm.editingTarget;
            isVisibleTarget = Boolean(editingTarget && editingTarget.id === target.id);
            this._assertEventsCanApply(target, events, isVisibleTarget);
        } catch (error) {
            if (error && typeof error === 'object') {
                error.collaborationMutationStarted = false;
            }
            throw error;
        }

        this.applyingRemote++;
        try {
            events.forEach((event, index) => {
                this._applyEvent(target, event, jsonEvents[index], isVisibleTarget);
            });

            if (payload.refreshToolbox && isVisibleTarget && this.refreshToolbox) {
                this.refreshToolbox();
            }
        } finally {
            this.applyingRemote--;
        }
    }

    /**
     * Keep Blockly from emitting stale end-of-gesture events while a snapshot
     * replaces its workspace. The returned callback keeps replay suppression in
     * place until the VM and extension manifests have both finished loading.
     * @returns {Function} cleanup callback
     */
    prepareForSnapshot () {
        this.applyingRemote++;
        // Snapshot replacement invalidates every queued event from the old
        // workspace. Drain Scratch Blocks' delayed task and our microtask while
        // replay suppression is active so a backgrounded tab cannot submit
        // stale block, comment, or group IDs after the new project loads.
        this._flushPendingBlocklyEvents();
        this._clearAllTransitions();
        const wasVisible = typeof this.workspace.isVisible === 'function' ?
            this.workspace.isVisible() : true;
        try {
            if (typeof this.workspace.cancelCurrentGesture === 'function') {
                this.workspace.cancelCurrentGesture();
            }
            if (wasVisible && typeof this.workspace.setVisible === 'function') {
                this.workspace.setVisible(false);
            }
        } catch (error) {
            this.applyingRemote--;
            throw error;
        }
        return () => {
            try {
                if (wasVisible && typeof this.workspace.setVisible === 'function') {
                    this.workspace.setVisible(true);
                }
            } finally {
                this.applyingRemote = Math.max(0, this.applyingRemote - 1);
            }
        };
    }

    _queueLocalEvent (entry) {
        this.pendingLocalEvents.push(entry);
        if (this.localEventFlushScheduled) return;
        this.localEventFlushScheduled = true;
        Promise.resolve().then(() => this._flushLocalEvents());
    }

    _flushLocalEvents () {
        const entries = this.pendingLocalEvents;
        this.pendingLocalEvents = [];
        this.localEventFlushScheduled = false;
        let batch = null;
        const submitBatch = () => {
            if (!batch) return;
            this.submitOperation({
                type: BATCH_EVENT_OPERATION,
                targetId: batch.targetId,
                payload: {
                    events: batch.events,
                    refreshToolbox: batch.refreshToolbox
                }
            });
            batch = null;
        };

        entries.forEach(entry => {
            // Blockly uses one group ID for all events which make up a single
            // user action. Keep only contiguous events together so batching
            // cannot reorder unrelated activity which happens to reuse an ID.
            if (entry.groupId) {
                if (!batch || batch.targetId !== entry.targetId ||
                    batch.groupId !== entry.groupId) {
                    submitBatch();
                    batch = {
                        targetId: entry.targetId,
                        groupId: entry.groupId,
                        events: [],
                        refreshToolbox: false
                    };
                }
                batch.events.push(entry.json);
                batch.refreshToolbox = batch.refreshToolbox || entry.refreshToolbox;
                return;
            }

            submitBatch();
            this.submitOperation({
                type: SINGLE_EVENT_OPERATION,
                targetId: entry.targetId,
                payload: {
                    event: entry.json,
                    refreshToolbox: entry.refreshToolbox
                }
            });
        });
        submitBatch();
    }

    _flushPendingBlocklyEvents () {
        const events = this.ScratchBlocks.Events;
        if (events && Array.isArray(events.FIRE_QUEUE_) &&
            events.FIRE_QUEUE_.length > 0 &&
            typeof events.fireNow_ === 'function') {
            events.fireNow_();
        }
        this._flushLocalEvents();
    }

    /**
     * Background-tab timer throttling can leave a completed movement's CSS
     * transition installed long after its logical position changed. Clear it
     * both when hiding and restoring the tab so hit testing matches the model.
     */
    handleVisibilityChange () {
        this._clearAllTransitions();
    }

    _applyEvent (target, event, json, isVisibleTarget) {
        const isDerivedCommentMove = this._isDerivedCommentMove(event, json);
        if (isVisibleTarget) {
            this._clearPresentationForRemoval(event);
            if (!isDerivedCommentMove) this._preparePresentation(event, json);

            // An attached comment already moved when the preceding block event
            // updated its anchor. Running its final absolute-position event
            // would move the visible bubble twice. The target model still
            // consumes the event below.
            if (!isDerivedCommentMove) {
                this.ScratchBlocks.Events.disable();
                try {
                    event.run(true);
                } finally {
                    this.ScratchBlocks.Events.enable();
                }
            }
        }

        // Always update the target resolved from the operation. Using
        // vm.blockListener here would redirect through whichever sprite happens
        // to be selected locally.
        target.blocks.blocklyListen(event);
    }

    _assertEventsCanApply (target, events, isVisibleTarget) {
        const createdBlocks = new Set();
        const deletedBlocks = new Set();
        const createdComments = new Set();
        const deletedComments = new Set();
        const createdGroups = new Set();
        const deletedGroups = new Set();
        const groupBlockIds = new Map();
        const hasOwn = (object, id) => Boolean(object) &&
            Object.prototype.hasOwnProperty.call(object, id);
        const hasBlock = id => createdBlocks.has(id) ||
            (!deletedBlocks.has(id) && Boolean(target.blocks.getBlock(id)));
        const hasComment = id => createdComments.has(id) ||
            (!deletedComments.has(id) && hasOwn(target.comments, id));
        const hasGroup = id => createdGroups.has(id) ||
            (!deletedGroups.has(id) && hasOwn(target.groups, id));
        const assertVisible = (kind, id, created) => {
            if (!isVisibleTarget || created.has(id)) return;
            let entity = null;
            if (kind === 'block' && typeof this.workspace.getBlockById === 'function') {
                entity = this.workspace.getBlockById(id);
            } else if (kind === 'comment' && typeof this.workspace.getCommentById === 'function') {
                entity = this.workspace.getCommentById(id);
            } else if (kind === 'group' && typeof this.workspace.getGroupById === 'function') {
                entity = this.workspace.getGroupById(id);
            }
            if (!entity) {
                throw new Error(`Collaboration ${kind} is missing from the visible workspace: ${id}`);
            }
        };
        const assertVisibleAbsent = (kind, id) => {
            if (!isVisibleTarget) return;
            let entity = null;
            if (kind === 'block' && typeof this.workspace.getBlockById === 'function') {
                entity = this.workspace.getBlockById(id);
            } else if (kind === 'comment' && typeof this.workspace.getCommentById === 'function') {
                entity = this.workspace.getCommentById(id);
            } else if (kind === 'group' && typeof this.workspace.getGroupById === 'function') {
                entity = this.workspace.getGroupById(id);
            }
            if (entity) {
                throw new Error(`Collaboration ${kind} already exists in the visible workspace: ${id}`);
            }
        };
        const requireEntity = (kind, id, exists, created) => {
            if (!id || !exists(id)) {
                throw new Error(`Collaboration ${kind} does not exist: ${id || '(missing id)'}`);
            }
            assertVisible(kind, id, created);
        };
        const applyVariablePreflight = events.some(event =>
            VARIABLE_EVENT_TYPES.has(event.type)) ?
            this._createVariablePreflight(target, isVisibleTarget) :
            null;

        events.forEach(event => {
            if (VARIABLE_EVENT_TYPES.has(event.type)) {
                applyVariablePreflight(event);
                return;
            }

            if (event.type === 'create') {
                const ids = Array.isArray(event.ids) ? event.ids :
                    (event.blockId ? [event.blockId] : []);
                ids.forEach(id => {
                    if (hasBlock(id)) {
                        throw new Error(`Collaboration block already exists: ${id}`);
                    }
                    assertVisibleAbsent('block', id);
                    createdBlocks.add(id);
                    deletedBlocks.delete(id);
                });
                if (event.xml && typeof event.xml.getElementsByTagName === 'function') {
                    Array.from(event.xml.getElementsByTagName('comment')).forEach(comment => {
                        const id = comment.getAttribute('id');
                        if (!id || hasComment(id)) {
                            throw new Error(
                                `Collaboration comment already exists: ${id || '(missing id)'}`
                            );
                        }
                        assertVisibleAbsent('comment', id);
                        createdComments.add(id);
                        deletedComments.delete(id);
                    });
                }
                return;
            }

            if (event.type === 'change' || event.type === 'move') {
                requireEntity('block', event.blockId, hasBlock, createdBlocks);
                if (event.type === 'move' && event.newParentId) {
                    requireEntity('block', event.newParentId, hasBlock, createdBlocks);
                }
                if (event.type === 'move' && event.newCoordinate &&
                    (!Number.isFinite(event.newCoordinate.x) ||
                        !Number.isFinite(event.newCoordinate.y))) {
                    throw new Error('Collaboration block move has an invalid coordinate');
                }
                return;
            }

            if (event.type === 'delete') {
                const ids = Array.isArray(event.ids) ? event.ids :
                    (event.blockId ? [event.blockId] : []);
                ids.forEach(id => {
                    deletedBlocks.add(id);
                    createdBlocks.delete(id);
                });
                return;
            }

            if (event.type === 'comment_create') {
                if (!event.commentId || hasComment(event.commentId)) {
                    throw new Error(`Collaboration comment already exists: ${event.commentId || '(missing id)'}`);
                }
                assertVisibleAbsent('comment', event.commentId);
                if (event.blockId) {
                    requireEntity('block', event.blockId, hasBlock, createdBlocks);
                }
                createdComments.add(event.commentId);
                deletedComments.delete(event.commentId);
                return;
            }

            if (event.type === 'comment_change' || event.type === 'comment_move') {
                requireEntity('comment', event.commentId, hasComment, createdComments);
                if (event.type === 'comment_change' &&
                    (!event.newContents_ || typeof event.newContents_ !== 'object' ||
                        Array.isArray(event.newContents_))) {
                    throw new Error('Collaboration comment change has invalid contents');
                }
                if (event.type === 'comment_move' &&
                    (!event.newCoordinate_ ||
                        !Number.isFinite(event.newCoordinate_.x) ||
                        !Number.isFinite(event.newCoordinate_.y))) {
                    throw new Error('Collaboration comment move has an invalid coordinate');
                }
                return;
            }

            if (event.type === 'comment_delete') {
                if (event.commentId) {
                    deletedComments.add(event.commentId);
                    createdComments.delete(event.commentId);
                }
                return;
            }

            if (event.type === 'group_change') {
                if (!event.groupId || typeof event.groupId !== 'string') {
                    throw new Error('Collaboration group has a missing ID');
                }
                if (event.newState) {
                    const blockIds = this._assertValidGroupState(
                        event.groupId,
                        event.newState
                    );
                    const isCreation = !event.oldState;
                    if (!isCreation) {
                        requireEntity('group', event.groupId, hasGroup, createdGroups);
                    } else if (hasGroup(event.groupId)) {
                        throw new Error(`Collaboration group already exists: ${event.groupId}`);
                    } else {
                        assertVisibleAbsent('group', event.groupId);
                    }
                    let previousBlockIds = groupBlockIds.get(event.groupId);
                    if (!previousBlockIds && !isCreation) {
                        const existingGroup = target.groups[event.groupId];
                        previousBlockIds = new Set(
                            existingGroup && Array.isArray(existingGroup.blocks) ?
                                existingGroup.blocks :
                                []
                        );
                    }
                    if (!previousBlockIds) previousBlockIds = new Set();
                    blockIds
                        .filter(id => !previousBlockIds.has(id))
                        .forEach(id =>
                            requireEntity('block', id, hasBlock, createdBlocks));
                    groupBlockIds.set(event.groupId, new Set(blockIds));
                    if (isCreation) createdGroups.add(event.groupId);
                    deletedGroups.delete(event.groupId);
                } else if (event.groupId) {
                    groupBlockIds.delete(event.groupId);
                    deletedGroups.add(event.groupId);
                    createdGroups.delete(event.groupId);
                }
            }
        });
    }

    _createVariablePreflight (target, isVisibleTarget) {
        const runtime = this.vm.runtime;
        const stage = runtime && typeof runtime.getTargetForStage === 'function' ?
            runtime.getTargetForStage() : null;
        if (!stage) {
            throw new Error('Collaboration variable owner stage does not exist');
        }

        const ownerStates = new Map();
        const stateFor = owner => {
            if (!ownerStates.has(owner)) {
                const state = new Map();
                const variables = owner && owner.variables;
                if (variables && typeof variables === 'object') {
                    Object.keys(variables).forEach(id => {
                        const variable = variables[id];
                        state.set(id, {
                            id,
                            name: variable && variable.name,
                            type: variable && variable.type,
                            isCloud: Boolean(variable && variable.isCloud),
                            owner
                        });
                    });
                }
                ownerStates.set(owner, state);
            }
            return ownerStates.get(owner);
        };
        const targetState = stateFor(target);
        const stageState = stateFor(stage);
        const originalTargets = Array.isArray(runtime.targets) ?
            runtime.targets.filter(candidate => candidate && candidate.isOriginal) :
            [];
        [target, stage].forEach(owner => {
            if (owner && originalTargets.indexOf(owner) === -1) {
                originalTargets.push(owner);
            }
        });
        const uniqueOwners = owners => owners.filter((owner, index) =>
            owner && owners.indexOf(owner) === index);
        const allOwners = uniqueOwners(originalTargets);
        allOwners.forEach(stateFor);
        const ownersInScope = owner => {
            if (owner === stage) return allOwners;
            return uniqueOwners([owner, stage]);
        };
        const findById = id => {
            for (const owner of allOwners) {
                const variable = stateFor(owner).get(id);
                if (variable) return variable;
            }
            return null;
        };
        const resolveVariable = id =>
            targetState.get(id) ||
            (target === stage ? null : stageState.get(id)) ||
            null;
        const findNameConflict = (owner, name, type, excludedVariable) => {
            for (const scopeOwner of ownersInScope(owner)) {
                for (const variable of stateFor(scopeOwner).values()) {
                    if (variable !== excludedVariable &&
                        variable.name === name &&
                        variable.type === type) {
                        return variable;
                    }
                }
            }
            return null;
        };
        const assertNonEmptyString = (value, field) => {
            if (typeof value !== 'string' || !value.trim()) {
                throw new Error(`Collaboration variable has an invalid ${field}`);
            }
        };
        const assertBoolean = (value, field) => {
            if (typeof value !== 'boolean') {
                throw new Error(`Collaboration variable has an invalid ${field}`);
            }
        };
        const modifiedVariableIds = new Set();
        const assertVisibleExisting = variable => {
            if (!isVisibleTarget || modifiedVariableIds.has(variable.id) ||
                typeof this.workspace.getVariableById !== 'function') {
                return;
            }
            const visibleVariable = this.workspace.getVariableById(variable.id);
            const expectedLocal = variable.owner !== stage;
            if (!visibleVariable ||
                visibleVariable.name !== variable.name ||
                visibleVariable.type !== variable.type ||
                Boolean(visibleVariable.isLocal) !== expectedLocal ||
                Boolean(visibleVariable.isCloud) !== variable.isCloud) {
                throw new Error(
                    `Collaboration variable does not match the visible workspace: ${variable.id}`
                );
            }
        };
        const assertVisibleAbsent = id => {
            if (!isVisibleTarget || modifiedVariableIds.has(id) ||
                typeof this.workspace.getVariableById !== 'function') {
                return;
            }
            if (this.workspace.getVariableById(id)) {
                throw new Error(`Collaboration variable already exists in the visible workspace: ${id}`);
            }
        };
        const assertVisibleNameAvailable = (name, type, excludedId) => {
            if (!isVisibleTarget || typeof this.workspace.getVariable !== 'function') {
                return;
            }
            const visibleVariable = this.workspace.getVariable(name, type);
            if (!visibleVariable) return;
            const visibleId = typeof visibleVariable.getId === 'function' ?
                visibleVariable.getId() : visibleVariable.id;
            if (visibleId === excludedId || modifiedVariableIds.has(visibleId)) return;
            throw new Error(`Collaboration variable name already exists in the visible workspace: ${name}`);
        };
        const requireVariable = event => {
            assertNonEmptyString(event.varId, 'ID');
            const variable = resolveVariable(event.varId);
            if (!variable) {
                throw new Error(`Collaboration variable does not exist: ${event.varId}`);
            }
            assertVisibleExisting(variable);
            return variable;
        };
        const assertCreatePayload = event => {
            assertNonEmptyString(event.varId, 'ID');
            assertNonEmptyString(event.varName, 'name');
            if (typeof event.varType !== 'string') {
                throw new Error('Collaboration variable has an invalid type');
            }
            assertBoolean(event.isLocal, 'local flag');
            assertBoolean(event.isCloud, 'cloud flag');
            if ((event.isLocal && event.isCloud) ||
                (event.isLocal && target.isStage)) {
                throw new Error('Collaboration variable has an invalid scope');
            }
        };
        const assertDeletePayload = (event, variable) => {
            assertNonEmptyString(event.varName, 'name');
            if (typeof event.varType !== 'string') {
                throw new Error('Collaboration variable has an invalid type');
            }
            assertBoolean(event.isLocal, 'local flag');
            assertBoolean(event.isCloud, 'cloud flag');
            if (event.varName !== variable.name ||
                event.varType !== variable.type ||
                event.isLocal !== (variable.owner !== stage) ||
                event.isCloud !== variable.isCloud) {
                throw new Error(`Collaboration variable state does not match: ${event.varId}`);
            }
        };

        return event => {
            if (event.type === 'var_create') {
                assertCreatePayload(event);
                if (findById(event.varId)) {
                    throw new Error(`Collaboration variable already exists: ${event.varId}`);
                }
                const owner = event.isLocal ? target : stage;
                const nameConflict = findNameConflict(
                    owner,
                    event.varName,
                    event.varType,
                    null
                );
                if (nameConflict) {
                    throw new Error(
                        `Collaboration variable name already exists: ${event.varName}`
                    );
                }
                assertVisibleAbsent(event.varId);
                assertVisibleNameAvailable(event.varName, event.varType, null);
                stateFor(owner).set(event.varId, {
                    id: event.varId,
                    name: event.varName,
                    type: event.varType,
                    isCloud: event.isCloud,
                    owner
                });
                modifiedVariableIds.add(event.varId);
                return;
            }

            const variable = requireVariable(event);
            if (event.type === 'var_rename') {
                assertNonEmptyString(event.oldName, 'old name');
                assertNonEmptyString(event.newName, 'new name');
                if (event.oldName !== variable.name) {
                    throw new Error(`Collaboration variable state does not match: ${event.varId}`);
                }
                if (findNameConflict(
                    variable.owner,
                    event.newName,
                    variable.type,
                    variable
                )) {
                    throw new Error(
                        `Collaboration variable name already exists: ${event.newName}`
                    );
                }
                assertVisibleNameAvailable(event.newName, variable.type, event.varId);
                variable.name = event.newName;
                modifiedVariableIds.add(event.varId);
                return;
            }

            assertDeletePayload(event, variable);
            stateFor(variable.owner).delete(event.varId);
            modifiedVariableIds.add(event.varId);
        };
    }

    _assertValidGroupState (groupId, state) {
        if (!state || typeof state !== 'object' || Array.isArray(state) ||
            state.id !== groupId ||
            typeof state.title !== 'string' ||
            !(state.colour === null || typeof state.colour === 'string') ||
            typeof state.collapsed !== 'boolean' ||
            !Array.isArray(state.blocks)) {
            throw new Error(`Collaboration group state is invalid: ${groupId}`);
        }
        const numericFields = [
            'x',
            'y',
            'width',
            'height',
            'expandedWidth',
            'expandedHeight'
        ];
        if (numericFields.some(field => !Number.isFinite(state[field])) ||
            state.width < 160 ||
            state.height < (state.collapsed ? 32 : 96) ||
            state.expandedWidth < 160 ||
            state.expandedHeight < 96 ||
            state.blocks.some(id => typeof id !== 'string' || !id) ||
            new Set(state.blocks).size !== state.blocks.length) {
            throw new Error(`Collaboration group state is invalid: ${groupId}`);
        }
        return state.blocks;
    }

    _isDerivedCommentMove (event, json) {
        return event.type === 'comment_move' &&
            (DERIVED_COMMENT_MOVE_REASONS.has(event.reason) ||
                DERIVED_COMMENT_MOVE_REASONS.has(json.reason));
    }

    _preparePresentation (event, json) {
        if (!SMOOTH_EVENT_TYPES.has(event.type)) return;

        const entity = this._getVisualEntity(event);
        if (!entity) return;

        if (event.type === 'move') {
            if ((event.reason === GROUP_BLOCK_MOVE_REASON ||
                json.reason === GROUP_BLOCK_MOVE_REASON) &&
                typeof this.workspace.getGroupForBlock === 'function') {
                const group = this.workspace.getGroupForBlock(event.blockId);
                if (group && !this._isGroupAtFront(group) &&
                    typeof group.bringToFront_ === 'function') {
                    group.bringToFront_();
                }
            }
            // Reparent before setting the transition. Reparenting after movement
            // can cancel the CSS transition.
            if (typeof entity.bringToFront === 'function') entity.bringToFront();

            // Connection-only moves reparent a block rather than changing its
            // top-level transform, so smoothing them creates a misleading jump.
            if (!event.newCoordinate) return;
            this._startEntityTransition(this._getEntityKey(event), entity);

            // Scratch block comment bubbles live on the bubble canvas instead of
            // inside the block SVG. Their anchor moves during event.run(), so they
            // need their own transition installed before that happens.
            this._getAttachedComments(entity).forEach(comment => {
                this._startEntityTransition(`comment:${comment.id}`, comment);
            });
            return;
        }

        if (event.type === 'group_change') {
            if (!this._didGroupMove(event)) return;
            if (!this._isGroupAtFront(entity) &&
                typeof entity.bringToFront_ === 'function') {
                entity.bringToFront_();
            }
            this._startEntityTransition(this._getEntityKey(event), entity);
            return;
        }

        // A direct comment drag promotes the comment locally. Mirror that order
        // before applying the remote transform.
        const root = this._getSvgRoot(entity);
        if (root && root.parentNode) root.parentNode.appendChild(root);
        this._startEntityTransition(this._getEntityKey(event), entity);
    }

    _didGroupMove (event) {
        const oldState = event.oldState;
        const newState = event.newState;
        if (!oldState || !newState) return false;
        const oldX = Number(oldState.x);
        const oldY = Number(oldState.y);
        const newX = Number(newState.x);
        const newY = Number(newState.y);
        return [oldX, oldY, newX, newY].every(Number.isFinite) &&
            (oldX !== newX || oldY !== newY);
    }

    _isGroupAtFront (group) {
        if (!group || typeof this.workspace.getCanvas !== 'function') return false;
        const canvas = this.workspace.getCanvas();
        if (!canvas || !canvas.children) return false;
        const groupRoot = this._getSvgRoot(group);
        if (!groupRoot) return false;
        const blockRoots = typeof group.getOwnedTopBlocks_ === 'function' ?
            group.getOwnedTopBlocks_()
                .map(block => this._getSvgRoot(block))
                .filter(Boolean) :
            [];
        const roots = [groupRoot, ...blockRoots];
        const children = Array.from(canvas.children);
        if (children.length < roots.length) return false;
        const tail = new Set(children.slice(-roots.length));
        if (!roots.every(root => tail.has(root))) return false;
        return blockRoots.every(root =>
            children.indexOf(groupRoot) < children.indexOf(root)
        );
    }

    _getAttachedComments (block) {
        const blocks = typeof block.getDescendants === 'function' ?
            block.getDescendants(false) : [block];
        return blocks
            .map(descendant => descendant && descendant.comment)
            .filter(comment => comment && comment.id);
    }

    _startEntityTransition (key, entity) {
        const root = this._getSvgRoot(entity);
        if (!root || !root.style) return;
        this._startTransition(key, root);
    }

    _startTransition (key, root) {
        const existing = this.transitionTimers.get(key);
        let previousTransition = root.style.transition || '';
        if (existing) {
            clearTimeout(existing.timer);
            if (existing.root === root &&
                root.style.transition === existing.appliedTransition) {
                previousTransition = existing.previousTransition;
            } else {
                this._restoreTransition(existing);
            }
            this.transitionTimers.delete(key);
        }

        root.style.transition = TRANSITION_STYLE;
        // Every movable entity is promoted before replay so remote drag
        // priority matches the sender. Reparenting and changing the SVG
        // transform in the same frame gives the browser no rendered starting
        // state, which makes the transition snap. Force layout after installing
        // the transition and before event.run mutates the transform.
        if (typeof root.getBoundingClientRect === 'function') {
            root.getBoundingClientRect();
        }
        const record = {
            root,
            previousTransition,
            appliedTransition: TRANSITION_STYLE,
            timer: null
        };
        record.timer = setTimeout(() => {
            if (this.transitionTimers.get(key) !== record) return;
            this._restoreTransition(record);
            this.transitionTimers.delete(key);
        }, TRANSITION_DURATION_MS);
        this.transitionTimers.set(key, record);
    }

    _restoreTransition (record) {
        if (record.root && record.root.style &&
            record.root.style.transition === record.appliedTransition) {
            record.root.style.transition = record.previousTransition;
        }
    }

    _clearTransition (key) {
        const record = this.transitionTimers.get(key);
        if (!record) return;
        clearTimeout(record.timer);
        this._restoreTransition(record);
        this.transitionTimers.delete(key);
    }

    _clearAllTransitions () {
        for (const key of Array.from(this.transitionTimers.keys())) {
            this._clearTransition(key);
        }
    }

    _clearPresentationForRemoval (event) {
        if (event.type === 'delete') {
            const block = this.workspace.getBlockById(event.blockId);
            if (block) {
                this._getAttachedComments(block).forEach(comment => {
                    this._clearTransition(`comment:${comment.id}`);
                });
            }
            this._clearTransition(`block:${event.blockId}`);
        } else if (event.type === 'comment_delete') {
            this._clearTransition(`comment:${event.commentId}`);
        } else if (event.type === 'group_change' && !event.newState) {
            this._clearTransition(`group:${event.groupId}`);
        }
    }

    _getVisualEntity (event) {
        if (event.type === 'move') {
            return this.workspace.getBlockById(event.blockId);
        }
        if (event.type === 'group_change') {
            return this.workspace.getGroupById(event.groupId);
        }
        if (event.type === 'comment_move') {
            return this.workspace.getCommentById(event.commentId);
        }
        return null;
    }

    _getSvgRoot (entity) {
        if (typeof entity.getSvgRoot === 'function') return entity.getSvgRoot();
        // Blockly groups predate the shared movable-entity API used by blocks
        // and comments. Their rendered root is still stored directly.
        if (entity.svgGroup_) return entity.svgGroup_;
        if (entity.bubble_ && typeof entity.bubble_.getSvgRoot === 'function') {
            return entity.bubble_.getSvgRoot();
        }
        return null;
    }

    _getEntityKey (event) {
        if (event.type === 'move') return `block:${event.blockId}`;
        if (event.type === 'group_change') return `group:${event.groupId}`;
        if (event.type === 'comment_move') return `comment:${event.commentId}`;
        throw new Error(`Unsupported presentation event: ${event.type}`);
    }
}

export default BlocklyCollaborationAdapter;
