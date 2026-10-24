import costumePayload from './backpack/costume-payload';
import soundPayload from './backpack/sound-payload';
import assetPayload from './backpack/asset-payload';
import spritePayload from './backpack/sprite-payload';
import codePayload from './backpack/code-payload';
import localBackpackAPI from './tw-local-backpack-api';

export const LOCAL_API = '_local_';
const MUTABLE_FIELDS = ['name', 'folderId', 'color', 'open', 'backpackOrder'];

const mutableChangesFrom = object => MUTABLE_FIELDS.reduce((changes, field) => {
    if (Object.prototype.hasOwnProperty.call(object, field)) changes[field] = object[field];
    return changes;
}, {});

// Add a new property for the full thumbnail url, which includes the host.
// Also include a full body url for loading sprite zips
// TODO retreiving the images through storage would allow us to remove this.
const includeFullUrls = (item, host) => Object.assign({}, item, {
    thumbnailUrl: `${host}/${item.thumbnail}`,
    bodyUrl: `${host}/${item.body}`
});

const fetchResponse = (uri, options = {}) => fetch(uri, options).then(response => {
    if (!response.ok) {
        throw new Error(response.statusText || `Request failed with status ${response.status}`);
    }
    return response;
});

const getBackpackContents = ({
    host,
    username,
    token,
    limit,
    offset
}) => {
    if (host === LOCAL_API) {
        return Promise.resolve(localBackpackAPI.getBackpackContents({
            limit,
            offset
        }));
    }
    return fetchResponse(`${host}/${username}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {'x-token': token}
    }).then(response => response.json())
        .then(items => items.map(item => includeFullUrls(item, host)));
};

const saveBackpackObject = ({
    host,
    username,
    token,
    type, // Type of object being saved to the backpack
    mime, // Mime-type of the object being saved
    name, // User-facing name of the object being saved
    body, // Base64-encoded body of the object being saved
    thumbnail, // Base64-encoded JPEG thumbnail of the object being saved
    ...extra // Any other data that a payload may contain
}) => {
    if (host === LOCAL_API) {
        return Promise.resolve(localBackpackAPI.saveBackpackObject({
            type,
            mime,
            name,
            body,
            thumbnail,
            ...extra
        }));
    }
    return fetchResponse(`${host}/${username}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-token': token
        },
        body: JSON.stringify({type, mime, name, body, thumbnail, ...extra})
    }).then(response => response.json())
        .then(item => includeFullUrls(item, host));
};

const deleteBackpackObject = ({
    host,
    username,
    token,
    id
}) => {
    if (host === LOCAL_API) {
        return Promise.resolve(localBackpackAPI.deleteBackpackObject({
            id
        }));
    }
    return fetchResponse(`${host}/${username}/${id}`, {
        method: 'DELETE',
        headers: {'x-token': token}
    }).then(response => response.text());
};

const updateBackpackObject = options => new Promise((resolve, reject) => {
    const {host, id} = options;
    if (host === LOCAL_API) {
        return resolve(localBackpackAPI.updateBackpackObject({
            id,
            ...mutableChangesFrom(options)
        }));
    }
    reject(new Error('updateBackpackObject not supported'));
});

const deleteBackpackObjectWithFolders = ({host, id, deleteContents}) => new Promise((resolve, reject) => {
    if (host === LOCAL_API) {
        return resolve(localBackpackAPI.deleteBackpackObjectWithFolders({id, deleteContents}));
    }
    reject(new Error('Native backpack folders are not supported by this host'));
});

const moveBackpackObjectToFolder = ({host, id, folderId, destinationId, insertAfter}) =>
    new Promise((resolve, reject) => {
        if (host === LOCAL_API) {
            return resolve(localBackpackAPI.moveBackpackObjectToFolder({
                id,
                folderId,
                destinationId,
                insertAfter
            }));
        }
        reject(new Error('Native backpack folders are not supported by this host'));
    });

// Two types of backpack items are not retreivable through storage
// code, as json and sprite3 as arraybuffer zips.
const fetchAs = (responseType, uri) => fetchResponse(uri)
    .then(response => (responseType === 'json' ? response.json() : response.arrayBuffer()));

// These two helpers allow easy fetching of backpack code and sprite zips
// Use the curried fetchAs here so the consumer does not worry about XHR responseTypes
const fetchCode = fetchAs.bind(null, 'json');
const fetchSprite = fetchAs.bind(null, 'arraybuffer');

export {
    getBackpackContents,
    saveBackpackObject,
    deleteBackpackObject,
    updateBackpackObject,
    deleteBackpackObjectWithFolders,
    moveBackpackObjectToFolder,
    costumePayload,
    soundPayload,
    assetPayload,
    spritePayload,
    codePayload,
    fetchCode,
    fetchSprite
};
