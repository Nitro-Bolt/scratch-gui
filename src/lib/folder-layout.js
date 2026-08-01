/**
 * Build the visual layout shared by folder-aware tile lists.
 *
 * A folder is positioned at its first member and its members are displayed
 * immediately after it in their underlying item order. Items with a missing
 * folder record remain ordinary root items.
 *
 * @param {Array<object>} items the underlying tile items
 * @param {Array<object>} folders the available folder records
 * @param {Array<string>} closedFolderIds IDs of folders whose members are hidden
 * @returns {object} the grouped render model and visual-to-underlying index maps
 */
const buildFolderLayout = (items, folders, closedFolderIds) => {
    const foldersById = new Map();
    folders.forEach(folder => {
        // Match Array#find semantics when malformed data contains duplicate IDs.
        if (!foldersById.has(folder.id)) foldersById.set(folder.id, folder);
    });

    const groups = [];
    const folderGroupsById = new Map();
    items.forEach((item, index) => {
        const folder = item.folderId && foldersById.get(item.folderId);
        if (!folder) {
            groups.push({
                folder: null,
                firstIndex: index,
                itemIndices: [index],
                isOpen: true
            });
            return;
        }

        let group = folderGroupsById.get(folder.id);
        if (!group) {
            group = {
                folder,
                firstIndex: index,
                itemIndices: [],
                isOpen: true
            };
            folderGroupsById.set(folder.id, group);
            groups.push(group);
        }
        group.itemIndices.push(index);
    });

    const closedFolderIdSet = new Set(closedFolderIds);
    const itemDisplayOrder = {};
    const folderDisplayOrder = {};
    const dropIndexMap = [];
    let displayLength = 0;

    groups.forEach(group => {
        if (!group.folder) {
            itemDisplayOrder[group.firstIndex] = displayLength;
            dropIndexMap[displayLength++] = group.firstIndex;
            return;
        }

        group.isOpen = !closedFolderIdSet.has(group.folder.id);
        folderDisplayOrder[group.folder.id] = displayLength;
        dropIndexMap[displayLength++] = group.firstIndex;
        if (group.isOpen) {
            group.itemIndices.forEach(index => {
                itemDisplayOrder[index] = displayLength;
                dropIndexMap[displayLength++] = index;
            });
        }
    });
    dropIndexMap[displayLength] = items.length;

    return {
        displayLength,
        dropIndexMap,
        folderDisplayOrder,
        groups,
        hasFolders: folderGroupsById.size > 0,
        itemDisplayOrder
    };
};

export default buildFolderLayout;
