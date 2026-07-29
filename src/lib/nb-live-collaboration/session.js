import {EventEmitter} from 'events';

import {
    MESSAGE_KIND,
    createHelloEnvelope,
    createOperation,
    createOperationCommitEnvelope,
    createOperationProposalEnvelope,
    createOperationRejectEnvelope,
    createReadyEnvelope,
    createReplayRequestEnvelope,
    createSnapshotEnvelope,
    createSnapshotRequestEnvelope,
    defaultUuidFactory,
    validateEnvelope,
    validateOperation
} from './protocol';

const SESSION_STATE = Object.freeze({
    IDLE: 'idle',
    SYNCHRONIZING: 'synchronizing',
    READY: 'ready',
    ERROR: 'error'
});

const MAX_OPERATION_LOG = 1000;
const MAX_SNAPSHOT_APPLY_RETRIES = 2;

/**
 * Host-sequenced collaboration session layered over the existing authenticated
 * PeerJS transport.
 *
 * Only the host assigns operation sequence numbers. Clients send proposals to
 * the host and apply commits from the host, which gives every editor one causal
 * order even though the underlying connection manager still knows about peers.
 */
class CollaborationSession extends EventEmitter {
    /**
     * @param {object} options session dependencies
     * @param {object} options.connectionManager authenticated transport
     * @param {object} options.vm Scratch VM
     * @param {object} options.registry canonical target registry
     * @param {Function} options.applyOperation apply a committed remote operation
     * @param {Function} options.createExtensionManifest capture the loaded extension set
     * @param {Function} options.applyExtensionManifest reconcile the loaded extension set
     * @param {Function} [options.uuidFactory] injectable UUID factory
     */
    constructor ({
        connectionManager,
        vm,
        registry,
        applyOperation,
        createExtensionManifest,
        applyExtensionManifest,
        uuidFactory = defaultUuidFactory
    }) {
        super();
        if (typeof createExtensionManifest !== 'function' ||
            typeof applyExtensionManifest !== 'function') {
            throw new TypeError('CollaborationSession requires extension manifest callbacks');
        }
        this.connectionManager = connectionManager;
        this.vm = vm;
        this.registry = registry;
        this.applyOperation = applyOperation;
        this.createExtensionManifest = createExtensionManifest;
        this.applyExtensionManifest = applyExtensionManifest;
        this.uuidFactory = uuidFactory;

        this.state = SESSION_STATE.IDLE;
        this.sessionId = null;
        this.sequence = 0;
        this.lastAppliedSequence = 0;
        this.snapshotId = null;

        this.operationLog = new Map();
        this.bufferedCommits = new Map();
        this.optimisticOperations = new Set();
        this.optimisticOrder = [];
        this.seenOperations = new Set();
        this.readyPeers = new Set();
        this.pendingSnapshots = new Map();
        this.snapshotPromises = new Map();
        this.appliedSnapshots = new Set();
        this.seenSnapshotRequests = new Set();
        this.activeSnapshotRequests = new Map();
        this.snapshotRequestPending = null;
        this.snapshotApplyFailures = 0;
        this.replayRequestedFrom = null;

        this.incomingQueue = Promise.resolve();
        this.hostQueue = Promise.resolve();
        this.hostRemoteApplyCount = 0;
        this.hostResyncAfterRemote = false;
        this.started = false;

        this._handleRoomChange = this._handleRoomChange.bind(this);
        this._handlePeerUpgrade = this._handlePeerUpgrade.bind(this);
        this._handlePacket = this._handlePacket.bind(this);
        this._handlePeerDisconnect = this._handlePeerDisconnect.bind(this);
    }

    get ready () {
        return this.state === SESSION_STATE.READY;
    }

    start () {
        if (this.started) return;
        this.started = true;
        const manager = this.connectionManager;
        manager.on(manager.Event.ROOMCHANGE, this._handleRoomChange);
        manager.on(manager.Event.PEERUPGRADE, this._handlePeerUpgrade);
        manager.on(manager.Event.PACKET, this._handlePacket);
        manager.on(manager.Event.PEERDISCONNECT, this._handlePeerDisconnect);
        manager.on(manager.Event.CLIENTDISCONNECT, this._handlePeerDisconnect);

        if (manager.connected && manager.roomId) {
            this._enterRoom();
        }
    }

