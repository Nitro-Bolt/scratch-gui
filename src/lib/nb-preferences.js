const NB_PREFERENCES_KEY = 'nb:preferences';
const unrestrictUnsandboxed = 'unrestrictUnsandboxed';

const getNBPreferences = () => {
    try {
        const raw = localStorage.getItem(NB_PREFERENCES_KEY);
        return JSON.parse(raw ?? '{}');
    } catch (e) {
        return {};
    }
};

const getNBPreference = (key, fallback = false) => {
    const prefs = getNBPreferences();
    return Object.prototype.hasOwnProperty.call(prefs, key) ? prefs[key] : fallback;
};

export {
    NB_PREFERENCES_KEY,
    unrestrictUnsandboxed,
    getNBPreference,
    getNBPreferences
};
