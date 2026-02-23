const UPDATE_MONITORS = 'scratch-gui/monitors/UPDATE_MONITORS';

const initialState = null;

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case UPDATE_MONITORS:
        return action.monitors;
    default:
        return state;
    }
};

const updateMonitors = function (monitors) {
    return {
        type: UPDATE_MONITORS,
        monitors: monitors
    };
};

export {
    reducer as default,
    initialState as monitorsInitialState,
    updateMonitors
};
