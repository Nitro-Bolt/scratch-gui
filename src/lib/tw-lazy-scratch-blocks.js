let _ScratchBlocks = null;
let _WasNameYourmom = false;
let _WasNameJurassicPark = false;

// eslint-disable-next-line no-return-assign
const isNameUrMom = () => _WasNameYourmom = (() => {
    const username = localStorage
        .getItem('tw:username');
    return username && ((username.toLowerCase() === 'yourmom') || (username.toLowerCase() === 'yourmother') ||
        (username.toLowerCase() === 'urmom') || (username.toLowerCase() === 'urmother'));
})();

const isNameJurassicPark = () => _WasNameJurassicPark = (() => {
    const username = localStorage
        .getItem('tw:username');
    return username && ((username.toLowerCase() === 'jurassicpark') || (username.toLowerCase() === 'trexpark') ||
        (username.toLowerCase() === 'dinosaurpark') || (username.toLowerCase() === 'dinosaursarecool'));
})();

const wasNameYourmom = () => {
    const old = _WasNameYourmom;
    _WasNameYourmom = isNameUrMom();
    return old;
};

const wasNameJurassicPark = () => {
    const old = _WasNameJurassicPark;
    _WasNameJurassicPark = isNameJurassicPark();
    return old;
};

const isLoaded = () => !!_ScratchBlocks && (isNameUrMom() === wasNameYourmom());

const isLoaded2 = () => !!_ScratchBlocks && (isNameJurassicPark() === wasNameJurassicPark());

const get = () => {
    if (!isLoaded() && !isLoaded2()) {
        throw new Error('scratch-blocks is not loaded yet');
    }
    return _ScratchBlocks;
};

const load = () => {
    if (_ScratchBlocks && (isNameUrMom() === wasNameYourmom())) {
        window.ScratchBlocks = _ScratchBlocks;
        return Promise.resolve();
    }
    _ScratchBlocks = null;
    return import(/* webpackChunkName: "sb" */ 'scratch-blocks')
        .then(m => {
            _ScratchBlocks = m.default;

            if (isNameUrMom()) {
                _ScratchBlocks.Blocks.your_mom = {
                    init () {
                        this.jsonInit({
                            message0: 'your mom %1',
                            args0: [
                                {
                                    type: 'field_image',
                                    src: 'https://cdn.discordapp.com/emojis/1039714598959452261.webp?size=128&quality=lossless',
                                    width: 15,
                                    height: 15,
                                    alt: '*',
                                    flipRtl: false
                                }
                            ],
                            inputsInline: true,
                            previousStatement: null,
                            nextStatement: null,
                            colour: '#ff0000',
                            tooltip: 'your mom :trel:',
                            helpUrl: 'https://tenor.com/view/urmom-your-mom-baldi-defaultdance-gif-19665250'
                        });
                    }
                };

                const oldFieldRenderer = _ScratchBlocks.BlockSvg.prototype.renderFields_;
                _ScratchBlocks.BlockSvg.prototype.renderFields_ = function (fieldList, cursorX,
                    cursorY) {
                    if (
                        !fieldList[0] ||
                        !fieldList[0].getValue ||
                        fieldList[0].getValue() !== 'your mom'
                    ) {
                        for (const field of fieldList) {
                            for (const propName in field) {
                                const prop = field[propName];
                                if (!prop || !prop.style || prop.style.display === 'none') continue;
                                prop.style.display = 'none';
                            }
                        }
                        return cursorX;
                    }
                    return oldFieldRenderer.call(this, fieldList, cursorX, cursorY);
                };
                const oldConstructor = _ScratchBlocks.Block.prototype.constructor;
                // eslint-disable-next-line no-loop-func
                _ScratchBlocks.Block.prototype.constructor = function (...args) {
                    const [_, prototypeName] = [...args];
                    if (prototypeName && !_ScratchBlocks.Blocks[prototypeName].yourMomed) {
                        _ScratchBlocks.Blocks[prototypeName].yourMomed = true;
                        const oldInit = _ScratchBlocks.Blocks[prototypeName].init;
                        _ScratchBlocks.Blocks[prototypeName].init = function () {
                            oldInit.call(this);
                            if (this.inputList.length < 1 || this.inputList[0].name !== 'yourMom') {
                                this.appendDummyInput('yourMom')
                                    .appendField('your mom')
                                    .appendField(new _ScratchBlocks.FieldImage(
                                        'https://penguinmod.com/dump/1039714598959452261.webp',
                                        15,
                                        15,
                                        '*',
                                        false
                                    ));
                            }
                            if (this.inputList.length > 1) {
                                this.moveInputBefore('yourMom', this.inputList[0].name);
                            }
                            this.setColour('#ff0000');
                            this.setTooltip('your mom :trel:');
                            this.setHelpUrl('https://penguinmod.com/dump/urmom-your-mom.gif');
                        };
                    }
                    const oldLoad = _ScratchBlocks.Blocks[prototypeName].domToMutation;
                    _ScratchBlocks.Blocks[prototypeName].domToMutation = function (dom) {
                        if (oldLoad) oldLoad.call(this, dom);
                        if (this.inputList.length < 1 || this.inputList[0].name !== 'yourMom') {
                            this.appendDummyInput('yourMom')
                                .appendField('your mom')
                                .appendField(new _ScratchBlocks.FieldImage(
                                    'https://penguinmod.com/dump/1039714598959452261.webp',
                                    15,
                                    15,
                                    '*',
                                    false
                                ));
                        }
                        if (this.inputList.length > 1) {
                            this.moveInputBefore('yourMom', this.inputList[0].name);
                        }
                        this.setColour('#ff0000');
                        this.setTooltip('your mom :trel:');
                        this.setHelpUrl('https://penguinmod.com/dump/urmom-your-mom.gif');
                    };
                    oldConstructor.call(this, ...args);
                };
            }

            return _ScratchBlocks;
        });
};

