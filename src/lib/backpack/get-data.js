const getBackpackData = payload => {
    if (payload.bodyData) {
        return Promise.resolve(payload.bodyData);
    }
    if (!payload.bodyUrl) {
        return Promise.reject(new Error('Backpack item has no file data'));
    }
    return fetch(payload.bodyUrl).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText || `Could not load backpack item: ${response.status}`);
        }
        return response.arrayBuffer();
    });
};

export default getBackpackData;
