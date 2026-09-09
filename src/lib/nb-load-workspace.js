const DEFERRED_WORKSPACE_LOAD_MIN_BLOCKS = 100;

const loadWorkspace = (ScratchBlocks, workspace, data, callbacks) => {
    const xml = ScratchBlocks.Xml;
    const dom = xml.textToDom(data.headerXml);
    const blockCount = Object.keys(data.blockDescs.blocks).length;
    const useDeferredLoad = blockCount >= DEFERRED_WORKSPACE_LOAD_MIN_BLOCKS ||
        Object.keys(workspace.blockDB_).length >= DEFERRED_WORKSPACE_LOAD_MIN_BLOCKS;
    if (useDeferredLoad) {
        return xml.clearWorkspaceAndLoadFromDescsDeferred(dom, data.blockDescs, workspace, callbacks);
    }
    xml.clearWorkspaceAndLoadFromDescs(dom, data.blockDescs, workspace);
    return null;
};

export default loadWorkspace;
