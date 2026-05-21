import SettingsStore from './settings-store';

const settingStore = new SettingsStore();
// Load custom addons before anything else
settingStore.loadCustomAddons().then(() => {
    const urlParameters = new URLSearchParams(location.search);
    if (urlParameters.has('addons')) {
        settingStore.parseUrlParameter(urlParameters.get('addons'));
    } else {
        settingStore.readLocalStorage();
    }
});

export default settingStore;
