let savedTempStorage = null;

function setTempStorage(tempStorage) {
    savedTempStorage = tempStorage
}

export {
    savedTempStorage as default,
    setTempStorage
}