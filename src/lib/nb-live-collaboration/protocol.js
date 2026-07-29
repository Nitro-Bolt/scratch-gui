const PROTOCOL_ID = 'nitrobolt-collaboration';

const MESSAGE_KIND = Object.freeze({
    HELLO: 'session.hello',
    SNAPSHOT: 'snapshot',
    SNAPSHOT_REQUEST: 'snapshot.request',
    OPERATION_PROPOSAL: 'operation.proposal',
    OPERATION_COMMIT: 'operation.commit',
    OPERATION_REJECT: 'operation.reject',
    REPLAY_REQUEST: 'operation.replay-request',
    READY: 'snapshot.ready'
});

const MESSAGE_KINDS = new Set(Object.keys(MESSAGE_KIND).map(key => MESSAGE_KIND[key]));
const OPERATION_TYPE_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const SHA_256_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * Error thrown when local code attempts to construct or assert an invalid
 * collaboration protocol value.
 */
class ProtocolValidationError extends Error {
    /**
     * @param {string} message Error description.
     * @param {Array<string>} errors Individual validation errors.
     */
    constructor (message, errors) {
        super(message);
        this.name = 'ProtocolValidationError';
        this.errors = errors;
    }
}

/**
 * Generate an identifier using the browser's cryptographically secure UUID
 * implementation.
 * @returns {string} A new UUID.
 */
const defaultUuidFactory = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    throw new Error('crypto.randomUUID is unavailable; provide a uuidFactory');
};

/**
 * @param {*} value Value to inspect.
 * @returns {boolean} Whether the value is a plain record.
 */
