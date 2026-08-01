import storage from './storage';
import md5 from 'js-md5';
import {soundThumbnail} from './backpack/sound-payload';
import {arrayBufferToBase64, base64ToArrayBuffer} from './tw-base64-utils';
import {requestPersistentStorage} from './tw-persistent-storage';

// Special constants -- do not change without care.
const DATABASE_NAME = 'TW_Backpack';
const DATABASE_VERSION = 1;
const STORE_NAME = 'backpack';
const MUTABLE_FIELDS = ['name', 'folderId', 'color', 'open', 'backpackOrder'];

const idsEqual = (first, second) => `${first}` === `${second}`;

const getBackpackOrder = item => (
    typeof item.backpackOrder === 'number' ? item.backpackOrder : Number(item.id)
);

const sortBackpackItems = items => items.sort((first, second) =>
    getBackpackOrder(second) - getBackpackOrder(first));

const persistBackpackOrder = (store, items) => {
    items.forEach((item, index) => {
        const orderedItem = {
            ...item,
            backpackOrder: items.length - index
        };
        items[index] = orderedItem;
        store.put(orderedItem);
    });
    return items.map(item => `${item.id}`);
};

const mutableChangesFrom = object => MUTABLE_FIELDS.reduce((changes, field) => {
    if (Object.prototype.hasOwnProperty.call(object, field)) changes[field] = object[field];
    return changes;
}, {});

const idbItemToBackpackItem = item => {
    // convert id to string
    item.id = `${item.id}`;

    if (item.type === 'sound') {
        // For sounds, use the local thumbnail instead of what was stored in the backpack.
        // The thumbnail was updated and it doesn't make sense for already backpacked sounds to
        // use the old icon instead of the new one.
        item.thumbnailUrl = `data:;base64,${soundThumbnail}`;
    } else {
        // Thumbnail could be any image format. The browser will figure out which format it is.
        item.thumbnailUrl = `data:;base64,${arrayBufferToBase64(item.thumbnailData)}`;
    }

    let assetType;
    if (item.type === 'script') {
        item.bodyUrl = `data:application/json;base64,${arrayBufferToBase64(item.bodyData)}`;
    } else if (item.type === 'sprite') {
        item.bodyUrl = `data:application/zip;base64,${arrayBufferToBase64(item.bodyData)}`;
    } else if (item.type === 'costume') {
        if (item.mime === 'image/svg+xml') {
            assetType = storage.AssetType.ImageVector;
        } else if (item.mime === 'image/png' || item.mime === 'image/jpeg') {
            assetType = storage.AssetType.ImageBitmap;
        }
    } else if (item.type === 'sound') {
        assetType = storage.AssetType.Sound;
    } else if (item.type === 'asset') {
        assetType = storage.AssetType.Asset;
        assetType.runtimeFormat = item.dataFormat;
        assetType.contentType = item.contentType;
    }

    if (assetType) {
        const extension = assetType.runtimeFormat;
        const itemMD5 = item.bodyMD5;
        const md5ext = `${itemMD5}.${extension}`;
        item.body = md5ext;
        storage.builtinHelper._store(
            assetType,
            extension,
            new Uint8Array(item.bodyData),
            itemMD5
        );
    }

    return item;
};

let _db;
const openDB = () => new Promise((resolve, reject) => {
    if (_db) {
        resolve(_db);
        return;
    }

    if (!window.indexedDB) {
        reject(new Error('indexedDB is not supported'));
        return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = event => {
        const db = event.target.result;
        db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
        });
    };

    request.onsuccess = event => {
        _db = event.target.result;
        resolve(_db);
    };

    request.onerror = event => {
        reject(new Error(`DB error: ${event.target.error}`));
    };
});

const getBackpackContents = async ({
    limit,
    offset
}) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        transaction.onerror = event => {
            reject(new Error(`Getting contents: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        const items = [];
        const request = store.openCursor(null, 'prev');
        request.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            } else {
                const start = typeof offset === 'number' ? offset : 0;
                const end = typeof limit === 'number' ? start + limit : items.length;
                resolve(sortBackpackItems(items).slice(start, end)
                    .map(idbItemToBackpackItem));
            }
        };
    });
};

const saveBackpackObject = async backpackObject => {
    // User interaction -- fine to show a permission dialog
    requestPersistentStorage();

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.onerror = event => {
            reject(new Error(`Saving object: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        const bodyData = base64ToArrayBuffer(backpackObject.body);
        const bodyMD5 = md5(bodyData);
        const idbItem = {
            ...backpackObject,
            bodyData,
            bodyMD5,
            thumbnailData: base64ToArrayBuffer(backpackObject.thumbnail)
        };

        // Delete some unnecessary items
        delete idbItem.body;
        delete idbItem.thumbnail;

        const putRequest = store.put(idbItem);
        putRequest.onsuccess = () => {
            idbItem.id = putRequest.result;
            resolve(idbItemToBackpackItem(idbItem));
        };
    });
};

