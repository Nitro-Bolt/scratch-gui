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
        this.handleLocalEvent = this.handleLocalEvent.bind(this);
    }

    attach () {
        this.workspace.addChangeListener(this.handleLocalEvent);
    }

    detach () {
        this.workspace.removeChangeListener(this.handleLocalEvent);
        for (const key of Array.from(this.transitionTimers.keys())) {
            this._clearTransition(key);
        }
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

        const targetId = getEditingTargetReference(this.vm, this.registry);
        if (!targetId || typeof event.toJson !== 'function') return;

        const json = event.toJson();
        const refreshToolbox = (
            event.xml?.getAttribute('type') === 'procedures_definition' ||
            event.oldXml?.getAttribute('type') === 'procedures_definition' ||
            event.element === 'mutation'
        );

        this.submitOperation({
            type: 'blockly.event',
            targetId,
            payload: {
                event: json,
                refreshToolbox
            }
        });
    }

    /**
     * Apply a committed Blockly operation.
     * @param {object} operation semantic collaboration operation
     */
    apply (operation) {
        if (operation.type !== 'blockly.event') {
            throw new Error(`Unsupported Blockly collaboration operation: ${operation.type}`);
        }

        const target = this.registry.resolveTarget(operation.targetId, this.vm.runtime);
        if (!target) {
            throw new Error(`Collaboration target does not exist: ${operation.targetId}`);
        }

        const json = operation.payload && operation.payload.event;
        if (!json || typeof json.type !== 'string') {
            throw new Error('Invalid Blockly collaboration event');
        }

        const event = this.ScratchBlocks.Events.fromJson(json, this.workspace);
        event.isCollaborationReplay = true;
        const editingTarget = this.vm.editingTarget;
        const isVisibleTarget = Boolean(editingTarget && editingTarget.id === target.id);
        const isDerivedCommentMove = this._isDerivedCommentMove(event, json);

        this.applyingRemote++;
        try {
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

            if (operation.payload.refreshToolbox && isVisibleTarget && this.refreshToolbox) {
                this.refreshToolbox();
            }
        } finally {
            this.applyingRemote--;
        }
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