    stop () {
        if (!this.started) return;
        this.started = false;
        const manager = this.connectionManager;
        manager.off(manager.Event.ROOMCHANGE, this._handleRoomChange);
        manager.off(manager.Event.PEERUPGRADE, this._handlePeerUpgrade);
        manager.off(manager.Event.PACKET, this._handlePacket);
        manager.off(manager.Event.PEERDISCONNECT, this._handlePeerDisconnect);
        manager.off(manager.Event.CLIENTDISCONNECT, this._handlePeerDisconnect);
        this._reset();
    }

    /**
     * Submit an operation which has already been applied optimistically by the
     * local editor.
     * @param {object} draft semantic operation draft
     * @returns {?string} operation ID, or null when the session is not ready
     */
    submit (draft) {
        if (!this.ready || !draft || typeof draft.type !== 'string') return null;

        let operation;
        try {
            operation = createOperation(
                draft.type,
                typeof draft.targetId === 'undefined' ? null : draft.targetId,
                draft.payload || {},
                {uuidFactory: this.uuidFactory}
            );
        } catch (error) {
            console.error('Unable to create collaboration operation', error);
            return null;
        }

        this._trackOptimisticOperation(operation.operationId);
        if (this.connectionManager.isHost) {
            // The host editor has already applied this operation synchronously.
            // Sequence it now instead of putting it behind a proposal whose
            // remote apply may still be queued. Otherwise the commit order can
            // contradict the host's actual mutation order.
            if (this.hostRemoteApplyCount > 0) {
                this.hostResyncAfterRemote = true;
            }
            this._commitOperation(
                operation,
                this.connectionManager.peerId,
                false
            ).catch(error => this._handleQueueError('local host operation', error));
        } else {
            const envelope = createOperationProposalEnvelope({
                sessionId: this.sessionId,
                baseSequence: this.lastAppliedSequence,
                operation
            }, {uuidFactory: this.uuidFactory});
            this._sendToHost(envelope);
        }
        return operation.operationId;
    }

    _handleRoomChange (roomId) {
        if (roomId) {
            this._enterRoom();
        } else {
            this._reset();
        }
    }

    _enterRoom () {
        this._reset();
        if (this.connectionManager.isHost) {
            this.sessionId = this.uuidFactory();
            this.registry.createManifest(this.vm.runtime);
            this._setState(SESSION_STATE.READY);
            Object.values(this.connectionManager.connections || {})
                .filter(peer => peer && peer.open && peer.authenticated)
                .forEach(peer => {
                    this._queueSnapshot(peer).catch(error => {
                        console.error('Failed to synchronize existing collaboration peer', error);
                    });
                });
        } else {
            this._setState(SESSION_STATE.SYNCHRONIZING);
            if (this.connectionManager.host && this.connectionManager.host.open) {
                try {
                    this._sendToHost(createHelloEnvelope({
                        sessionId: this.connectionManager.roomId
                    }, {uuidFactory: this.uuidFactory}));
                } catch (error) {
                    console.error('Failed to request the collaboration session snapshot', error);
                }
            }
        }
    }

    _handlePeerUpgrade (peer) {
        if (!this.connectionManager.isHost || !peer || !peer.open) return;
        this.readyPeers.delete(peer.peer);
        this._queueSnapshot(peer).catch(error => {
            console.error('Failed to create collaboration snapshot', error);
            if (peer.open) peer.close();
        });
    }

    _handlePeerDisconnect (peer) {
        const peerId = typeof peer === 'string' ? peer : peer && peer.peer;
        if (!peerId) return;
        this.readyPeers.delete(peerId);
        this.pendingSnapshots.delete(peerId);
        this.snapshotPromises.delete(peerId);
        this.activeSnapshotRequests.delete(peerId);
    }

    _handlePacket (envelope, peer) {
        const validation = validateEnvelope(envelope);
        if (!validation.valid) {
            console.warn('Ignoring invalid collaboration packet', validation.errors);
            return;
        }

        this.incomingQueue = this.incomingQueue
            .then(() => this._dispatchEnvelope(envelope, peer))
            .catch(error => this._handleQueueError('incoming collaboration packet', error));
    }