const isPlainObject = value => {
    if (value === null || typeof value !== 'object') return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

/**
 * @param {*} value Value to inspect.
 * @returns {boolean} Whether the value is binary project data.
 */
const isBinary = value => (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
);

/**
 * @param {*} value Value to inspect.
 * @returns {boolean} Whether the value is a non-empty string.
 */
const isIdentifier = value => typeof value === 'string' && value.length > 0 && value.length <= 256;

/**
 * @param {*} value Value to inspect.
 * @returns {boolean} Whether the value is a valid protocol sequence.
 */
const isSequence = value => Number.isSafeInteger(value) && value >= 0;

/**
 * @param {*} value Binary value.
 * @returns {number} Byte length of the value.
 */
const getByteLength = value => {
    if (value instanceof ArrayBuffer) return value.byteLength;
    return value.byteLength;
};

/**
 * @param {Array<string>} errors Destination error list.
 * @param {boolean} condition Required condition.
 * @param {string} message Error to add when the condition is false.
 */
const requireCondition = (errors, condition, message) => {
    if (!condition) errors.push(message);
};

/**
 * Validate the common collaboration operation shape. Operation-specific
 * payload validation belongs to the explicit operation handler registry.
 * @param {*} operation Value to validate.
 * @returns {{valid: boolean, errors: Array<string>}} Validation result.
 */
const validateOperation = operation => {
    const errors = [];
    if (!isPlainObject(operation)) {
        return {
            valid: false,
            errors: ['operation must be a plain object']
        };
    }

    requireCondition(errors, isIdentifier(operation.operationId),
        'operation.operationId must be a non-empty string');
    requireCondition(errors,
        typeof operation.type === 'string' &&
        operation.type.length <= 128 &&
        OPERATION_TYPE_PATTERN.test(operation.type),
        'operation.type must be a namespaced operation type');
    requireCondition(errors,
        operation.targetId === null || isIdentifier(operation.targetId),
        'operation.targetId must be null or a non-empty string');
    requireCondition(errors, isPlainObject(operation.payload),
        'operation.payload must be a plain object');

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Assert that an operation is valid.
 * @param {*} operation Operation to validate.
 * @returns {object} The validated operation.
 * @throws {ProtocolValidationError} If the operation is invalid.
 */
const assertValidOperation = operation => {
    const result = validateOperation(operation);
    if (!result.valid) {
        throw new ProtocolValidationError(
            `Invalid collaboration operation: ${result.errors.join('; ')}`,
            result.errors
        );
    }
    return operation;
};

/**
 * Validate the payload for one known message kind.
 * @param {string} kind Protocol message kind.
 * @param {*} payload Payload to validate.
 * @returns {Array<string>} Payload errors.
 */
const validatePayload = (kind, payload) => {
    const errors = [];
    if (!isPlainObject(payload)) return ['envelope.payload must be a plain object'];

    switch (kind) {
    case MESSAGE_KIND.HELLO:
        break;
    case MESSAGE_KIND.SNAPSHOT:
        requireCondition(errors, isIdentifier(payload.snapshotId),
            'snapshot.snapshotId must be a non-empty string');
        requireCondition(errors, isSequence(payload.baseSequence),
            'snapshot.baseSequence must be a non-negative safe integer');
        requireCondition(errors, isSequence(payload.catchUpSequence),
            'snapshot.catchUpSequence must be a non-negative safe integer');
        if (isSequence(payload.baseSequence) && isSequence(payload.catchUpSequence)) {
            requireCondition(errors, payload.catchUpSequence >= payload.baseSequence,
                'snapshot.catchUpSequence must not precede baseSequence');
        }
        requireCondition(errors, isBinary(payload.projectData) && getByteLength(payload.projectData) > 0,
            'snapshot.projectData must contain binary project data');
        requireCondition(errors, isPlainObject(payload.targetManifest),
            'snapshot.targetManifest must be a plain object');
        requireCondition(errors, isPlainObject(payload.extensionManifest),
            'snapshot.extensionManifest must be a plain object');
        if (Object.prototype.hasOwnProperty.call(payload, 'sha256')) {
            requireCondition(errors,
                typeof payload.sha256 === 'string' && SHA_256_PATTERN.test(payload.sha256),
                'snapshot.sha256 must be a hexadecimal SHA-256 digest');
        }
        break;
    case MESSAGE_KIND.SNAPSHOT_REQUEST:
        requireCondition(errors, isSequence(payload.lastAppliedSequence),
            'snapshotRequest.lastAppliedSequence must be a non-negative safe integer');
        requireCondition(errors,
            typeof payload.reason === 'string' && payload.reason.length > 0 && payload.reason.length <= 128,
            'snapshotRequest.reason must be a non-empty string');
        if (Object.prototype.hasOwnProperty.call(payload, 'failedSequence')) {
            requireCondition(errors, isSequence(payload.failedSequence),
                'snapshotRequest.failedSequence must be a non-negative safe integer');
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'failedOperationId')) {
            requireCondition(errors, isIdentifier(payload.failedOperationId),
                'snapshotRequest.failedOperationId must be a non-empty string');
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'currentSnapshotId')) {
            requireCondition(errors, isIdentifier(payload.currentSnapshotId),
                'snapshotRequest.currentSnapshotId must be a non-empty string');
        }
        break;
    case MESSAGE_KIND.OPERATION_PROPOSAL: {
        requireCondition(errors, isSequence(payload.baseSequence),
            'proposal.baseSequence must be a non-negative safe integer');
        const operationResult = validateOperation(payload.operation);
        errors.push(...operationResult.errors.map(error => `proposal.${error}`));
        break;
    }
    case MESSAGE_KIND.OPERATION_COMMIT: {
        requireCondition(errors, isSequence(payload.sequence),
            'commit.sequence must be a non-negative safe integer');
        requireCondition(errors, isIdentifier(payload.authorId),
            'commit.authorId must be a non-empty string');
        const operationResult = validateOperation(payload.operation);
        errors.push(...operationResult.errors.map(error => `commit.${error}`));
        break;
    }
    case MESSAGE_KIND.OPERATION_REJECT:
        requireCondition(errors, isIdentifier(payload.operationId),
            'reject.operationId must be a non-empty string');
        requireCondition(errors,
            typeof payload.reason === 'string' && payload.reason.length > 0 && payload.reason.length <= 1024,
            'reject.reason must be a non-empty string');
        requireCondition(errors, typeof payload.willResynchronize === 'boolean',
            'reject.willResynchronize must be a boolean');
        if (Object.prototype.hasOwnProperty.call(payload, 'lastCommittedSequence')) {
            requireCondition(errors, isSequence(payload.lastCommittedSequence),
                'reject.lastCommittedSequence must be a non-negative safe integer');
        }
        break;
    case MESSAGE_KIND.REPLAY_REQUEST:
        requireCondition(errors, isSequence(payload.fromSequence),
            'replayRequest.fromSequence must be a non-negative safe integer');
        if (Object.prototype.hasOwnProperty.call(payload, 'toSequence')) {
            requireCondition(errors, isSequence(payload.toSequence),
                'replayRequest.toSequence must be a non-negative safe integer');
            if (isSequence(payload.fromSequence) && isSequence(payload.toSequence)) {
                requireCondition(errors, payload.toSequence >= payload.fromSequence,
                    'replayRequest.toSequence must not precede fromSequence');
            }
        }
        break;
    case MESSAGE_KIND.READY:
        requireCondition(errors, isIdentifier(payload.snapshotId),
            'ready.snapshotId must be a non-empty string');
        requireCondition(errors, isSequence(payload.lastAppliedSequence),
            'ready.lastAppliedSequence must be a non-negative safe integer');
        break;
    default:
        errors.push('envelope.kind is not supported');
    }

    return errors;
};

