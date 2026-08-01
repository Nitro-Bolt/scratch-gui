/**
 * Build the visual layout shared by folder-aware tile lists.
 *
 * Folder records form a tree through parentId. Each folder is anchored at its
 * earliest descendant item, and open folders expose their direct items and
 * child folders in the underlying item order.
 *
 * @param {Array<object>} items the underlying tile items
 * @param {Array<object>} folders the available folder records
 * @param {Array<string>} closedFolderIds IDs of folders whose descendants are hidden
 * @returns {object} flattened render entries and visual-to-underlying index maps
 */
const buildFolderLayout = (items, folders, closedFolderIds) => {
    const foldersById = new Map();
    folders.forEach(folder => {
        if (folder && !foldersById.has(folder.id)) foldersById.set(folder.id, folder);
    });

    // Only include folders which contain an item, plus their ancestors. This
    // keeps folders belonging to other targets and asset kinds out of the list.
    const relevantFolderIds = new Set();
    items.forEach(item => {
        let folder = item && item.folderId && foldersById.get(item.folderId);
        const visited = new Set();
        while (folder && !visited.has(folder.id)) {
            relevantFolderIds.add(folder.id);
            visited.add(folder.id);
            folder = folder.parentId && foldersById.get(folder.parentId);
        }
    });

    const childFolders = new Map();
    relevantFolderIds.forEach(id => childFolders.set(id, []));
    relevantFolderIds.forEach(id => {
        const folder = foldersById.get(id);
        if (folder.parentId && relevantFolderIds.has(folder.parentId)) {
            childFolders.get(folder.parentId).push(folder);
        }
    });

    const directItems = new Map();
    relevantFolderIds.forEach(id => directItems.set(id, []));
    const rootItems = [];
    items.forEach((item, index) => {
        if (item && relevantFolderIds.has(item.folderId)) directItems.get(item.folderId).push(index);
        else rootItems.push(index);
    });

    const firstIndexCache = new Map();
    const getFirstIndex = (folder, visiting = new Set()) => {
        if (firstIndexCache.has(folder.id)) return firstIndexCache.get(folder.id);
        if (visiting.has(folder.id)) return items.length;
        const nextVisiting = new Set(visiting);
        nextVisiting.add(folder.id);
        const indices = directItems.get(folder.id).slice();
        childFolders.get(folder.id).forEach(child => indices.push(getFirstIndex(child, nextVisiting)));
        const firstIndex = indices.length ? Math.min(...indices) : items.length;
        firstIndexCache.set(folder.id, firstIndex);
        return firstIndex;
    };
    relevantFolderIds.forEach(id => getFirstIndex(foldersById.get(id)));

    const byFirstIndex = (first, second) => getFirstIndex(first) - getFirstIndex(second);
    childFolders.forEach(children => children.sort(byFirstIndex));
    const rootFolders = Array.from(relevantFolderIds)
        .map(id => foldersById.get(id))
        .filter(folder => !folder.parentId || !relevantFolderIds.has(folder.parentId))
        .sort(byFirstIndex);

    const closedFolderIdSet = new Set(closedFolderIds);
    const entries = [];
    const appendFolder = (folder, depth) => {
        const isOpen = !closedFolderIdSet.has(folder.id);
        entries.push({type: 'folder', folder, depth, firstIndex: getFirstIndex(folder), isOpen});
        if (!isOpen) return;
        const contents = directItems.get(folder.id).map(itemIndex => ({type: 'item', itemIndex}))
            .concat(childFolders.get(folder.id).map(child => ({type: 'folder', folder: child})))
            .sort((first, second) => {
                const firstIndex = first.type === 'item' ? first.itemIndex : getFirstIndex(first.folder);
                const secondIndex = second.type === 'item' ? second.itemIndex : getFirstIndex(second.folder);
                return firstIndex - secondIndex;
            });
        contents.forEach(entry => {
            if (entry.type === 'item') {
                entries.push({type: 'item', itemIndex: entry.itemIndex, folder, depth: depth + 1});
            } else {
                appendFolder(entry.folder, depth + 1);
            }
        });
    };

    const rootEntries = rootItems.map(itemIndex => ({type: 'item', itemIndex}))
        .concat(rootFolders.map(folder => ({type: 'folder', folder})))
        .sort((first, second) => {
            const firstIndex = first.type === 'item' ? first.itemIndex : getFirstIndex(first.folder);
            const secondIndex = second.type === 'item' ? second.itemIndex : getFirstIndex(second.folder);
            return firstIndex - secondIndex;
        });
    rootEntries.forEach(entry => {
        if (entry.type === 'item') entries.push({...entry, folder: null, depth: 0});
        else appendFolder(entry.folder, 0);
    });

    const itemDisplayOrder = Object.create(null);
    const folderDisplayOrder = Object.create(null);
    const folderAtDisplayIndex = Object.create(null);
    const parentFolderAtDisplayIndex = Object.create(null);
    const dropIndexMap = [];
    entries.forEach((entry, displayIndex) => {
        if (entry.type === 'item') {
            itemDisplayOrder[entry.itemIndex] = displayIndex;
            dropIndexMap[displayIndex] = entry.itemIndex;
            parentFolderAtDisplayIndex[displayIndex] = entry.folder ? entry.folder.id : null;
        } else {
            folderDisplayOrder[entry.folder.id] = displayIndex;
            folderAtDisplayIndex[displayIndex] = entry.folder.id;
            dropIndexMap[displayIndex] = entry.firstIndex;
            parentFolderAtDisplayIndex[displayIndex] = entry.folder.parentId || null;
        }
    });
    dropIndexMap[entries.length] = items.length;

    return {
        displayLength: entries.length,
        dropIndexMap,
        entries,
        folderAtDisplayIndex,
        folderDisplayOrder,
        hasFolders: relevantFolderIds.size > 0,
        itemDisplayOrder,
        parentFolderAtDisplayIndex
    };
};

export default buildFolderLayout;
