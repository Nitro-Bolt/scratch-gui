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
    /*[ACCENT_RAINBOW]: {
        'motion-primary': 'linear-gradient(90deg, rgba(255, 0, 0, 0.75) 0%, rgba(255, 154, 0, 0.75) 10%, rgba(208, 222, 33, 0.75) 20%, rgba(79, 220, 74, 0.75) 30%, rgba(63, 218, 216, 0.75) 40%, rgba(47, 201, 226, 0.75) 50%, rgba(28, 127, 238, 0.75) 60%, rgba(95, 21, 242, 0.75) 70%, rgba(186, 12, 248, 0.75) 80%, rgba(251, 7, 217, 0.75) 90%, rgba(255, 0, 0, 0.75) 100%)'
    }*/
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