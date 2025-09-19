import defaultsDeep from 'lodash.defaultsdeep';

import accentLime from './accents/lime.js';
import accentLightBlue from './accents/light-blue.js';
import accentPurple from './accents/purple.js';
import accentRed from './accents/red.js';

const ACCENT_LIME = 'Lime Green';
const ACCENT_LIGHTBLUE = 'Light Blue';
const ACCENT_PURPLE = 'Purple';
const ACCENT_RED = 'Red';
const ACCENT_BLUE = 'Blue';
const ACCENT_SCRATCH = 'Scratch';
const ACCENT_MAGENTA = 'Magenta';
const ACCENT_RAINBOW = 'Rainbow';
const ACCENT_MAP = {
    [ACCENT_LIME]: accentLime,
    [ACCENT_LIGHTBLUE]: accentLightBlue,
    [ACCENT_PURPLE]: accentPurple,
    [ACCENT_RED]: accentRed,
    [ACCENT_BLUE]: {
        'motion-primary': 'hsla(215, 100%, 65%, 1)'
    },
    [ACCENT_SCRATCH]: {
        'motion-primary': 'hsla(260, 60%, 60%, 1)'
    },
    [ACCENT_MAGENTA]: {
        'motion-primary': 'hsla(289, 100%, 54%, 1)'
    },
    [ACCENT_RAINBOW]: {
        'motion-primary': '#ff4c4c'
    },
    ["custom"]: {}
};

const ACCENT_DEFAULT = ACCENT_LIME;

let themeObjectsCreated = 0;

class Theme {
    constructor(accent) {
        // do not modify these directly
        /** @readonly */
        this.id = ++themeObjectsCreated;
        /** @readonly */
        this.accent = Object.prototype.hasOwnProperty.call(ACCENT_MAP, accent) ? accent : ACCENT_DEFAULT;
        /** @readonly */
        this.accentData = ACCENT_MAP[accent] ? ACCENT_MAP[accent] : ACCENT_MAP[ACCENT_DEFAULT]
    }

    static light = new Theme(ACCENT_DEFAULT);
    static dark = new Theme(ACCENT_DEFAULT);
    static highContrast = new Theme(ACCENT_DEFAULT);

    set (to) {
        return new Theme(to);
    }

    getGuiColors () {
        return defaultsDeep(
            {},
            ACCENT_MAP[this.accent]
        );
    }
}

export {
    Theme,

    ACCENT_LIME,
    ACCENT_LIGHTBLUE,
    ACCENT_PURPLE,
    ACCENT_RED,
    ACCENT_SCRATCH,
    ACCENT_MAGENTA,
    ACCENT_BLUE,
    ACCENT_RAINBOW,
    ACCENT_MAP
}