import BlocklyCollaborationAdapter from './blockly-adapter';
import EntityRegistry from './entity-registry';
import ExtensionCollaborationAdapter, {
    EXTENSION_OPERATION_TYPES
} from './extension-adapter';
import CollaborationSession from './session';
import VMCollaborationAdapter, {
    VM_OPERATION_TYPES
} from './vm-adapter';

const VM_TYPES = new Set(Object.keys(VM_OPERATION_TYPES).map(key => VM_OPERATION_TYPES[key]));
const EXTENSION_TYPES = new Set(
    Object.keys(EXTENSION_OPERATION_TYPES).map(key => EXTENSION_OPERATION_TYPES[key])
);

/**
 * Own all live-collaboration editor listeners for one mounted Blocks workspace.
 * The React Blocks container only supplies the workspace and no longer parses
 * packets or invokes VM methods itself.
 */
class CollaborationController {
    /**
     * @param {object} options controller dependencies
     * @param {object} options.vm Scratch VM
     * @param {object} options.ScratchBlocks Scratch Blocks namespace
     * @param {object} options.workspace mounted Blockly workspace
     * @param {object} options.connectionManager authenticated PeerJS transport
     */
    constructor ({
        vm,
        ScratchBlocks,
        workspace,
        connectionManager
    }) {
        this.vm = vm;
        this.workspace = workspace;
        this.connectionManager = connectionManager;
        this.registry = new EntityRegistry();

        this.vmAdapter = new VMCollaborationAdapter(vm, this.registry);
        this.extensionAdapter = new ExtensionCollaborationAdapter(vm);
        this.session = new CollaborationSession({
            connectionManager,
            vm,
            registry: this.registry,
            applyOperation: operation => this.applyOperation(operation),
            createExtensionManifest: () => this.extensionAdapter.createManifest(),
            applyExtensionManifest: manifest => this.extensionAdapter.applyManifest(manifest)
        });
        this.blocklyAdapter = new BlocklyCollaborationAdapter({
            vm,
            ScratchBlocks,
            workspace,
            registry: this.registry,
            submitOperation: operation => this.session.submit(operation),
            refreshToolbox: () => {
                const toolbox = workspace.getToolbox();
                if (toolbox) toolbox.refreshSelection();
            }
        });

        this.started = false;
        this._handleVMMutation = this._handleVMMutation.bind(this);
        this._handleExtensionMutation = this._handleExtensionMutation.bind(this);
    }

    start () {
        if (this.started) return;
        this.started = true;
        this.session.start();
        this.blocklyAdapter.attach();
        this.vm.on('PROJECT_MUTATION', this._handleVMMutation);
        this.vm.on('EXTENSION_MUTATION', this._handleExtensionMutation);
        this.connectionManager.collaborationSession = this.session;
    }

    dispose () {
        if (!this.started) return;
        this.started = false;
        this.vm.removeListener('PROJECT_MUTATION', this._handleVMMutation);
        this.vm.removeListener('EXTENSION_MUTATION', this._handleExtensionMutation);
        this.blocklyAdapter.detach();
        this.session.stop();
        if (this.connectionManager.collaborationSession === this.session) {
            this.connectionManager.collaborationSession = null;
        }
    }

    applyOperation (operation) {
        if (operation.type === 'blockly.event') {
            return this.blocklyAdapter.apply(operation);
        }
        if (EXTENSION_TYPES.has(operation.type)) {
            return this.extensionAdapter.apply(operation);
        }
        if (VM_TYPES.has(operation.type)) {
            return this.vmAdapter.apply(operation);
        }
        throw new Error(`Unknown collaboration operation: ${operation.type}`);
    }

    _handleVMMutation (mutation) {
        if (!this.session.ready) return;
        try {
            const operation = this.vmAdapter.captureMutation(mutation);
            if (operation) this.session.submit(operation);
        } catch (error) {
            console.error('Failed to capture VM collaboration mutation', error);
        }
    }

    _handleExtensionMutation (mutation) {
        if (!this.session.ready) return;
        try {
            const operation = this.extensionAdapter.captureMutation(mutation);
            if (operation) this.session.submit(operation);
        } catch (error) {
            console.error('Failed to capture extension collaboration mutation', error);
        }
    }
}

export default CollaborationController;
