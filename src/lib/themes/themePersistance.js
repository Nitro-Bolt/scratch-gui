import {Theme} from '.';

const matchMedia = query => (window.matchMedia ? window.matchMedia(query) : null);
const PREFERS_HIGH_CONTRAST_QUERY = matchMedia('(prefers-contrast: more)');
const PREFERS_DARK_QUERY = matchMedia('(prefers-color-scheme: dark)');

const STORAGE_KEY = 'tw:theme';
const ACCENT_KEY = 'tw:accent';
const CUSTOM_ACCENTS_KEY = "tw:accent:customAccents";

if (localStorage && localStorage.getItem(ACCENT_KEY) === null) {
    localStorage.setItem(ACCENT_KEY, 'Lime Green')
    window.Recolor = {primary: (new Theme().set('Lime Green')).accentData['motion-primary']}
}

window.Recolor = {primary: new Theme(localStorage.getItem(ACCENT_KEY)).accentData['motion-primary']}

const recolorEvent = new CustomEvent("RecolorEvent", {
    details: {}
})

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

/**
 * @param {any} colors the colors of the custom theme
 */
const persistThemeCustom = colors => {
    function evaluateCss (css) {
        const variableMatch = css.match(/^var\(([\w-]+)\)$/);
        if (variableMatch) {
            return document.documentElement.style.getPropertyValue(variableMatch[1]);
        }
        return css;
    }

    document.body.setAttribute("coloraccent", "custom")

    document.documentElement.style.setProperty('--motion-primary', evaluateCss(colors.primaryColor))
    document.documentElement.style.setProperty('--motion-primary-dark', evaluateCss(colors.primaryColorDark))

    document.documentElement.style.setProperty('--paint-motion-primary', evaluateCss(colors.primaryColor))

    if (localStorage) localStorage.setItem("tw:accent:isCustom", true)

    window.Recolor = {primary: getComputedStyle(document.body).getPropertyValue('--motion-primary')}

    document.body.dispatchEvent(recolorEvent);

    let descendants = Array.prototype.slice.call(
        document.body.querySelectorAll("*")
    );
    descendants.forEach(function(descendant) {
        descendant.dispatchEvent(recolorEvent);
    });
};

if (localStorage) {
    const CUSTOM_ACCENTS_ARRAY = JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY)) == 1 ? [] : JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY))
    
    for (const accentData of (CUSTOM_ACCENTS_ARRAY == [] ? [{ nothing: true }] : CUSTOM_ACCENTS_ARRAY)) {
        if (accentData.nothing) continue;
        if (accentData.enabled == true) {
            persistThemeCustom({
                primaryColor: accentData.colors.primary,
                primaryColorDark: accentData.colors.primaryDark
            })
        }
    }
}

export {
    detectTheme,
    persistTheme,
    persistThemeCustom,
    ACCENT_KEY
}