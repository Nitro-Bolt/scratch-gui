import storage from '../lib/storage';

/**
 * Save a project JSON to the project server.
 * This should eventually live in scratch-www.
 * @param {number} projectId the ID of the project, null if a new project.
 * @param {object} vmState the JSON project representation.
 * @param {object} params the request params.
 * @property {?number} params.originalId the original project ID if a copy/remix.
 * @property {?boolean} params.isCopy a flag indicating if this save is creating a copy.
 * @property {?boolean} params.isRemix a flag indicating if this save is creating a remix.
 * @property {?string} params.title the title of the project.
 * @return {Promise} A promise that resolves when the network request resolves.
 */
export default function (projectId, vmState, params) {
    const options = {
        body: vmState,
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };
    const creatingProject = projectId === null || typeof projectId === 'undefined';
    const queryParams = {};
    if (Object.prototype.hasOwnProperty.call(params, 'originalId')) queryParams.original_id = params.originalId;
    if (Object.prototype.hasOwnProperty.call(params, 'isCopy')) queryParams.is_copy = params.isCopy;
    if (Object.prototype.hasOwnProperty.call(params, 'isRemix')) queryParams.is_remix = params.isRemix;
    if (Object.prototype.hasOwnProperty.call(params, 'title')) queryParams.title = params.title;
    const query = new URLSearchParams(queryParams).toString();
    const path = creatingProject ? '' : projectId;
    const url = `${storage.projectHost}/${path}${query ? `?${query}` : ''}`;
    options.method = creatingProject ? 'POST' : 'PUT';

    return fetch(url, options).then(response => {
        if (response.status !== 200) return Promise.reject(response.status);
        return response.json();
    })
        .then(body => {
            body.id = creatingProject ? body['content-name'] : projectId;
            return body;
        });
}
