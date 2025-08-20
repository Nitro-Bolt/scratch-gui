import {Theme} from '.';

const matchMedia = query => (window.matchMedia ? window.matchMedia(query) : null);
const PREFERS_HIGH_CONTRAST_QUERY = matchMedia('(prefers-contrast: more)');
const PREFERS_DARK_QUERY = matchMedia('(prefers-color-scheme: dark)');

const STORAGE_KEY = 'tw:theme';
const ACCENT_KEY = 'tw:accent';

window.themeTEST = theme => new Theme(theme)

if (localStorage && localStorage.getItem(ACCENT_KEY) === null) {
    localStorage.setItem(ACCENT_KEY, 'lime green')
}

/**
 * @returns {Theme} detected theme
 */
const systemPreferencesTheme = () => {
    if (PREFERS_HIGH_CONTRAST_QUERY && PREFERS_HIGH_CONTRAST_QUERY.matches) {
        return Theme.highContrast;
    }
    if (PREFERS_DARK_QUERY && PREFERS_DARK_QUERY.matches) {
        return Theme.dark;
    }
    return Theme.light;
};

/**
 * @returns {Theme} the theme
 */
const detectTheme = () => {
    try {
        const local = localStorage.getItem(ACCENT_KEY);

        return new Theme(
            local || new Theme('lime green')
        );
    } catch (e) {
        // ignore
    }
};

/**
 * @param {Theme} theme the theme
 */
const persistTheme = theme => {
    const root = document.documentElement;

    if (localStorage) localStorage.setItem(ACCENT_KEY, (new Theme(theme).accent));

    const local = localStorage.getItem(ACCENT_KEY)
    
    const accentData = new Theme(local).accentData;
    const parsed = JSON.parse(accentData);
    for (const key in parsed) {
        root.style.setProperty("--" + key, parsed[key]);
    }
};

export {
    detectTheme,
    persistTheme
}