/**
 * Validate a collaboration envelope and its kind-specific payload.
 * @param {*} envelope Value to validate.
 * @returns {{valid: boolean, errors: Array<string>}} Validation result.
 */
const validateEnvelope = envelope => {
    const errors = [];
    if (!isPlainObject(envelope)) {
        return {
            valid: false,
            errors: ['envelope must be a plain object']
        };
    }

    requireCondition(errors, envelope.protocol === PROTOCOL_ID,
        `envelope.protocol must be "${PROTOCOL_ID}"`);
    requireCondition(errors, MESSAGE_KINDS.has(envelope.kind),
        'envelope.kind must be a supported message kind');
    requireCondition(errors, isIdentifier(envelope.messageId),
        'envelope.messageId must be a non-empty string');
    requireCondition(errors, isIdentifier(envelope.sessionId),
        'envelope.sessionId must be a non-empty string');

    if (MESSAGE_KINDS.has(envelope.kind)) {
        errors.push(...validatePayload(envelope.kind, envelope.payload));
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Assert that an envelope is valid.
 * @param {*} envelope Envelope to validate.
 * @returns {object} The validated envelope.
 * @throws {ProtocolValidationError} If the envelope is invalid.
 */
const assertValidEnvelope = envelope => {
    const result = validateEnvelope(envelope);
    if (!result.valid) {
        throw new ProtocolValidationError(
            `Invalid collaboration envelope: ${result.errors.join('; ')}`,
            result.errors
        );
    }
    return envelope;
};

/**
 * Resolve an explicitly supplied ID or create one using the injected factory.
 * @param {string|undefined} explicitId Explicit identifier.
 * @param {Function|undefined} uuidFactory Identifier factory.
 * @returns {string} Resolved identifier.
 */
const resolveId = (explicitId, uuidFactory) => {
    if (typeof explicitId !== 'undefined') return explicitId;
    const factory = uuidFactory || defaultUuidFactory;
    if (typeof factory !== 'function') throw new TypeError('uuidFactory must be a function');
    return factory();
};

/**
 * Create and validate a protocol envelope.
 * @param {string} kind Message kind.
 * @param {object} payload Kind-specific payload.
 * @param {object} options Envelope options.
 * @param {string} options.sessionId Collaboration session identifier.
 * @param {string} [options.messageId] Explicit message identifier.
 * @param {Function} [options.uuidFactory] Injectable identifier factory.
 * @returns {object} Valid collaboration envelope.
 */
const createEnvelope = (kind, payload, options = {}) => assertValidEnvelope({
    protocol: PROTOCOL_ID,
    kind,
    messageId: resolveId(options.messageId, options.uuidFactory),
    sessionId: options.sessionId,
    payload
});

/**
 * Create and validate a collaboration operation.
 * @param {string} type Namespaced operation type.
 * @param {string|null} targetId Canonical target reference, or null for a global operation.
 * @param {object} payload Operation-specific payload.
 * @param {object} [options] Operation options.
 * @param {string} [options.operationId] Explicit operation identifier.
 * @param {Function} [options.uuidFactory] Injectable identifier factory.
 * @returns {object} Valid collaboration operation.
 */
const createOperation = (type, targetId, payload, options = {}) => assertValidOperation({
    operationId: resolveId(options.operationId, options.uuidFactory),
    type,
    targetId,
    payload
});

/**
 * Ask the host for the current session snapshot. This is sent when a
 * collaboration controller starts on an already-authenticated connection.
 * @param {object} hello Hello fields.
 * @param {string} hello.sessionId Room-scoped placeholder or known session ID.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid hello envelope.
 */
const createHelloEnvelope = (hello, options = {}) => createEnvelope(
    MESSAGE_KIND.HELLO,
    {},
    {
        sessionId: hello.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    }
);

/**
 * Create a project snapshot envelope.
 * @param {object} snapshot Snapshot fields.
 * @param {string} snapshot.sessionId Collaboration session identifier.
 * @param {number} snapshot.baseSequence Sequence represented by the snapshot.
 * @param {number} snapshot.catchUpSequence Fixed sequence sent after the snapshot before readiness.
 * @param {ArrayBuffer|ArrayBufferView} snapshot.projectData Serialized SB3 bytes.
 * @param {object} snapshot.targetManifest Canonical target manifest.
 * @param {object} snapshot.extensionManifest Ordered loaded-extension manifest.
 * @param {string} [snapshot.snapshotId] Explicit snapshot identifier.
 * @param {string} [snapshot.sha256] Optional project digest.
 * @param {object} [options] Creation options.
 * @param {string} [options.messageId] Explicit message identifier.
 * @param {Function} [options.uuidFactory] Injectable identifier factory.
 * @returns {object} Valid snapshot envelope.
 */
const createSnapshotEnvelope = (snapshot, options = {}) => {
    const payload = {
        snapshotId: resolveId(snapshot.snapshotId, options.uuidFactory),
        baseSequence: snapshot.baseSequence,
        catchUpSequence: snapshot.catchUpSequence,
        projectData: snapshot.projectData,
        targetManifest: snapshot.targetManifest,
        extensionManifest: snapshot.extensionManifest
    };
    if (typeof snapshot.sha256 !== 'undefined') payload.sha256 = snapshot.sha256;
    return createEnvelope(MESSAGE_KIND.SNAPSHOT, payload, {
        sessionId: snapshot.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    });
};

/**
 * Request a fresh authoritative project snapshot.
 * @param {object} request Snapshot request fields.
 * @param {string} request.sessionId Collaboration session identifier.
 * @param {number} request.lastAppliedSequence Last sequence applied successfully.
 * @param {string} request.reason Machine-stable recovery reason.
 * @param {number} [request.failedSequence] Sequence which could not be applied.
 * @param {string} [request.failedOperationId] Operation which could not be applied.
 * @param {string} [request.currentSnapshotId] Snapshot currently loaded or being replaced.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid snapshot request envelope.
 */
const createSnapshotRequestEnvelope = (request, options = {}) => {
    const payload = {
        lastAppliedSequence: request.lastAppliedSequence,
        reason: request.reason
    };
    if (typeof request.failedSequence !== 'undefined') {
        payload.failedSequence = request.failedSequence;
    }
    if (typeof request.failedOperationId !== 'undefined') {
        payload.failedOperationId = request.failedOperationId;
    }
    if (typeof request.currentSnapshotId !== 'undefined') {
        payload.currentSnapshotId = request.currentSnapshotId;
    }
    return createEnvelope(MESSAGE_KIND.SNAPSHOT_REQUEST, payload, {
        sessionId: request.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    });
};

/**
 * Create an operation proposal envelope.
 * @param {object} proposal Proposal fields.
 * @param {string} proposal.sessionId Collaboration session identifier.
 * @param {number} proposal.baseSequence Sequence the author last applied.
 * @param {object} proposal.operation Proposed operation.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid proposal envelope.
 */
const createOperationProposalEnvelope = (proposal, options = {}) => createEnvelope(
    MESSAGE_KIND.OPERATION_PROPOSAL,
    {
        baseSequence: proposal.baseSequence,
        operation: proposal.operation
    },
    {
        sessionId: proposal.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    }
);

/**
 * Create an operation commit envelope.
 * @param {object} commit Commit fields.
 * @param {string} commit.sessionId Collaboration session identifier.
 * @param {number} commit.sequence Host-assigned sequence.
 * @param {string} commit.authorId Original author's peer identifier.
 * @param {object} commit.operation Committed operation.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid commit envelope.
 */
const createOperationCommitEnvelope = (commit, options = {}) => createEnvelope(
    MESSAGE_KIND.OPERATION_COMMIT,
    {
        sequence: commit.sequence,
        authorId: commit.authorId,
        operation: commit.operation
    },
    {
        sessionId: commit.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    }
);

/**
 * Create an operation rejection envelope.
 * @param {object} rejection Rejection fields.
 * @param {string} rejection.sessionId Collaboration session identifier.
 * @param {string} rejection.operationId Rejected operation identifier.
 * @param {string} rejection.reason Human-readable or machine-stable rejection reason.
 * @param {boolean} rejection.willResynchronize Whether the host will send an authoritative snapshot.
 * @param {number} [rejection.lastCommittedSequence] Host sequence at rejection time.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid rejection envelope.
 */
const createOperationRejectEnvelope = (rejection, options = {}) => {
    const payload = {
        operationId: rejection.operationId,
        reason: rejection.reason,
        willResynchronize: rejection.willResynchronize
    };
    if (typeof rejection.lastCommittedSequence !== 'undefined') {
        payload.lastCommittedSequence = rejection.lastCommittedSequence;
    }
    return createEnvelope(MESSAGE_KIND.OPERATION_REJECT, payload, {
        sessionId: rejection.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    });
};

/**
 * Create a replay request envelope.
 * @param {object} request Replay request fields.
 * @param {string} request.sessionId Collaboration session identifier.
 * @param {number} request.fromSequence First missing sequence.
 * @param {number} [request.toSequence] Last missing sequence.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid replay request envelope.
 */
const createReplayRequestEnvelope = (request, options = {}) => {
    const payload = {
        fromSequence: request.fromSequence
    };
    if (typeof request.toSequence !== 'undefined') payload.toSequence = request.toSequence;
    return createEnvelope(MESSAGE_KIND.REPLAY_REQUEST, payload, {
        sessionId: request.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    });
};

/**
 * Create a snapshot-ready envelope.
 * @param {object} ready Ready fields.
 * @param {string} ready.sessionId Collaboration session identifier.
 * @param {string} ready.snapshotId Applied snapshot identifier.
 * @param {number} ready.lastAppliedSequence Last sequence applied after the snapshot.
 * @param {object} [options] Envelope creation options.
 * @returns {object} Valid ready envelope.
 */
const createReadyEnvelope = (ready, options = {}) => createEnvelope(
    MESSAGE_KIND.READY,
    {
        snapshotId: ready.snapshotId,
        lastAppliedSequence: ready.lastAppliedSequence
    },
    {
        sessionId: ready.sessionId,
        messageId: options.messageId,
        uuidFactory: options.uuidFactory
    }
);

export {
    MESSAGE_KIND,
    PROTOCOL_ID,
    ProtocolValidationError,
    assertValidEnvelope,
    assertValidOperation,
    createEnvelope,
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
};
