const CLOSE_DEBUGGER = 'scratch-gui/debugger/CLOSE_DEBUGGER';
const OPEN_DEBUGGER = 'scratch-gui/debugger/OPEN_DEBUGGER';
const DRAG_DEBUGGER = 'scratch-gui/debugger/DRAG_DEBUGGER';
const START_DRAG = 'scratch-gui/debugger/START_DRAG';
const END_DRAG = 'scratch-gui/debugger/END_DRAG';

const initialState = {
    visible: false,
    x: 0,
    y: 0,
    dragging: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case OPEN_DEBUGGER:
        return Object.assign({}, state, {
            x: 0,
            y: 0,
            visible: true,
        });
    case CLOSE_DEBUGGER:
        return Object.assign({}, state, {
            visible: false
        });
    case DRAG_DEBUGGER:
        return Object.assign({}, state, {
            x: action.x,
            y: action.y
        });
    case START_DRAG:
        return Object.assign({}, state, {
            dragging: true
        });
    case END_DRAG:
        return Object.assign({}, state, {
            dragging: false
        });
    default:
        return state;
    }
};

const openDebugger = function () {
    return {type: OPEN_DEBUGGER};
};

const closeDebugger = function () {
    return {type: CLOSE_DEBUGGER};
};

const dragDebugger = function (x, y) {
    return {type: DRAG_DEBUGGER, x, y};
}

const startDrag = function () {
    return {type: START_DRAG};
};

const endDrag = function () {
    return {type: END_DRAG};
};

export {
    reducer as default,
    initialState as debuggerInitialState,
    openDebugger,
    closeDebugger,
    dragDebugger,
    startDrag,
    endDrag
};