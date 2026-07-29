const EXTENSION_OPERATION_TYPES = Object.freeze({
    LOAD: 'extension.load',
    REMOVE: 'extension.remove',
    REORDER: 'extension.reorder'
});

/**
 * Synchronize extension list mutations without granting remote participants
 * permission to trust unsandboxed code on behalf of this browser.
 */
class ExtensionCollaborationAdapter {
    /**
     * @param {object} vm Scratch VM
     */
    constructor (vm) {
        this.vm = vm;
    }

    /**
     * Convert an EXTENSION_MUTATION notification into a semantic operation.
     * @param {object} mutation extension mutation
     * @returns {?object} collaboration operation
     */
    captureMutation (mutation) {
        if (!mutation || typeof mutation.action !== 'string') return null;

        switch (mutation.action) {
        case 'load':
            if (typeof mutation.source !== 'string') return null;
            return {
                type: EXTENSION_OPERATION_TYPES.LOAD,
                targetId: null,
                payload: {
                    source: mutation.source,
                    sandboxMode: mutation.sandboxMode || null
                }
            };
        case 'remove':
            if (typeof mutation.extensionId !== 'string') return null;
            return {
                type: EXTENSION_OPERATION_TYPES.REMOVE,
                targetId: null,
                payload: {extensionId: mutation.extensionId}
            };
        case 'reorder':
            return {
                type: EXTENSION_OPERATION_TYPES.REORDER,
                targetId: null,
                payload: {
                    order: this._getLoadedExtensionIds()
                }
            };
        default:
            return null;
        }
    }

    /**
     * Apply a committed extension operation.
     * @param {object} operation collaboration operation
     * @returns {Promise<void>} resolves after the extension change
     */
    async apply (operation) {
        const manager = this.vm.extensionManager;
        const payload = operation.payload || {};

        switch (operation.type) {
        case EXTENSION_OPERATION_TYPES.LOAD:
            if (typeof payload.source !== 'string') {
                throw new Error('Invalid extension source');
            }
            await this._loadExtension(payload.source);
            return;
        case EXTENSION_OPERATION_TYPES.REMOVE:
            if (typeof payload.extensionId !== 'string') {
                throw new Error('Invalid extension ID');
            }
            if (manager.isExtensionLoaded(payload.extensionId)) {
                manager.removeExtension(payload.extensionId, false);
            }
            return;
        case EXTENSION_OPERATION_TYPES.REORDER:
            this._applyAbsoluteOrder(payload.order);
            return;
        default:
            throw new Error(`Unsupported extension collaboration operation: ${operation.type}`);
        }
    }

    /**
     * Describe the full loaded extension set for a joining peer. Custom sources
     * include their original URL (including complete data URLs created from the
     * text loader); built-ins use their extension ID.
     * @returns {object} extension manifest
     */
    createManifest () {
        const manager = this.vm.extensionManager;
        const urls = typeof manager.getExtensionURLs === 'function' ?
            manager.getExtensionURLs() :
            {};
        return {
            extensions: this._getLoadedExtensionIds().map(id => ({
                id,
                source: typeof urls[id] === 'string' ? urls[id] : id
            }))
        };
    }

    /**
     * Make this VM's extension set match a host snapshot before collaboration
     * operations resume.
     * @param {object} manifest host extension manifest
     * @returns {Promise<void>} resolves after load/remove/reorder completes
     */
    async applyManifest (manifest) {
        const extensions = this._validateManifest(manifest);
        const manager = this.vm.extensionManager;

        // Load first so a denied or failed extension does not destructively
        // remove the participant's existing editor state.
        for (const extension of extensions) {
            if (!manager.isExtensionLoaded(extension.id)) {
                await this._loadExtension(extension.source);
            }
            if (!manager.isExtensionLoaded(extension.id)) {
                throw new Error(`Extension source did not register "${extension.id}"`);
            }
        }

        const desiredIds = new Set(extensions.map(extension => extension.id));
        for (const id of this._getLoadedExtensionIds()) {
            if (!desiredIds.has(id) && !manager.isCoreExtension(id)) {
                manager.removeExtension(id, false);
            }
        }
        this._applyAbsoluteOrder(extensions.map(extension => extension.id));
    }

    async _loadExtension (source) {
        const manager = this.vm.extensionManager;
        const isBuiltin = manager.isBuiltinExtension(source);
        const securityManager = this.vm.securityManager || manager.securityManager;
        if (!isBuiltin && securityManager &&
            typeof securityManager.canLoadExtensionFromProject === 'function') {
            const allowed = await securityManager.canLoadExtensionFromProject(source);
            if (!allowed) throw new Error('Permission to load collaborative extension was denied');
        }

        // Passing false suppresses only this mutation's echo. The security
        // manager still chooses the sandbox mode for this browser.
        await manager.loadExtensionURL(source, false);
    }

    _getLoadedExtensionIds () {
        const manager = this.vm.extensionManager;
        if (typeof manager.getLoadedExtensionIds !== 'function') {
            throw new Error('Extension manager does not expose its loaded extension order');
        }
        return manager.getLoadedExtensionIds();
    }

    _applyAbsoluteOrder (order) {
        if (!Array.isArray(order) || order.some(id => typeof id !== 'string') ||
            new Set(order).size !== order.length) {
            throw new Error('Invalid extension order');
        }

        const manager = this.vm.extensionManager;
        order.forEach((id, desiredIndex) => {
            const currentOrder = this._getLoadedExtensionIds();
            const currentIndex = currentOrder.indexOf(id);
            if (currentIndex === -1) {
                throw new Error(`Cannot order unloaded extension "${id}"`);
            }
            if (currentIndex !== desiredIndex) {
                manager.reorderExtension(currentIndex, desiredIndex, false);
            }
        });
    }

    _validateManifest (manifest) {
        if (!manifest || !Array.isArray(manifest.extensions)) {
            throw new Error('Invalid extension manifest');
        }
        const ids = new Set();
        return manifest.extensions.map(extension => {
            if (!extension || typeof extension.id !== 'string' ||
                typeof extension.source !== 'string' || ids.has(extension.id)) {
                throw new Error('Invalid extension manifest entry');
            }
            ids.add(extension.id);
            return extension;
        });
    }
}

export {
    EXTENSION_OPERATION_TYPES
};
export default ExtensionCollaborationAdapter;
