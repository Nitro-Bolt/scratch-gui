import SettingsStore from './settings-store';

const settingStore = new SettingsStore();
const urlParameters = new URLSearchParams(location.search);
if (urlParameters.has('addons')) {
    settingStore.parseUrlParameter(urlParameters.get('addons'));
} else {
    settingStore.readLocalStorage();
}
settingStore.loadCustomAddons();

export default settingStore;
