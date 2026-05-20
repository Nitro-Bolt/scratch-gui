const SET_HIDDEN_CATEGORIES = 'scratch-gui/hidden-categories/SET';

const load = () => {
    try {
        return JSON.parse(localStorage.getItem('nb:hidden-categories') || '[]');
    } catch {
        return [];
    }
};

const reducer = (state = load(), action) => {
    if (action.type === SET_HIDDEN_CATEGORIES) {
        try {
            localStorage.setItem('nb:hidden-categories', JSON.stringify(action.hiddenCategories));
        } catch {
            console.warn('Error while trying to save hidden categories.', error);
        }
        return action.hiddenCategories;
    }
    return state;
};

const setHiddenCategories = hiddenCategories => ({
    type: SET_HIDDEN_CATEGORIES,
    hiddenCategories
});

export {reducer as default, setHiddenCategories};
