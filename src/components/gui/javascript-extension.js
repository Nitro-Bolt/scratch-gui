// the code is from: https://stackoverflow.com/questions/2010892/how-to-store-objects-in-html5-localstorage-sessionstorage/23516713#23516713
Storage.prototype.getArray_INTERNAL = function(arrayName) {
    var thisArray = [];
    var fetchArrayObject = this.getItem(arrayName);
    if (typeof fetchArrayObject !== 'undefined') {
        if (fetchArrayObject !== null) { thisArray = JSON.parse(fetchArrayObject); }
    }
    return thisArray;
}

Storage.prototype.pushArrayItem_INTERNAL = function(arrayName,arrayItem) {
    var existingArray = this.getArray_INTERNAL(arrayName);
    existingArray.push(arrayItem);
    this.setItem(arrayName,JSON.stringify(existingArray));
}

Storage.prototype.popArrayItem_INTERNAL = function(arrayName) {
    var arrayItem = {};
    var existingArray = this.getArray_INTERNAL(arrayName);
    if (existingArray.length > 0) {
        arrayItem = existingArray.pop();
        this.setItem(arrayName,JSON.stringify(existingArray));
    }
    return arrayItem;
}

Storage.prototype.shiftArrayItem_INTERNAL = function(arrayName) {
    var arrayItem = {};
    var existingArray = this.getArray_INTERNAL(arrayName);
    if (existingArray.length > 0) {
        arrayItem = existingArray.shift();
        this.setItem(arrayName,JSON.stringify(existingArray));
    }
    return arrayItem;
}

Storage.prototype.unshiftArrayItem_INTERNAL = function(arrayName,arrayItem) {
    var existingArray = this.getArray_INTERNAL(arrayName);
    existingArray.unshift(arrayItem);
    this.setItem(arrayName,JSON.stringify(existingArray));
}

Storage.prototype.deleteArray_INTERNAL = function(arrayName) {
    this.removeItem(arrayName);
}