import SettingsStore from './settings-store-singleton';
import { createStore } from 'redux';

const initialState = {
  settingsStore: SettingsStore,
};

function settingsReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

const store = createStore(settingsReducer);

export default store;