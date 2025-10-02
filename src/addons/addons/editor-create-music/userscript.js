import tempStorageClass from './temp-storage.js';

export default async function ({ addon, console }) {
    const tempStorage = (new tempStorageClass(addon.tempStorage)).tempStorage // i have no clue of what im even doing
    const defaultEditor = addon.settings.get("defaulteditor")
    tempStorage.set("dinosaurmod_musicEditor_data", defaultEditor)// dave // legacy message: node.js.yml doesn't like variables and im new at addons, so this will be used.
    localStorage.setItem("dinosaurmod_musicEditor_data", defaultEditor)// ill keep this so it saves
    //variables["dinosaurmod_musicEditor_data"] = defaultEditor
}