    _dispatchEnvelope (envelope, peer) {
        switch (envelope.kind) {
        case MESSAGE_KIND.HELLO:
            return this._receiveHello(envelope, peer);
        case MESSAGE_KIND.SNAPSHOT:
            return this._receiveSnapshot(envelope, peer);
        case MESSAGE_KIND.SNAPSHOT_REQUEST:
            return this._receiveSnapshotRequest(envelope, peer);
        case MESSAGE_KIND.OPERATION_PROPOSAL:
            return this._receiveProposal(envelope, peer);
        case MESSAGE_KIND.OPERATION_COMMIT:
            return this._receiveCommit(envelope, peer);
        case MESSAGE_KIND.OPERATION_REJECT:
            return this._receiveRejection(envelope, peer);
        case MESSAGE_KIND.REPLAY_REQUEST:
            return this._receiveReplayRequest(envelope, peer);
        case MESSAGE_KIND.READY:
            return this._receiveReady(envelope, peer);
        default:
            return;
        }
    }

    _sendSnapshot (peer) {
        const peerId = peer && peer.peer;
        if (!peerId || !peer.open) return Promise.resolve(null);

        const inFlight = this.snapshotPromises.get(peerId);
        if (inFlight) return inFlight;

        const pending = this.pendingSnapshots.get(peerId);
        if (pending) {
            this._sendToPeer(peer, pending.envelope);
            return Promise.resolve(pending.snapshotId);
        }

        this.readyPeers.delete(peerId);
        const snapshotPromise = this._createAndSendSnapshot(peer)
            .finally(() => {
                if (this.snapshotPromises.get(peerId) === snapshotPromise) {
                    this.snapshotPromises.delete(peerId);
                }
            });
        this.snapshotPromises.set(peerId, snapshotPromise);
        return snapshotPromise;
    }

    _receiveHello (envelope, peer) {
        if (!this.connectionManager.isHost || !peer || !peer.open || !peer.authenticated) {
            return;
        }
        this.readyPeers.delete(peer.peer);
        return this._queueSnapshot(peer);
    }

    /**
     * Capture a snapshot only after every previously accepted remote proposal
     * has finished applying and received its sequence number. Calling
     * _sendSnapshot directly from within hostQueue remains intentional for
     * recovery paths, avoiding a promise-chain self-deadlock.
     * @param {object} peer destination peer
     * @returns {Promise<?string>} queued snapshot result
     */
    _queueSnapshot (peer) {
        const queued = this.hostQueue.then(() => this._sendSnapshot(peer));
        this.hostQueue = queued.catch(error => {
            console.error('Failed to process queued collaboration snapshot', error);
        });
        return queued;
    }

    async _createAndSendSnapshot (peer) {
        // _saveProjectZip captures JSON and assets synchronously before the
        // returned compression promise continues, so this sequence and manifest
        // describe the same editor state.
        const sessionId = this.sessionId;
        const baseSequence = this.sequence;
        const targetManifest = this.registry.createManifest(this.vm.runtime);
        const extensionManifest = this.createExtensionManifest();
        const projectPromise = this.vm.saveProjectSb3('uint8array');
        const projectData = await projectPromise;
        if (!peer.open || !this.connectionManager.isHost || this.sessionId !== sessionId) {
            return null;
        }

        const envelope = createSnapshotEnvelope({
            sessionId,
            baseSequence,
            projectData,
            targetManifest,
            extensionManifest
        }, {uuidFactory: this.uuidFactory});
        this.pendingSnapshots.set(peer.peer, {
            snapshotId: envelope.payload.snapshotId,
            baseSequence,
            envelope
        });
        this._sendToPeer(peer, envelope);

        // Host-local edits can be sequenced while SB3 compression is awaiting.
        // That peer was excluded from their live broadcast, so replay exactly
        // the commits newer than the synchronously captured snapshot after the
        // snapshot envelope on the same ordered data channel.
        for (let sequence = baseSequence + 1; sequence <= this.sequence; sequence++) {
            const commit = this.operationLog.get(sequence);
            if (!commit) {
                throw new Error(`Snapshot delta ${sequence} is no longer available`);
            }
            this._sendToPeer(peer, commit);
        }
        return envelope.payload.snapshotId;
    }

