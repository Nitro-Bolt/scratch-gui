const nameCollator = new Intl.Collator([], {
    numeric: true,
    sensitivity: 'base'
});

const filterBackpackContents = (contents, search, typeFilter) => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const active = Boolean(normalizedSearch) || typeFilter !== 'all';
    if (!active) return {active, matchingItems: contents, visibleItems: contents};

    const matchingItems = contents.filter(item => {
        const typeMatches = typeFilter === 'all' || item.type === typeFilter;
        const nameMatches = !normalizedSearch ||
            `${item.name || ''}`.toLocaleLowerCase().includes(normalizedSearch);
        return typeMatches && nameMatches;
    });
    const visibleIds = matchingItems.map(item => `${item.id}`);
    let foundParent = true;
    while (foundParent) {
        foundParent = false;
        for (const item of contents) {
            if (visibleIds.includes(`${item.id}`) && item.folderId &&
                !visibleIds.includes(`${item.folderId}`)) {
                visibleIds.push(`${item.folderId}`);
                foundParent = true;
            }
        }
    }
    return {
        active,
        matchingItems,
        visibleItems: contents.filter(item => visibleIds.includes(`${item.id}`))
    };
};

const sortBackpackItems = (items, sort) => {
    if (sort === 'recent') return items;
    if (sort === 'oldest') return items.slice().reverse();
    return items.slice().sort((first, second) => {
        const nameComparison = nameCollator.compare(`${first.name || ''}`, `${second.name || ''}`);
        if (sort === 'nameAscending') return nameComparison;
        if (sort === 'nameDescending') return -nameComparison;
        const typeComparison = `${first.type || ''}`.localeCompare(`${second.type || ''}`);
        return typeComparison || nameComparison;
    });
};

export {
    filterBackpackContents,
    sortBackpackItems
};
