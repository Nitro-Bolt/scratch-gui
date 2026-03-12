import assetIcon from '../components/asset-panel/icon--asset.svg';
import soundIcon from '../components/asset-panel/icon--sound.svg';
import codeIcon from '../components/asset-panel/icon--code.svg';

import assetIconPNG from './backpack/asset-thumbnail.png';
import soundIconPNG from './backpack/sound-thumbnail.png';
import codeIconPNG from './backpack/code-thumbnail.png';

const textLanguages = {
    txt: 'plaintext',
    text: 'plaintext',
    md: 'markdown',
    markdown: 'markdown',
    json: 'json',
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
    csv: 'plaintext',
    tsv: 'plaintext',
    py: 'python',
    java: 'java',
    c: 'c',
    h: 'cpp',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    ini: 'ini'
};

const textContentTypes = new Set([
    'application/json',
    'application/javascript',
    'application/typescript',
    'application/xml',
    'application/yaml',
    'application/x-yaml',
    'application/x-sh',
    'application/sql'
]);

export default (asset, pngIcon = false) => {
    const format = (asset.dataFormat || '').toLowerCase();
    const contentType = (asset.contentType || '').toLowerCase();
    const language = textLanguages[format] || 'plaintext';

    // Temporary solution, maybe
    if (textLanguages[format] || contentType.startsWith('text/') || textContentTypes.has(contentType)) {
        return {
            type: 'text',
            displayable: true,
            editable: true,
            language,
            icon: pngIcon ? assetIconPNG : assetIcon
        };
    }

    switch (format) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'svg':
        case 'bmp':
        case 'ico':
        case 'tiff':
        case 'heif':
        case 'apng':
            // Image icon's will be generated elsewhere
            return {type: 'image', displayable: true};
        case 'mp4':
        case 'm4v':
        case 'webm':
        case 'mov':
            return {
                type: 'video',
                displayable: true,
                icon: pngIcon ? assetIconPNG : assetIcon
            };
        case 'mp3':
        case 'wav':
        case 'aac':
        case 'ogg':
        case 'opus':
        case 'flac':
            return {
                type: 'sound',
                displayable: true,
                icon: pngIcon ? soundIconPNG : soundIcon
            };
        case 'sb3':
        case 'sprite3':
        case 'sb2':
        case 'sprite2':
        case 'sprite':
        case 'sb':
        case 'pmp': // PenguinMod
        case 'pms':
        case 'snail': // Snail-IDE
        case 'electra': // Electra-mod
            return {
                type: 'code',
                displayable: false,
                icon: pngIcon ? codeIconPNG : codeIcon
            }
        default:
            return {
                type: null,
                icon: pngIcon ? assetIconPNG : assetIcon,
                displayable: false
            };
    }
};