const deleteBackpackObject = async ({
    id
}) => {
    id = +id;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.onerror = event => {
            reject(new Error(`Deleting object: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        // Convert string IDs to number IDs
        const deleteRequest = store.delete(id);
        deleteRequest.onsuccess = () => {
            resolve();
        };
    });
};

const updateBackpackObject = async ({
    id,
    ...requestedChanges
}) => {
    id = +id;
    const changes = mutableChangesFrom(requestedChanges);
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.onerror = event => {
            reject(new Error(`Updating object: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            if (!getRequest.result) {
                reject(new Error(`Backpack item does not exist: ${id}`));
                return;
            }
            const newItem = {
                ...getRequest.result,
                ...changes
            };
            const putRequest = store.put(newItem);
            putRequest.onsuccess = () => {
                resolve(idbItemToBackpackItem(newItem));
            };
        };
    });
};

/**
 * Delete an item while keeping folder membership consistent. All records
 * are examined in the same transaction so this is safe when the UI is paginated.
 * Deleting a folder moves all of its children to the backpack root. Deleting the
 * final child of a folder also deletes the now-empty folder.
 * @param {object} options delete options
 * @param {string} options.id item ID
 * @returns {Promise<object>} information needed to update the loaded UI page
 */
const deleteBackpackObjectWithFolders = async ({id}) => {
    const numericId = +id;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const records = [];
        let result;

        transaction.onerror = event => {
            reject(new Error(`Deleting object with folders: ${event.target.error}`));
        };
        transaction.oncomplete = () => resolve(result);

        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                records.push(cursor.value);
                cursor.continue();
                return;
            }

            const item = records.find(record => idsEqual(record.id, numericId));
            if (!item) {
                result = {
                    deletedFolderId: null,
                    detachedItemIds: []
                };
                return;
            }

            if (item.type === 'folder') {
                const children = records.filter(record => idsEqual(record.folderId, item.id));
                children.forEach(child => store.put({...child, folderId: null}));
                store.delete(numericId);
                result = {
                    deletedFolderId: `${item.id}`,
                    detachedItemIds: children.map(child => `${child.id}`)
                };
                return;
            }

            store.delete(numericId);
            const oldFolderId = item.folderId || null;
            const oldFolderHasChildren = oldFolderId && records.some(record =>
                !idsEqual(record.id, item.id) && idsEqual(record.folderId, oldFolderId));
            if (oldFolderId && !oldFolderHasChildren) store.delete(+oldFolderId);
            result = {
                deletedFolderId: oldFolderId && !oldFolderHasChildren ? `${oldFolderId}` : null,
                detachedItemIds: []
            };
        };
    });
};

/**
 * Move an item to a folder and remove its previous folder if that folder becomes
 * empty. The item update, emptiness check, and optional delete are atomic.
 * @param {object} options move options
 * @param {string} options.id item ID
 * @param {?string} options.folderId destination folder ID, or null for root
 * @param {?string} options.destinationId item or folder used as the ordering boundary
 * @param {boolean} options.insertAfter whether to insert after the destination boundary
 * @returns {Promise<object>} updated item and any folder deleted as a result
 */
