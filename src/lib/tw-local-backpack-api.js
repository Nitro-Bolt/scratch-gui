import storage from './storage';
import md5 from 'js-md5';
import {soundThumbnail} from './backpack/sound-payload';
import {arrayBufferToBase64, base64ToArrayBuffer} from './tw-base64-utils';
import {requestPersistentStorage} from './tw-persistent-storage';
import normalizeBackpackFolders from './backpack-folder-utils';

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
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        let result;
        transaction.onerror = event => {
            reject(new Error(`Getting contents: ${event.target.error}`));
        };
        transaction.oncomplete = () => resolve(result);
        const store = transaction.objectStore(STORE_NAME);
        const items = [];
        const request = store.openCursor(null, 'prev');
        request.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            } else {
                const normalizedItems = normalizeBackpackFolders(items);
                normalizedItems.forEach((item, index) => {
                    if (item !== items[index]) store.put(item);
                });
                const start = typeof offset === 'number' ? offset : 0;
                const end = typeof limit === 'number' ? start + limit : normalizedItems.length;
                result = sortBackpackItems(normalizedItems).slice(start, end)
                    .map(item => idbItemToBackpackItem({...item}));
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
 * Deleting a folder moves all of its children to its parent. Deleting the
 * final child of a folder also deletes the now-empty folder.
 * @param {object} options delete options
 * @param {string} options.id item ID
 * @param {boolean} options.deleteContents recursively delete folder contents
 * @returns {Promise<object>} information needed to update the loaded UI page
 */
const deleteBackpackObjectWithFolders = async ({id, deleteContents = false}) => {
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
                if (deleteContents) {
                    const folderIds = new Set([`${item.id}`]);
                    let foundDescendant = true;
                    while (foundDescendant) {
                        foundDescendant = false;
                        for (const record of records) {
                            if (record.type === 'folder' && record.folderId &&
                                folderIds.has(`${record.folderId}`) && !folderIds.has(`${record.id}`)) {
                                folderIds.add(`${record.id}`);
                                foundDescendant = true;
                            }
                        }
                    }
                    const removedIds = new Set(records
                        .filter(record => folderIds.has(`${record.id}`) ||
                            (record.folderId && folderIds.has(`${record.folderId}`)))
                        .map(record => `${record.id}`));
                    let emptyCandidate = item.folderId && records.find(record =>
                        record.type === 'folder' && idsEqual(record.id, item.folderId));
                    while (emptyCandidate) {
                        const candidateId = emptyCandidate.id;
                        if (records.some(record => !removedIds.has(`${record.id}`) &&
                            idsEqual(record.folderId, candidateId))) break;
                        folderIds.add(`${candidateId}`);
                        removedIds.add(`${candidateId}`);
                        const parentId = emptyCandidate.folderId;
                        emptyCandidate = parentId && records.find(record =>
                            record.type === 'folder' && idsEqual(record.id, parentId));
                    }
                    removedIds.forEach(deletedId => store.delete(+deletedId));
                    result = {
                        deletedFolderId: `${item.id}`,
                        deletedFolderIds: Array.from(folderIds),
                        deletedIds: Array.from(removedIds),
                        detachedItemIds: []
                    };
                    return;
                }
                const children = records.filter(record => idsEqual(record.folderId, item.id));
                children.forEach(child => store.put({...child, folderId: item.folderId || null}));
                store.delete(numericId);
                result = {
                    deletedFolderId: `${item.id}`,
                    deletedIds: [`${item.id}`],
                    detachedItemIds: children.map(child => `${child.id}`)
                };
                return;
            }

            store.delete(numericId);
            const oldFolderId = item.folderId || null;
            const removedIds = new Set([`${item.id}`]);
            let candidate = oldFolderId && records.find(record =>
                record.type === 'folder' && idsEqual(record.id, oldFolderId));
            while (candidate) {
                const candidateId = candidate.id;
                if (records.some(record => !removedIds.has(`${record.id}`) &&
                    idsEqual(record.folderId, candidateId))) break;
                removedIds.add(`${candidate.id}`);
                store.delete(+candidate.id);
                const parentId = candidate.folderId;
                candidate = parentId && records.find(record =>
                    record.type === 'folder' && idsEqual(record.id, parentId));
            }
            const deletedFolderIds = Array.from(removedIds).filter(removedId => !idsEqual(removedId, item.id));
            result = {
                deletedFolderId: deletedFolderIds[0] || null,
                deletedFolderIds,
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
            if (!item || (destinationFolderId && !destinationFolder) ||
                (destinationId && !dropDestination)) {
                failed = true;
                reject(new Error('Invalid backpack folder move'));
                return;
            }
            if (item.type === 'folder') {
                if (destinationFolder && idsEqual(destinationFolder.id, item.id)) {
                    failed = true;
                    reject(new Error('A backpack folder cannot contain itself'));
                    return;
                }
                let ancestor = destinationFolder;
                const visitedAncestorIds = new Set();
                while (ancestor && !visitedAncestorIds.has(`${ancestor.id}`)) {
                    if (idsEqual(ancestor.id, item.id)) {
                        failed = true;
                        reject(new Error('A backpack folder cannot be moved into its descendant'));
                        return;
                    }
                    visitedAncestorIds.add(`${ancestor.id}`);
                    const ancestorFolderId = ancestor.folderId;
                    ancestor = ancestorFolderId && records.find(record =>
                        record.type === 'folder' && idsEqual(record.id, ancestorFolderId));
                }
                if (ancestor) {
                    failed = true;
                    reject(new Error('Backpack folder hierarchy contains a cycle'));
                    return;
                }
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
            const removedIds = new Set([`${item.id}`]);
            const deletedFolderIds = [];
            let emptyCandidate = membershipChanged && oldFolder;
            while (emptyCandidate) {
                const candidateId = emptyCandidate.id;
                if (destinationFolderId && idsEqual(candidateId, destinationFolderId)) break;
                if (records.some(record => !removedIds.has(`${record.id}`) &&
                    idsEqual(record.folderId, candidateId))) break;
                deletedFolderIds.push(`${emptyCandidate.id}`);
                removedIds.add(`${emptyCandidate.id}`);
                store.delete(+emptyCandidate.id);
                const parentId = emptyCandidate.folderId;
                emptyCandidate = parentId && records.find(record =>
                    record.type === 'folder' && idsEqual(record.id, parentId));
            }
            const deletedFolderId = deletedFolderIds[0] || null;

            const originalIndex = records.indexOf(item);
            const reordered = records.filter(record => !removedIds.has(`${record.id}`));
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
                deletedFolderIds,
                orderedIds
            };
        };
    }).then(result => ({
        ...result,
        item: idbItemToBackpackItem(result.item)
    }));
};

export default {
    getBackpackContents,
    saveBackpackObject,
    deleteBackpackObject,
    updateBackpackObject,
    deleteBackpackObjectWithFolders,
    moveBackpackObjectToFolder
};
