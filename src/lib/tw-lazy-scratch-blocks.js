let _ScratchBlocks = null;

const isLoaded = () => !!_ScratchBlocks;

const get = () => {
    if (!isLoaded()) {
        throw new Error('scratch-blocks is not loaded yet');
    }
    return _ScratchBlocks;
};

const load = () => {
    if (_ScratchBlocks) {
        return Promise.resolve();
    }
    return import(/* webpackChunkName: "sb" */ 'scratch-blocks')
        .then(m => {
            const candidates = [
                m && m.default,
                m && m.default && m.default.default,
                m && m.default && m.default.Blockly,
                m && m.Blockly,
                m
            ];
            _ScratchBlocks = candidates.find(candidate => (
                candidate && candidate.Colours && candidate.Blocks
            )) || candidates[0];
            return _ScratchBlocks;
        });
};

export default {
    get,
    isLoaded,
    load
};