    async _receiveSnapshot (envelope, peer) {
        if (this.connectionManager.isHost || peer !== this.connectionManager.host) {
            console.warn('Ignoring collaboration snapshot from a non-host peer');
            return;
        }

        const snapshotKey = `${envelope.sessionId}:${envelope.payload.snapshotId}`;
        if (this.appliedSnapshots.has(snapshotKey)) {
            // A duplicate can mean the host missed READY. A snapshot which
            // predates an active recovery request must not end that recovery.
            if (!this.snapshotRequestPending && this.sessionId === envelope.sessionId) {
                this._sendReady(envelope.payload.snapshotId);
            }
            return;
        }

        if (this.sessionId && this.sessionId !== envelope.sessionId) {
            this.bufferedCommits.clear();
            this.optimisticOperations.clear();
            this.optimisticOrder.length = 0;
            this.seenOperations.clear();
            this.appliedSnapshots.clear();
            this.replayRequestedFrom = null;
            this.snapshotRequestPending = null;
        }

        this._setState(SESSION_STATE.SYNCHRONIZING);
        this.sessionId = envelope.sessionId;
        this.snapshotId = envelope.payload.snapshotId;

        try {
            await this.vm.loadProject(envelope.payload.projectData);
            this.registry.bindManifest(envelope.payload.targetManifest, this.vm.runtime);
            await this.applyExtensionManifest(envelope.payload.extensionManifest);
        } catch (error) {
            console.error('Failed to apply collaboration snapshot', error);
            this.snapshotRequestPending = null;
            const permissionDenied = error && typeof error.message === 'string' &&
                /permission|denied/i.test(error.message);
            if (!permissionDenied &&
                this.snapshotApplyFailures < MAX_SNAPSHOT_APPLY_RETRIES) {
                this.snapshotApplyFailures++;
                if (!this._requestSnapshot('snapshot-apply-failed')) {
                    this._setState(SESSION_STATE.ERROR);
                }
            } else {
                this._setState(SESSION_STATE.ERROR);
            }
            return;
        }
        this.snapshotApplyFailures = 0;
        this.lastAppliedSequence = envelope.payload.baseSequence;
        this.optimisticOperations.clear();
        this.optimisticOrder.length = 0;
        this.seenOperations.clear();

        // Discard commits already represented by the snapshot, then apply every
        // contiguous operation which arrived while project loading was in flight.
        for (const [sequence, commit] of this.bufferedCommits) {
            if (commit.sessionId !== this.sessionId || sequence <= this.lastAppliedSequence) {
                this.bufferedCommits.delete(sequence);
            }
        }
        this.snapshotRequestPending = null;
        this.appliedSnapshots.add(snapshotKey);
        while (this.appliedSnapshots.size > 32) {
            this.appliedSnapshots.delete(this.appliedSnapshots.values().next().value);
        }
        if (!await this._drainCommits()) return;

        this._sendReady(this.snapshotId);
        this._setState(SESSION_STATE.READY);
    }

    _sendReady (snapshotId) {
        this._sendToHost(createReadyEnvelope({
            sessionId: this.sessionId,
            snapshotId,
            lastAppliedSequence: this.lastAppliedSequence
        }, {uuidFactory: this.uuidFactory}));
    }

    _receiveProposal (envelope, peer) {
        if (!this.connectionManager.isHost || envelope.sessionId !== this.sessionId) return;
        if (!peer || !this.readyPeers.has(peer.peer)) {
            console.warn('Ignoring collaboration operation from a peer which is not synchronized');
            return;
        }

        const operation = envelope.payload.operation;
        const validation = validateOperation(operation);
        if (!validation.valid) return;
        const baseSequence = envelope.payload.baseSequence;
        let commitStarted = false;

        this.hostQueue = this.hostQueue
            .then(async () => {
                if (!peer.open || !this.readyPeers.has(peer.peer)) {
                    throw new Error('Collaboration peer is no longer synchronized');
                }
                // A client can legitimately have several editor events in flight
                // from one gesture. Those events all carry the last acknowledged
                // sequence and retain their arrival order as long as no other
                // participant was sequenced between them. Once another author
                // intervenes, applying an index- or position-based stale edit can
                // target the wrong entity, so recover that author from a snapshot.
                if (!this._canAcceptProposal(baseSequence, peer.peer)) {
                    throw new Error(
                        `Stale collaboration operation (host ${this.sequence}, received ${baseSequence})`
                    );
                }
                if (this.seenOperations.has(operation.operationId)) {
                    throw new Error(`Duplicate collaboration operation ID: ${operation.operationId}`);
                }
                commitStarted = true;
                this.hostRemoteApplyCount++;
                try {
                    await this._commitOperation(operation, peer.peer, true);
                } finally {
                    this.hostRemoteApplyCount--;
                }
            })
            .catch(async error => {
                console.error('Failed to apply proposed collaboration operation', error);
                if (peer.open) {
                    try {
                        const message = error && typeof error.message === 'string' ?
                            error.message :
                            '';
                        this._sendToPeer(peer, createOperationRejectEnvelope({
                            sessionId: this.sessionId,
                            operationId: operation.operationId,
                            reason: message.slice(0, 1024) || 'Operation failed',
                            lastCommittedSequence: this.sequence
                        }, {uuidFactory: this.uuidFactory}));
                    } catch (sendError) {
                        console.error('Failed to reject collaboration operation', sendError);
                    }
                }
                if (commitStarted) {
                    // applyOperation may have mutated the host before rejecting.
                    // Invalidate every ready peer and converge all of them on the
                    // resulting authoritative host state, not just the author.
                    await this._resynchronizeReadyPeers(peer);
                    this.hostResyncAfterRemote = false;
                } else {
                    // A proposal rejected before application only diverged on
                    // its optimistic author.
                    await this._sendSnapshot(peer);
                }
            })
            .then(async () => {
                if (this.hostRemoteApplyCount === 0 && this.hostResyncAfterRemote) {
                    this.hostResyncAfterRemote = false;
                    await this._resynchronizeReadyPeers();
                }
            });
    }

