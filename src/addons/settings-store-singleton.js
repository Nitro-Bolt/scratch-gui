import SettingsStore from './settings-store';

const settingStore = new SettingsStore();
// Read settings synchronously so they are available when api.js runs its
// initial addon startup loop at module evaluation time.
const urlParameters = new URLSearchParams(location.search);
if (urlParameters.has('addons')) {
    settingStore.parseUrlParameter(urlParameters.get('addons'));
} else {
    settingStore.readLocalStorage();
}
// Load custom addons asynchronously, then re-read storage so that any
// custom addon settings saved in localStorage are also applied.
settingStore.loadCustomAddons().then(() => {
    if (!urlParameters.has('addons')) {
        settingStore.readLocalStorage();
    }
});

export default settingStore;
