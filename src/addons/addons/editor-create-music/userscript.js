import savedTempStorage, { setTempStorage } from './temp-storage.js';

export default async function ({ addon, console }) {
    const tempStorage = addon.tempStorage
    setTempStorage(tempStorage)

    const defaultEditor = addon.settings.get("defaulteditor")
    tempStorage.set("dinosaurmod_musicEditor_data", defaultEditor)// legacy message: node.js.yml doesn't like variables and im new at addons, so this will be used.
    localStorage.setItem("dinosaurmod_musicEditor_data", defaultEditor)// ill keep this so it saves
    //variables["dinosaurmod_musicEditor_data"] = defaultEditor
}