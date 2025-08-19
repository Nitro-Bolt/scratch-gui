import defaultsDeep from 'lodash.defaultsdeep';

import accentLime from './accent/lime.js';
import accentLightBlue from './accent/light-blue.js';
import accentPurple from './accent/purple.js';
import accentRed from './accent/red.js';

const ACCENT_LIME = 'lime green';
const ACCENT_LIGHTBLUE = 'light blue';
const ACCENT_PURPLE = 'purple';
const ACCENT_RED = 'red';
const ACCENT_MAP = {
    [ACCENT_LIME]: accentLime,
    [ACCENT_LIGHTBLUE]: accentLightBlue,
    [ACCENT_PURPLE]: accentPurple,
    [ACCENT_RED]: accentRed,
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
    ACCENT_MAP
}