    async _resynchronizeReadyPeers (fallbackPeer) {
        const peerIds = Array.from(this.readyPeers);
        this.readyPeers.clear();
        const connections = this.connectionManager.connections || {};
        const peers = peerIds
            .map(peerId => connections[peerId])
            .filter(peer => peer && peer.open);
        if (fallbackPeer && fallbackPeer.open && !peers.includes(fallbackPeer)) {
            peers.push(fallbackPeer);
        }

        await Promise.all(peers.map(peer => this._sendSnapshot(peer).catch(error => {
            console.error(`Failed to resynchronize collaboration peer ${peer.peer}`, error);
        })));
    }

    async _commitOperation (operation, authorId, applyLocally) {
        if (this.seenOperations.has(operation.operationId)) return;
        if (applyLocally) await this.applyOperation(operation);

        this.seenOperations.add(operation.operationId);
        this._consumeOptimisticOperation(operation.operationId);
        this.sequence++;
        this.lastAppliedSequence = this.sequence;

        const envelope = createOperationCommitEnvelope({
            sessionId: this.sessionId,
            sequence: this.sequence,
            authorId,
            operation
        }, {uuidFactory: this.uuidFactory});
        this.operationLog.set(this.sequence, envelope);
        this._trimOperationLog();
        this._broadcastCommit(envelope);
    }

    _broadcastCommit (envelope) {
        if (this.snapshotPromises.size === 0) {
            this.connectionManager.sendToAll(this._wrap(envelope));
            return;
        }

        const eligiblePeerIds = Object.keys(this.connectionManager.connections || {})
            // pendingSnapshots is installed immediately before the snapshot is
            // sent. From that point, later commits can use the normal ordered
            // channel even if the snapshot promise's finalizer has not run yet.
            .filter(peerId => !this.snapshotPromises.has(peerId) ||
                this.pendingSnapshots.has(peerId));
        this.connectionManager.sendToList(eligiblePeerIds, this._wrap(envelope));
    }

    async _receiveCommit (envelope, peer) {
        if (this.connectionManager.isHost || peer !== this.connectionManager.host) return;
        if (this.sessionId && envelope.sessionId !== this.sessionId) return;

        const sequence = envelope.payload.sequence;
        if (sequence <= this.lastAppliedSequence) return;
        this.bufferedCommits.set(sequence, envelope);

        if (this.state !== SESSION_STATE.READY) return;
        await this._drainCommits();
    }