const load2 = () => {
    if (_ScratchBlocks && (isNameJurassicPark() === wasNameJurassicPark())) {
        return Promise.resolve();
    }
    _ScratchBlocks = null;
    return import(/* webpackChunkName: "sb" */ 'scratch-blocks')
        .then(m => {
            _ScratchBlocks = m.default;

            if (isNameJurassicPark()) {
                const oldFieldRenderer = _ScratchBlocks.BlockSvg.prototype.renderFields_;
                _ScratchBlocks.BlockSvg.prototype.renderFields_ = function (fieldList, cursorX,
                    cursorY) {
                    if (
                        !fieldList[0] ||
                        !fieldList[0].getValue ||
                        fieldList[0].getValue() !== 'jurassic Park'
                    ) {
                        for (const field of fieldList) {
                            for (const propName in field) {
                                const prop = field[propName];
                                if (!prop || !prop.style || prop.style.display === 'none') continue;
                                prop.style.display = 'none';
                            }
                        }
                        return cursorX;
                    }
                    return oldFieldRenderer.call(this, fieldList, cursorX, cursorY);
                };
                const oldConstructor = _ScratchBlocks.Block.prototype.constructor;
                // eslint-disable-next-line no-loop-func
                _ScratchBlocks.Block.prototype.constructor = function (...args) {
                    const [_, prototypeName] = [...args];
                    if (prototypeName && !_ScratchBlocks.Blocks[prototypeName].jurassicParked) {
                        _ScratchBlocks.Blocks[prototypeName].jurassicParked = true;
                        const oldInit = _ScratchBlocks.Blocks[prototypeName].init;
                        _ScratchBlocks.Blocks[prototypeName].init = function () {
                            oldInit.call(this);
                            if (this.inputList.length < 1 || this.inputList[0].name !== 'jurassicPark') {
                                this.appendDummyInput('jurassicPark')
                                    .appendField('jurassic Park')
                                    .appendField(new _ScratchBlocks.FieldImage(
                                        'https://cdn.freebiesupply.com/logos/large/2x/jurassic-park-2-logo-png-transparent.png',
                                        15,
                                        15,
                                        '*',
                                        false
                                    ));
                            }
                            if (this.inputList.length > 1) {
                                this.moveInputBefore('jurassicPark', this.inputList[0].name);
                            }
                            this.setColour('#000000');
                            this.setTooltip('jurassic Park :dino:');
                            this.setHelpUrl('https://i.giphy.com/media/TFxYl2lYJEu9kY1lEb/giphy.webp');
                        };
                    }
                    const oldLoad = _ScratchBlocks.Blocks[prototypeName].domToMutation;
                    _ScratchBlocks.Blocks[prototypeName].domToMutation = function (dom) {
                        if (oldLoad) oldLoad.call(this, dom);
                        if (this.inputList.length < 1 || this.inputList[0].name !== 'jurassicPark') {
                            this.appendDummyInput('jurassicPark')
                                .appendField('jurassic Park')
                                .appendField(new _ScratchBlocks.FieldImage(
                                    'https://cdn.freebiesupply.com/logos/large/2x/jurassic-park-2-logo-png-transparent.png',
                                    15,
                                    15,
                                    '*',
                                    false
                                ));
                        }
                        if (this.inputList.length > 1) {
                            this.moveInputBefore('jurassicPark', this.inputList[0].name);
                        }
                        this.setColour('#00FF00');
                        this.setTooltip('jurassic Park :dino:');
                        this.setHelpUrl('https://i.giphy.com/media/TFxYl2lYJEu9kY1lEb/giphy.webp');
                    };
                    oldConstructor.call(this, ...args);
                };
            }

            return _ScratchBlocks;
        });
};

const onLoaded = callback => {
    if (_ScratchBlocks) {
        callback(_ScratchBlocks);
    } else {
        callbacks.push(callback);
    }
};

export default {
    get,
    isLoaded,
    isLoaded2,
    isNameUrMom,
    isNameJurassicPark,
    wasNameYourmom,
    wasNameJurassicPark,
    load,
    load2,
    onLoaded
};
