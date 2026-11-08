import ProjectFileWorker from 'worker-loader!./nb-save-project-files-worker.js';

/**
 * @param {string} projectJSON serialized project
 * @returns {Promise<Uint8Array>} UTF-8 encoded project
 */
const encodeProjectJSON = projectJSON => new Promise((resolve, reject) => {
    const worker = new ProjectFileWorker();
    worker.onmessage = event => {
        worker.terminate();
        resolve(event.data);
    };
    worker.onerror = event => {
        worker.terminate();
        reject(event.error || new Error(event.message));
    };
    worker.postMessage(projectJSON);
});

/**
 * Capture a project as uncompressed SB3 files while encoding project.json off the UI thread.
 * @param {VirtualMachine} vm scratch-vm instance
 * @param {*} serializationOptions options to pass to the VM serializer
 * @returns {Promise<Record<string, Uint8Array>>} project files keyed by file name
 */
const saveProjectFiles = async (vm, serializationOptions) => {
    const projectJSON = vm.toJSON(null, serializationOptions);
    const assetDescriptions = vm.serializeAssets();
    const files = {};

    for (const asset of assetDescriptions) {
        files[asset.fileName] = asset.fileContent;
    }
    files['project.json'] = await encodeProjectJSON(projectJSON);

    return files;
};

export default saveProjectFiles;
