const OPEN = "nitrobolt/effectParams/OPEN";
const CLOSE = "nitrobolt/effectParams/CLOSE";

const initialState = {
    request: null,
    requestId: 0,
};

const reducer = function (state, action) {
    if (typeof state === "undefined") state = initialState;
    switch (action.type) {
    case OPEN:
        return { request: action.request, requestId: state.requestId + 1 };
    case CLOSE:
        return { ...state, request: null };
    default:
        return state;
    }
};

const openEffectParams = (request) => ({ type: OPEN, request });
const closeEffectParams = () => ({ type: CLOSE });

export {
    reducer as default,
    initialState as effectParamsInitialState,
    openEffectParams,
    closeEffectParams,
};
