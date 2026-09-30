import {
    openEffectParams,
    closeEffectParams
} from '../reducers/nb-effects-params.js';

let pendingResolve = null;

const settle = value => {
    if (pendingResolve) {
        const resolve = pendingResolve;
        pendingResolve = null;
        resolve(value);
    }
};

export const requestEffectParams = (dispatch, request) =>
    new Promise(resolve => {
        settle(null);
        pendingResolve = resolve;
        dispatch(openEffectParams(request));
    });

export const submitEffectParams = (dispatch, values) => {
    dispatch(closeEffectParams());
    settle(values);
};
export const cancelEffectParams = dispatch => {
    dispatch(closeEffectParams());
    settle(null);
};
