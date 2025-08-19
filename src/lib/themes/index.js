import defaultsDeep from 'lodash.defaultsdeep';

import accentLime from './accent/lime';
import accentLightBlue from './accent/light-blue';
import accentRed from './accent/red';

const ACCENT_LIME = 'lime green';
const ACCENT_LIGHTBLUE = 'light blue';
const ACCENT_RED = 'red';
const ACCENT_MAP = {
    [ACCENT_LIME]: accentLime,
    [ACCENT_LIGHTBLUE]: accentLightBlue,
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
    ACCENT_RED,
    ACCENT_MAP
}