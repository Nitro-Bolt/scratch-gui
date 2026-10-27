const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const inputBlockIds = input => {
    if (!Array.isArray(input)) return [];
    return [input[1], input[2]].filter(value => typeof value === 'string');
};

const scriptBlockIds = (blocks, rootId) => {
    const ids = [];
    const visited = [];
    const visit = id => {
        if (!id || visited.includes(id) || !hasOwn(blocks, id)) return;
        visited.push(id);
        ids.push(id);
        const block = blocks[id];
        if (Array.isArray(block)) return;
        Object.values(block.inputs || {}).forEach(input => inputBlockIds(input).forEach(visit));
        visit(block.next);
    };
    visit(rootId);
    return ids;
};

const blockPosition = block => (Array.isArray(block) ? {
    x: Number(block[3]) || 0,
    y: Number(block[4]) || 0
} : {
    x: Number(block && block.x) || 0,
    y: Number(block && block.y) || 0
});

const getProjectScripts = (project, vm) => {
    const target = project && project.targets && project.targets[0];
    if (!target) return [];
    const scripts = [];
    const blocks = target.blocks;
    const comments = target.comments;
    const serializedScripts = Array.isArray(target._nitroboltScripts) ? target._nitroboltScripts : [];
    const claimedCommentIds = [];
    serializedScripts.forEach(serializedScript => {
        const rootId = serializedScript.root;
        const root = blocks[rootId];
        const position = blockPosition(root);
        const blockIds = scriptBlockIds(blocks, rootId);
        const scriptComments = Object.entries(comments)
            .filter(([id, comment]) => {
                if (!blockIds.includes(comment.blockId)) return false;
                claimedCommentIds.push(id);
                return true;
            })
            .sort(([leftId], [rightId]) => leftId.localeCompare(rightId));
        scripts.push({
            id: `script:${serializedScript.id}`,
            rootId,
            signature: JSON.stringify({
                blocks: blockIds.map(id => [id, blocks[id]]),
                comments: scriptComments.map(([id, comment]) => [id, comment])
            }),
            blockSignatures: blockIds.map(id => [id, JSON.stringify(blocks[id])]),
            source: vm.serializedBlockToXML(blocks, comments, rootId) || null,
            teleportable: true,
            x: position.x,
            y: position.y
        });
    });
    Object.entries(comments)
        .filter(([id]) => !claimedCommentIds.includes(id))
        .forEach(([id, comment]) => {
            scripts.push({
                id: `comment:${id}`,
                rootId: null,
                signature: JSON.stringify(comment),
                source: vm.serializedCommentToXML(id, comment),
                teleportable: false,
                x: Number(comment.x) || 0,
                y: Number(comment.y) || 0
            });
        });
    return scripts;
};

export {getProjectScripts};
