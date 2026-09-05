import Utils from '../../../src/addons/addons/find-bar/blockly/Utils';
import BlockFlasher from '../../../src/addons/addons/find-bar/blockly/BlockFlasher';

test('find-bar navigation replaces a disposed search result with its reloaded block', () => {
    const block = {
        id: 'result',
        width: 80,
        height: 32,
        getRelativeToSurfaceXY: () => ({x: 100, y: 100})
    };
    block.getRootBlock = () => block;
    let loaded = false;
    const workspace = {
        scale: 1,
        materializeScriptsForBlockIds: () => { loaded = true; },
        getBlockById: () => (loaded ? block : null),
        getMetrics: () => ({viewLeft: 0, viewTop: 0, viewWidth: 1000, viewHeight: 1000})
    };
    const utils = Object.create(Utils.prototype);
    utils.getWorkspace = () => workspace;
    utils.getTopOfStackFor = value => value;
    utils.offsetX = 0;
    utils.offsetY = 0;
    const flash = jest.spyOn(BlockFlasher, 'flash').mockImplementation(() => {});
    try {
        utils.scrollBlockIntoView({
            id: 'result',
            getRootBlock: () => { throw new Error('This block was disposed'); }
        });
        expect(flash).toHaveBeenCalledWith(block);
    } finally {
        flash.mockRestore();
    }
});