    async _drainCommits () {
        let nextSequence = this.lastAppliedSequence + 1;
        while (this.bufferedCommits.has(nextSequence)) {
            const envelope = this.bufferedCommits.get(nextSequence);
            const operation = envelope.payload.operation;

            if (this.optimisticOperations.has(operation.operationId)) {
                if (this.optimisticOrder[0] !== operation.operationId) {
                    this._requestSnapshot('optimistic-order-conflict', {
                        failedSequence: nextSequence,
                        failedOperationId: operation.operationId
                    });
                    return false;
                }
                this._consumeOptimisticOperation(operation.operationId);
            } else if (this.optimisticOrder.length > 0) {
                // The local editor already applied the operations in
                // optimisticOrder. Applying a remotely ordered operation ahead
                // of them would produce a different state than the host. Keep
                // this commit buffered and replace the local state atomically.
                this._requestSnapshot('optimistic-order-conflict', {
                    failedSequence: nextSequence,
                    failedOperationId: operation.operationId
                });
                return false;
            } else if (!this.seenOperations.has(operation.operationId)) {
                try {
                    await this.applyOperation(operation);
                } catch (error) {
                    console.error(
                        `Failed to apply collaboration commit ${nextSequence}; requesting a fresh snapshot`,
                        error
                    );
                    this._requestSnapshot('commit-apply-failed', {
                        failedSequence: nextSequence,
                        failedOperationId: operation.operationId
                    });
                    return false;
                }
                if (this.optimisticOrder.length > 0) {
                    // A genuine local edit can occur while an asynchronous
                    // remote media/extension operation is awaiting. Its exact
                    // interleaving is not safe to infer from completion time,
                    // so converge from the host instead of acknowledging a
                    // potentially different local order.
                    this._requestSnapshot('optimistic-during-remote-apply', {
                        failedSequence: nextSequence,
                        failedOperationId: operation.operationId
                    });
                    return false;
                }
            }
            this.bufferedCommits.delete(nextSequence);
            this.seenOperations.add(operation.operationId);
            this.lastAppliedSequence = nextSequence;
            nextSequence++;
        }

        if (this.bufferedCommits.size > 0) {
            const firstBuffered = Math.min(...this.bufferedCommits.keys());
            const missing = this.lastAppliedSequence + 1;
            if (firstBuffered > missing && this.replayRequestedFrom !== missing) {
                this.replayRequestedFrom = missing;
                this._sendToHost(createReplayRequestEnvelope({
                    sessionId: this.sessionId,
                    fromSequence: missing,
                    toSequence: firstBuffered - 1
                }, {uuidFactory: this.uuidFactory}));
            }
        } else {
            this.replayRequestedFrom = null;
        }
        return true;
    }

    _receiveRejection (envelope, peer) {
        if (this.connectionManager.isHost || peer !== this.connectionManager.host) return;
        const operationId = envelope.payload.operationId;
        this._consumeOptimisticOperation(operationId);
        console.error(`Collaboration operation was rejected: ${envelope.payload.reason}`);
        this._requestSnapshot('operation-rejected', {
            failedOperationId: operationId
        });
    }

    _requestSnapshot (reason, details = {}) {
        if (this.connectionManager.isHost || !this.sessionId || this.snapshotRequestPending) {
            return false;
        }

        this._setState(SESSION_STATE.SYNCHRONIZING);
        const envelope = createSnapshotRequestEnvelope({
            sessionId: this.sessionId,
            lastAppliedSequence: this.lastAppliedSequence,
            reason,
            failedSequence: details.failedSequence,
            failedOperationId: details.failedOperationId
        }, {uuidFactory: this.uuidFactory});
        this.snapshotRequestPending = envelope.messageId;
        try {
            this._sendToHost(envelope);
            return true;
        } catch (error) {
            this.snapshotRequestPending = null;
            console.error('Unable to request a collaboration snapshot', error);
            return false;
        }
    }

    _receiveSnapshotRequest (envelope, peer) {
        if (!this.connectionManager.isHost || envelope.sessionId !== this.sessionId ||
            !peer || !peer.open) {
            return;
        }

        const requestKey = `${peer.peer}:${envelope.messageId}`;
        if (this.seenSnapshotRequests.has(requestKey)) return;
        this.seenSnapshotRequests.add(requestKey);
        while (this.seenSnapshotRequests.size > MAX_OPERATION_LOG * 2) {
            this.seenSnapshotRequests.delete(this.seenSnapshotRequests.values().next().value);
        }

        // An in-flight snapshot is already fresh. A completed but
        // unacknowledged snapshot is retransmitted by _sendSnapshot.
        if (envelope.payload.reason === 'snapshot-apply-failed') {
            this.pendingSnapshots.delete(peer.peer);
            // A client can reject more than one independently malformed
            // snapshot. Its new request supersedes the active request which
            // produced the snapshot it just failed to apply.
            this.activeSnapshotRequests.delete(peer.peer);
        }
        if (this.activeSnapshotRequests.has(peer.peer)) return;
        this.activeSnapshotRequests.set(peer.peer, envelope.messageId);
        this.readyPeers.delete(peer.peer);
        this.hostQueue = this.hostQueue
            .then(() => this._sendSnapshot(peer))
            .catch(error => {
                this.activeSnapshotRequests.delete(peer.peer);
                console.error('Failed to send requested collaboration snapshot', error);
            });
    }