const moveBackpackObjectToFolder = async ({id, folderId, destinationId = null, insertAfter = false}) => {
    const numericId = +id;
    const destinationFolderId = folderId || null;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const records = [];
        let failed = false;
        let result;

        transaction.onerror = event => {
            reject(new Error(`Moving backpack object: ${event.target.error}`));
        };
        transaction.oncomplete = () => {
            if (!failed) resolve(result);
        };

        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                records.push(cursor.value);
                cursor.continue();
                return;
            }

            sortBackpackItems(records);
            const item = records.find(record => idsEqual(record.id, numericId));
            const destinationFolder = destinationFolderId && records.find(record =>
                record.type === 'folder' && idsEqual(record.id, destinationFolderId));
            const dropDestination = destinationId && records.find(record => idsEqual(record.id, destinationId));
            if (!item || item.type === 'folder' || (destinationFolderId && !destinationFolder) ||
                (destinationId && !dropDestination)) {
                failed = true;
                reject(new Error('Invalid backpack folder move'));
                return;
            }

            const oldFolderId = item.folderId || null;
            const membershipChanged = !idsEqual(oldFolderId, destinationFolderId);
            const reorderRequested = dropDestination && !idsEqual(dropDestination.id, item.id);
            if (!membershipChanged && !reorderRequested) {
                result = {
                    item,
                    deletedFolderId: null,
                    orderedIds: records.map(record => `${record.id}`)
                };
                return;
            }

            const oldFolder = oldFolderId && records.find(record =>
                record.type === 'folder' && idsEqual(record.id, oldFolderId));
            const oldFolderHasChildren = oldFolder &&
                records.some(record => !idsEqual(record.id, item.id) && idsEqual(record.folderId, oldFolderId));
            const deletedFolderId = membershipChanged && oldFolder && !oldFolderHasChildren ? `${oldFolderId}` : null;
            if (deletedFolderId) store.delete(+deletedFolderId);

            const originalIndex = records.indexOf(item);
            const reordered = records.filter(record => !idsEqual(record.id, item.id) &&
                (!deletedFolderId || !idsEqual(record.id, deletedFolderId)));
            let insertionIndex = Math.min(originalIndex, reordered.length);
            if (reorderRequested) {
                const destinationIndex = reordered.findIndex(record =>
                    idsEqual(record.id, dropDestination.id));
                if (destinationIndex >= 0) {
                    const enteringFolder = dropDestination.type === 'folder' && destinationFolderId &&
                        idsEqual(dropDestination.id, destinationFolderId);
                    insertionIndex = enteringFolder ? destinationIndex + 1 : destinationIndex;
                    if (insertAfter) {
                        if (!enteringFolder) insertionIndex++;
                        if (dropDestination.type === 'folder') {
                            while (insertionIndex < reordered.length &&
                                idsEqual(reordered[insertionIndex].folderId, dropDestination.id)) insertionIndex++;
                        }
                    }
                } else if (deletedFolderId && idsEqual(dropDestination.id, deletedFolderId)) {
                    const deletedFolderIndex = records.findIndex(record => idsEqual(record.id, deletedFolderId));
                    insertionIndex = Math.max(0, Math.min(reordered.length, deletedFolderIndex));
                }
            } else {
                const adjacentFolderId = destinationFolderId || (deletedFolderId ? null : oldFolderId);
                if (adjacentFolderId) {
                    const folderIndex = reordered.findIndex(record => idsEqual(record.id, adjacentFolderId));
                    if (folderIndex >= 0) {
                        insertionIndex = folderIndex + 1;
                        while (insertionIndex < reordered.length &&
                            idsEqual(reordered[insertionIndex].folderId, adjacentFolderId)) insertionIndex++;
                    }
                } else if (deletedFolderId) {
                    const deletedFolderIndex = records.findIndex(record => idsEqual(record.id, deletedFolderId));
                    insertionIndex = Math.max(0, Math.min(reordered.length, deletedFolderIndex));
                }
            }

            const updatedItem = {...item, folderId: destinationFolderId};
            reordered.splice(insertionIndex, 0, updatedItem);
            const orderedIds = persistBackpackOrder(store, reordered);
            const storedItem = reordered.find(record => idsEqual(record.id, item.id));
            result = {
                item: storedItem,
                deletedFolderId,
                orderedIds
            };
        };
    }).then(result => ({
        ...result,
        item: idbItemToBackpackItem(result.item)
    }));
};

/**
 * Persist a folder drag by assigning a stable order to every backpack record.
 * Folder children travel with their folder, including children outside the
 * currently loaded UI page.
 * @param {object} options reorder options
 * @param {string} options.sourceId dragged folder ID
 * @param {string} options.destinationId destination item or folder ID
 * @param {boolean} options.insertAfter whether to insert after the destination group
 * @returns {Promise<Array<string>>} complete ordered list of record IDs
 */
const reorderBackpackFolder = async ({sourceId, destinationId, insertAfter = false}) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const records = [];
        let failed = false;
        let orderedIds = [];

        transaction.onerror = event => {
            reject(new Error(`Reordering backpack folder: ${event.target.error}`));
        };
        transaction.oncomplete = () => {
            if (!failed) resolve(orderedIds);
        };

        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                records.push(cursor.value);
                cursor.continue();
                return;
            }

            sortBackpackItems(records);
            const source = records.find(record => record.type === 'folder' && idsEqual(record.id, sourceId));
            const destinationItem = records.find(record => idsEqual(record.id, destinationId));
            const destinationFolder = destinationItem && destinationItem.folderId && records.find(record =>
                record.type === 'folder' && idsEqual(record.id, destinationItem.folderId));
            const destination = destinationFolder || destinationItem;
            if (!source || !destination) {
                failed = true;
                reject(new Error('Invalid backpack folder reorder'));
                return;
            }

            if (idsEqual(source.id, destination.id)) {
                orderedIds = records.map(record => `${record.id}`);
                return;
            }

            const group = [source].concat(records.filter(record =>
                !idsEqual(record.id, source.id) && idsEqual(record.folderId, source.id)));
            const remainder = records.filter(record =>
                !idsEqual(record.id, source.id) && !idsEqual(record.folderId, source.id));
            let destinationIndex = remainder.findIndex(record => idsEqual(record.id, destination.id));
            if (insertAfter) {
                destinationIndex++;
                if (destination.type === 'folder') {
                    while (destinationIndex < remainder.length &&
                        idsEqual(remainder[destinationIndex].folderId, destination.id)) destinationIndex++;
                }
            }
            remainder.splice(destinationIndex, 0, ...group);
            orderedIds = persistBackpackOrder(store, remainder);
        };
    });
};

export default {
    getBackpackContents,
    saveBackpackObject,
    deleteBackpackObject,
    updateBackpackObject,
    deleteBackpackObjectWithFolders,
    moveBackpackObjectToFolder,
    reorderBackpackFolder
};
