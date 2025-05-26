const SET_SPRITEINFO_DISABLED = 'spriteInfo/SET_DISABLED';

const initialState = false;

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_SPRITEINFO_DISABLED:
        return action.disabled;
    default:
        return state;
    }
};

const setSpriteInfoDisabled = (disabled) => ({
    type: SET_SPRITEINFO_DISABLED,
    disabled
});

export {
    reducer as default,
    initialState as spriteInfoDisabledInitialState,
    setSpriteInfoDisabled
};