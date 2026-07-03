import {Theme} from '.';

const matchMedia = query => (window.matchMedia ? window.matchMedia(query) : null);
const PREFERS_HIGH_CONTRAST_QUERY = matchMedia('(prefers-contrast: more)');
const PREFERS_DARK_QUERY = matchMedia('(prefers-color-scheme: dark)');

const STORAGE_KEY = 'tw:theme';
const ACCENT_KEY = 'tw:accent';

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
        const local = localStorage.getItem(STORAGE_KEY);

        return new Theme(
            localStorage.getItem(ACCENT_KEY), local || 'light'
        );
    } catch (e) {
        // ignore
    }
};

/**
 * @param {Theme} theme the theme
 */
const persistTheme = theme => {
    if (localStorage) localStorage.setItem(ACCENT_KEY, theme.accent);

    const local = localStorage.getItem(ACCENT_KEY)
    document.body.setAttribute("coloraccent", local)

    if (localStorage) localStorage.setItem("tw:accent:isCustom", false)

    window.Recolor = {primary: getComputedStyle(document.body).getPropertyValue('--motion-primary')}

    document.body.dispatchEvent(recolorEvent);

    let descendants = Array.prototype.slice.call(
        document.body.querySelectorAll("*")
    );
    descendants.forEach(function(descendant) {
        descendant.dispatchEvent(recolorEvent);
    });
};
