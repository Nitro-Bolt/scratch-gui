import loadWorkspace from '../../../src/lib/nb-load-workspace';

const setup = (count = 1) => {
    const dom = {getElementsByTagName: () => new Array(count)};
    const Xml = {
        textToDom: jest.fn(() => dom),
        clearWorkspaceAndLoadFromXml: jest.fn(),
        clearWorkspaceAndLoadFromDescs: jest.fn(),
        clearWorkspaceAndLoadFromXmlDeferred: jest.fn(() => 'handle')
    };
    const blocks = Object.fromEntries(Array.from({length: count}, (_, i) => [i, {}]));
    const data = {xml: '<xml>full</xml>', headerXml: '<xml>header</xml>', blocks: {blocks}};
    return {Xml, dom, data};
};

test('older blocks packages receive complete XML from a newer VM', () => {
    const {Xml, data, dom} = setup();
    delete Xml.clearWorkspaceAndLoadFromDescs;
    delete Xml.clearWorkspaceAndLoadFromXmlDeferred;
    loadWorkspace({Xml}, {}, data, {});
    expect(Xml.textToDom).toHaveBeenCalledWith(data.xml);
    expect(Xml.clearWorkspaceAndLoadFromXml).toHaveBeenCalledWith(dom, {});
});

test('XML-only deferred loaders receive complete XML and no descriptions', () => {
    const {Xml, data, dom} = setup(100);
    delete Xml.clearWorkspaceAndLoadFromDescs;
    loadWorkspace({Xml}, {}, data, {});
    expect(Xml.textToDom).toHaveBeenCalledWith(data.xml);
    expect(Xml.clearWorkspaceAndLoadFromXmlDeferred).toHaveBeenCalledWith(dom, {}, {}, null);
});

test('small workspaces load descriptions without serializing XML', () => {
    const {Xml, data, dom} = setup();
    Object.defineProperty(data, 'xml', {get: () => { throw new Error('XML was serialized'); }});
    expect(loadWorkspace({Xml}, {}, data, {})).toBeNull();
    expect(Xml.clearWorkspaceAndLoadFromDescs).toHaveBeenCalledWith(dom, data.blocks, {});
});

test('large workspaces defer description loading and return the cancellation handle', () => {
    const {Xml, data, dom} = setup(100);
    expect(loadWorkspace({Xml}, {}, data, {})).toBe('handle');
    expect(Xml.clearWorkspaceAndLoadFromXmlDeferred).toHaveBeenCalledWith(dom, {}, {}, data.blocks);
});

test('older VMs still load complete XML', () => {
    const {Xml, data, dom} = setup();
    delete data.blocks;
    delete data.headerXml;
    loadWorkspace({Xml}, {}, data, {});
    expect(Xml.clearWorkspaceAndLoadFromXml).toHaveBeenCalledWith(dom, {});
});
