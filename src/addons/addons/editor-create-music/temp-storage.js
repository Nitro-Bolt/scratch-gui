let savedTempStorage = null;

class tempStorage {
    constructor(tempStorage) {
        this.tempStorage = tempStorage
        savedTempStorage = tempStorage
    }
}

export {
    tempStorage as default,
    savedTempStorage
}