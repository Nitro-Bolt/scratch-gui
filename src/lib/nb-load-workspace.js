const DEFERRED_WORKSPACE_LOAD_MIN_BLOCKS = 100;

// Older blocks packages need the complete XML, even when the VM supplies descriptions.
const loadWorkspace = (ScratchBlocks, workspace, data, callbacks) => {
    const xml = ScratchBlocks.Xml;
    const descs = xml.clearWorkspaceAndLoadFromDescs && data.headerXml ? data.blocks || null : null;
    const dom = xml.textToDom(descs ? data.headerXml : data.xml);
    const blockCount = descs ? Object.keys(descs.blocks || {}).length : dom.getElementsByTagName('block').length;
    const useDeferredLoad = xml.clearWorkspaceAndLoadFromXmlDeferred &&
        (blockCount >= DEFERRED_WORKSPACE_LOAD_MIN_BLOCKS ||
            Object.keys(workspace.blockDB_ || {}).length >= DEFERRED_WORKSPACE_LOAD_MIN_BLOCKS);
    if (useDeferredLoad) {
        return xml.clearWorkspaceAndLoadFromXmlDeferred(dom, workspace, callbacks, descs);
    }
    if (descs) {
        xml.clearWorkspaceAndLoadFromDescs(dom, descs, workspace);
    } else {
        xml.clearWorkspaceAndLoadFromXml(dom, workspace);
    }
    return null;
};

export default loadWorkspace;