    _receiveReplayRequest (envelope, peer) {
        if (!this.connectionManager.isHost || envelope.sessionId !== this.sessionId || !peer) return;
        const from = envelope.payload.fromSequence;
        const to = typeof envelope.payload.toSequence === 'number' ?
            Math.min(envelope.payload.toSequence, this.sequence) :
            this.sequence;

        for (let sequence = from; sequence <= to; sequence++) {
            const commit = this.operationLog.get(sequence);
            if (!commit) {
                this._queueSnapshot(peer).catch(error =>
                    console.error('Failed to resynchronize collaboration peer', error));
                return;
            }
            this._sendToPeer(peer, commit);
        }
    }

    _receiveReady (envelope, peer) {
        if (!this.connectionManager.isHost || envelope.sessionId !== this.sessionId || !peer) return;
        const pending = this.pendingSnapshots.get(peer.peer);
        if (!pending || pending.snapshotId !== envelope.payload.snapshotId) return;
        if (envelope.payload.lastAppliedSequence < pending.baseSequence ||
            envelope.payload.lastAppliedSequence > this.sequence) {
            return;
        }
        this.pendingSnapshots.delete(peer.peer);
        this.activeSnapshotRequests.delete(peer.peer);
        this.readyPeers.add(peer.peer);
    }

    _sendToHost (envelope) {
        const host = this.connectionManager.host;
        if (!host || !host.open) {
            throw new Error('Collaboration host is not connected');
        }
        this._sendToPeer(host, envelope);
    }

    _sendToPeer (peer, envelope) {
        peer.send(this._wrap(envelope));
    }

    _wrap (envelope) {
        return {
            type: this.connectionManager.PacketType.PACKET,
            payload: envelope
        };
    }

    _trimOperationLog () {
        while (this.operationLog.size > MAX_OPERATION_LOG) {
            this.operationLog.delete(this.operationLog.keys().next().value);
        }
        while (this.seenOperations.size > MAX_OPERATION_LOG * 2) {
            this.seenOperations.delete(this.seenOperations.values().next().value);
        }
    }

    _canAcceptProposal (baseSequence, authorId) {
        if (baseSequence > this.sequence) return false;
        for (let sequence = baseSequence + 1; sequence <= this.sequence; sequence++) {
            const commit = this.operationLog.get(sequence);
            if (!commit || commit.payload.authorId !== authorId) return false;
        }
        return true;
    }

    _trackOptimisticOperation (operationId) {
        if (this.optimisticOperations.has(operationId)) return;
        this.optimisticOperations.add(operationId);
        this.optimisticOrder.push(operationId);
    }

    _consumeOptimisticOperation (operationId) {
        if (!this.optimisticOperations.delete(operationId)) return false;
        const index = this.optimisticOrder.indexOf(operationId);
        if (index !== -1) this.optimisticOrder.splice(index, 1);
        return true;
    }

    _setState (state) {
        if (this.state === state) return;
        this.state = state;
        this.emit('state', state);
    }

    _handleQueueError (context, error) {
        console.error(`Failed to process ${context}`, error);
        this._setState(SESSION_STATE.ERROR);
    }

    _reset () {
        this.state = SESSION_STATE.IDLE;
        this.sessionId = null;
        this.sequence = 0;
        this.lastAppliedSequence = 0;
        this.snapshotId = null;
        this.operationLog.clear();
        this.bufferedCommits.clear();
        this.optimisticOperations.clear();
        this.optimisticOrder.length = 0;
        this.seenOperations.clear();
        this.readyPeers.clear();
        this.pendingSnapshots.clear();
        this.snapshotPromises.clear();
        this.appliedSnapshots.clear();
        this.seenSnapshotRequests.clear();
        this.activeSnapshotRequests.clear();
        this.snapshotRequestPending = null;
        this.snapshotApplyFailures = 0;
        this.replayRequestedFrom = null;
        this.hostRemoteApplyCount = 0;
        this.hostResyncAfterRemote = false;
        this.registry.clear();
        this.incomingQueue = Promise.resolve();
        this.hostQueue = Promise.resolve();
    }
}

export {SESSION_STATE};
export default CollaborationSession;
