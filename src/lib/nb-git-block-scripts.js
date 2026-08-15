const inputBlockIds = input => {
    if (!Array.isArray(input)) return [];
    return [input[1], input[2]].filter(value => typeof value === 'string');
};

const scriptBlockIds = (blocks, rootId) => {
    const ids = [];
    const visited = new Set();
    const visit = id => {
        if (!id || visited.has(id) || !blocks[id]) return;
        visited.add(id);
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

const escapeXml = value => {
    const text = value === null || typeof value === 'undefined' ? '' : String(value);
    return text.replace(/[<>&'"]/g, character => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '\'': '&apos;',
        '"': '&quot;'
    })[character]);
};

const workspaceCommentXml = (id, comment) => [
    `<comment id="${escapeXml(id)}" x="${Number(comment.x) || 0}" y="${Number(comment.y) || 0}"`,
    ` w="${Number(comment.width) || 100}" h="${Number(comment.height) || 100}" pinned="false"`,
    ` minimized="${Boolean(comment.minimized)}" colour="${escapeXml(comment.colour)}">`,
    `${escapeXml(comment.text)}</comment>`
].join('');

const getProjectScripts = project => {
    const target = project && project.targets && project.targets[0];
    if (!target) return [];
    const scripts = [];
    const blocks = target.blocks;
    const comments = target.comments;
    const serializedScripts = target._nitroboltScripts;
    const xmlByRoot = new Map(serializedScripts.map(script => [script.id, script.xml]));
    const claimedCommentIds = new Set();
    serializedScripts.map(script => script.id)
        .forEach(rootId => {
            const root = blocks[rootId];
            const position = blockPosition(root);
            const blockIds = scriptBlockIds(blocks, rootId);
            const blockIdSet = new Set(blockIds);
            const scriptComments = Object.entries(comments)
                .filter(([id, comment]) => {
                    if (!blockIdSet.has(comment.blockId)) return false;
                    claimedCommentIds.add(id);
                    return true;
                })
                .sort(([leftId], [rightId]) => leftId.localeCompare(rightId));
            scripts.push({
                id: `script:${rootId}`,
                rootId,
                signature: JSON.stringify({
                    blocks: blockIds.map(id => [id, blocks[id]]),
                    comments: scriptComments
                }),
                source: xmlByRoot.get(rootId) || null,
                teleportable: true,
                x: position.x,
                y: position.y
            });
        });
    Object.entries(comments)
        .filter(([id]) => !claimedCommentIds.has(id))
        .forEach(([id, comment]) => {
            scripts.push({
                id: `comment:${id}`,
                rootId: null,
                signature: JSON.stringify(comment),
                source: workspaceCommentXml(id, comment),
                teleportable: false,
                x: Number(comment.x) || 0,
                y: Number(comment.y) || 0
            });
        });
    return scripts;
};

export {getProjectScripts};
