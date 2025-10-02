let savedTempStorage = null;

function setTempStorage(tempStorage) {
    savedTempStorage = tempStorage
}

function getTempStorage() {
    return savedTempStorage
}

export {
    savedTempStorage as default,
    setTempStorage,
    getTempStorage
}