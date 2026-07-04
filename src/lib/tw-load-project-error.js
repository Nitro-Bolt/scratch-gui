/**
 * General error while loading project.
 */
class LoadProjectError extends Error {
    constructor (message) {
        super(message);
        this.name = 'LoadProjectError';
    }
}

/**
 * Could not get a project token from trampoline.
 */
class ProjectUnsharedError extends LoadProjectError {
    constructor (message) {
        super(message);
        this.name = 'ProjectUnsharedError';
    }
}

/**
 * We got a valid token from trampoline, but the project ultimately failed to be fetched from Scratch.
 */
class ProjectFetchError extends LoadProjectError {
    constructor (message) {
        super(message);
        this.name = 'ProjectFetchError';
    }
}

export {
    LoadProjectError,
    ProjectUnsharedError,
    ProjectFetchError
};
