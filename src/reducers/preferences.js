const NB_PREFERENCES_KEY = 'nb:preferences';

const SET_PREFERENCE = 'scratch-gui/preferences/SET_PREFERENCE';

const initialState = JSON.parse(localStorage.getItem(NB_PREFERENCES_KEY) || '{}');

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_PREFERENCE:
        const newState = Object.assign({}, state, {
            [action.key]: action.value
        });
        localStorage.setItem(NB_PREFERENCES_KEY, JSON.stringify(newState));
        return newState;
    default:
        return state;
    }
};

const setPreference = (key, value) => ({
    type: SET_PREFERENCE,
    key,
    value
});

export {
    reducer as default,
    initialState as preferencesInitialState,
    setPreference
};