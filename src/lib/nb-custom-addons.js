import {requestPersistentStorage} from './tw-persistent-storage';
import JSZip from '@turbowarp/jszip';

const DATABASE_NAME = 'NB_CustomAddons';
const DATABASE_VERSION = 1;
const STORE_NAME = 'addons';

// Cache some things so we don't have to call indexedDB repeatedly.
let _db;
let _loadedAddons;

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
            keyPath: 'id'
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

const getCustomAddons = async () => {
    if (_loadedAddons) return _loadedAddons;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        transaction.onerror = event => {
            reject(new Error(`Getting contents: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            _loadedAddons = request.result;
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
};

const loadAddon = async file => {
    const zip = new JSZip();
    await zip.loadAsync(file);

    if (!zip.file('manifest.json')) {
        throw new Error('manifest.json not found');
    }

    const manifestString = await zip.file('manifest.json').async('string');
    const manifest = JSON.parse(manifestString);

    let userscriptPaths = [];
    manifest.userscripts = await Promise.all(
        manifest.userscripts.map(userscript => {
            userscriptPaths.push(userscript.url);
            const file = zip.file(userscript.url);
            return file.async('arraybuffer');
        })
    );

    manifest.resources = Object.create(null);
    await Promise.all(
        Object.entries(zip.files).map(async ([path, file]) => {
            if (
                !userscriptPaths.includes(path) &&
                path !== 'manifest.json' &&
                // Zip file's made with macOS can include these useless files
                !path.startsWith('__MACOSX')
            ) manifest.resources[path] = await file.async('arraybuffer');
        })
    );

    return manifest;
};

const storeAddon = async file => {
    requestPersistentStorage();

    const db = await openDB();
    const manifest = await loadAddon(file);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.onerror = event => {
            reject(new Error(`Storing addon: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        const putRequest = store.put(manifest);
        putRequest.onsuccess = () => {
            _loadedAddons = null;
            resolve(manifest);
        };
    });
};

const removeAddon = async id => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.onerror = event => {
            reject(new Error(`Removing addon: ${event.target.error}`));
        };
        const store = transaction.objectStore(STORE_NAME);
        const deleteRequest = store.delete(id);
        deleteRequest.onsuccess = () => {
            _loadedAddons = null;
            resolve();
        };
    });
};

export {
    getCustomAddons,
    storeAddon,
    removeAddon
};