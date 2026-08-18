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

// Parent/next links and child block IDs describe the stack shape, but are not
// changes to the block at that position. Ignoring those generated references
// keeps an inserted or removed block from marking its unchanged neighbours.
const blockDiffValue = (block, blocks) => {
    if (Array.isArray(block)) return block;
    if (!block || typeof block !== 'object') return block;
    const normalized = {...block};
    delete normalized.parent;
    delete normalized.next;
    if (normalized.comment) normalized.comment = '<comment-reference>';
    if (normalized.inputs && typeof normalized.inputs === 'object') {
        normalized.inputs = Object.fromEntries(Object.entries(normalized.inputs).map(([name, input]) => [
            name,
            Array.isArray(input) ? input.map((value, index) => (
                index > 0 && typeof value === 'string' && blocks[value] ? '<block-reference>' : value
            )) : input
        ]));
    }
    return normalized;
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

const primitiveInfo = {
    4: ['math_number', 'NUM'],
    5: ['math_positive_number', 'NUM'],
    6: ['math_whole_number', 'NUM'],
    7: ['math_integer', 'NUM'],
    8: ['math_angle', 'NUM'],
    9: ['colour_picker', 'COLOUR'],
    10: ['text', 'TEXT'],
    11: ['event_broadcast_menu', 'BROADCAST_OPTION'],
    12: ['data_variable', 'VARIABLE'],
    13: ['data_listcontents', 'LIST'],
    14: ['data_tablecontents', 'TABLE']
};

const primitiveXml = primitive => {
    if (!Array.isArray(primitive) || !primitiveInfo[primitive[0]]) return '';
    const [opcode, fieldName] = primitiveInfo[primitive[0]];
    const fieldId = primitive[2];
    const id = fieldId ? ` id="${escapeXml(fieldId)}"` : '';
    return `<shadow type="${opcode}"><field name="${fieldName}"${id}>${escapeXml(primitive[1])}</field></shadow>`;
};

const mutationXml = mutation => {
    if (!mutation || typeof mutation !== 'object') return '';
    const attributes = Object.entries(mutation)
        .filter(([name]) => name !== 'children' && name !== 'tagName')
        .map(([name, value]) => ` ${name}="${escapeXml(name === 'blockInfo' ? JSON.stringify(value) : value)}"`)
        .join('');
    const children = Array.isArray(mutation.children) ? mutation.children.map(mutationXml).join('') : '';
    return `<${mutation.tagName || 'mutation'}${attributes}>${children}</${mutation.tagName || 'mutation'}>`;
};

// Older Git revisions may have been written before the live XML snapshot was
// available. Reconstructing XML from the structured block data keeps those
// revisions renderable instead of showing a misleading missing-XML message.
const blockXml = (blocks, comments, id, visited = new Set()) => {
    if (!id || visited.has(id)) return '';
    const block = blocks[id];
    if (!block) return '';
    if (Array.isArray(block)) return primitiveXml(block);
    visited.add(id);
    const tagName = block.shadow ? 'shadow' : 'block';
    const position = block.topLevel ? ` x="${escapeXml(block.x)}" y="${escapeXml(block.y)}"` : '';
    const collapsed = block.collapsed ? ' collapsed="true"' : '';
    let result = `<${tagName} id="${escapeXml(id)}" type="${escapeXml(block.opcode)}"` +
        `${position}${collapsed}>`;
    if (block.comment && comments && comments[block.comment]) {
        const comment = comments[block.comment];
        result += `<comment id="${escapeXml(block.comment)}" x="${Number(comment.x) || 0}"` +
            ` y="${Number(comment.y) || 0}" w="${Number(comment.width) || 100}"` +
            ` h="${Number(comment.height) || 100}" pinned="true"` +
            ` minimized="${Boolean(comment.minimized)}" colour="${escapeXml(comment.colour)}">` +
            `${escapeXml(comment.text)}</comment>`;
    }
    result += mutationXml(block.mutation);
    Object.entries(block.fields || {}).forEach(([name, field]) => {
        const value = Array.isArray(field) ? field[0] : field && field.value;
        const fieldId = Array.isArray(field) ? field[1] : field && field.id;
        result += `<field name="${escapeXml(name)}"${fieldId ? ` id="${escapeXml(fieldId)}"` : ''}>` +
            `${escapeXml(value)}</field>`;
    });
    Object.entries(block.inputs || {}).forEach(([name, input]) => {
        if (!Array.isArray(input)) return;
        const blockId = input[1];
        const shadowId = input[2];
        if (!blockId && !shadowId) return;
        result += `<value name="${escapeXml(name)}">`;
        result += typeof blockId === 'string' ?
            blockXml(blocks, comments, blockId, new Set(visited)) : primitiveXml(blockId);
        if (shadowId && shadowId !== blockId) {
            result += typeof shadowId === 'string' ?
                blockXml(blocks, comments, shadowId, new Set(visited)) : primitiveXml(shadowId);
        }
        result += '</value>';
    });
    if (block.next) result += `<next>${blockXml(blocks, comments, block.next, new Set(visited))}</next>`;
    return `${result}</${tagName}>`;
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
    const serializedScripts = Array.isArray(target._nitroboltScripts) ? target._nitroboltScripts : [];
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
                matchKey: `script:${position.x}:${position.y}`,
                rootId,
                signature: JSON.stringify({
                    blocks: blockIds.map(id => JSON.stringify(blockDiffValue(blocks[id], blocks))).sort(),
                    comments: scriptComments.map(([, comment]) => {
                        const normalized = {...comment};
                        delete normalized.blockId;
                        return normalized;
                    }).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
                }),
                blockSignatures: blockIds.map(id => [id, JSON.stringify(blockDiffValue(blocks[id], blocks))]),
                source: xmlByRoot.get(rootId) || blockXml(blocks, comments, rootId) || null,
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
                matchKey: `comment:${Number(comment.x) || 0}:${Number(comment.y) || 0}:${comment.text || ''}`,
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
