const idsEqual = (first, second) => `${first}` === `${second}`;

/**
 * Repair folder membership loaded from IndexedDB. This keeps old or partially
 * written records from making an entire folder subtree unreachable in the UI.
 * @param {Array<object>} items raw backpack records
 * @returns {Array<object>} records with valid, acyclic folder membership
 */
const normalizeBackpackFolders = items => {
    const foldersById = new Map(items
        .filter(item => item.type === 'folder')
        .map(folder => [`${folder.id}`, folder]));
    const parentById = new Map();

    for (const [id, folder] of foldersById) {
        const parent = folder.folderId && foldersById.get(`${folder.folderId}`);
        parentById.set(id, parent && !idsEqual(parent.id, folder.id) ? parent.id : null);
    }

    const visitState = new Map();
    const visit = id => {
        visitState.set(id, 1);
        const parentId = parentById.get(id);
        if (parentId) {
            const parentKey = `${parentId}`;
            if (visitState.get(parentKey) === 1) {
                // Break the edge which closes the cycle. The remaining folders
                // stay together as one valid tree instead of all disappearing.
                parentById.set(id, null);
            } else if (visitState.get(parentKey) !== 2) {
                visit(parentKey);
            }
        }
        visitState.set(id, 2);
    };
    for (const id of foldersById.keys()) {
        if (!visitState.has(id)) visit(id);
    }

    return items.map(item => {
        let normalizedFolderId;
        if (item.type === 'folder') {
            normalizedFolderId = parentById.get(`${item.id}`);
        } else {
            const parent = item.folderId && foldersById.get(`${item.folderId}`);
            normalizedFolderId = parent ? parent.id : null;
        }
        return idsEqual(item.folderId || null, normalizedFolderId) ?
            item : {...item, folderId: normalizedFolderId};
    });
};

export default normalizeBackpackFolders;
