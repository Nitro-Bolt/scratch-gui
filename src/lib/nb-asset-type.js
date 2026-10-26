import {Buffer} from 'buffer';
import {isText} from 'istextorbinary/edition-es5';

import assetIcon from '../components/asset-panel/icon--asset.svg';
import soundIcon from '../components/asset-panel/icon--sound.svg';
import codeIcon from '../components/asset-panel/icon--code.svg';

import assetIconPNG from './backpack/asset-thumbnail.png';
import soundIconPNG from './backpack/sound-thumbnail.png';
import codeIconPNG from './backpack/code-thumbnail.png';

const languageAliases = {
    txt: 'plaintext',
    text: 'plaintext',
    md: 'markdown',
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    yml: 'yaml',
    sh: 'shell',
    bash: 'shell',
    c: 'cpp',
    h: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    cs: 'csharp'
};

const previewContentTypes = {
    // SVG is intentionally excluded because navigating to a same-origin SVG blob can execute scripts.
    apng: 'image/apng',
    bmp: 'image/bmp',
    gif: 'image/gif',
    heif: 'image/heif',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    tiff: 'image/tiff',
    webp: 'image/webp',
    mp4: 'video/mp4',
    m4v: 'video/x-m4v',
    mov: 'video/quicktime',
    webm: 'video/webm',
    aac: 'audio/aac',
    flac: 'audio/flac',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    opus: 'audio/ogg',
    wav: 'audio/wav'
};

const getPreviewContentType = dataFormat => previewContentTypes[(dataFormat || '').toLowerCase()] || null;

export default (asset, pngIcon = false) => {
    const format = (asset.dataFormat || '').toLowerCase();
    const language = languageAliases[format] || format || 'plaintext';
    const extension = format || 'file';
    const assetName = `${asset.name || 'asset'}.${extension}`;
    const assetData = asset.asset && asset.asset.data;

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
        };
    default:
        break;
    }

    let detectedTextAsset = false;
    if (assetData) {
        try {
            const bufferAssetData = Buffer.isBuffer(assetData) ? assetData : Buffer.from(assetData);
            detectedTextAsset = isText(assetName, bufferAssetData) === true;
        } catch (e) {
            detectedTextAsset = false;
        }
    }

    if (detectedTextAsset) {
        return {
            type: 'text',
            displayable: true,
            editable: true,
            language,
            icon: pngIcon ? assetIconPNG : assetIcon
        };
    }

    return {
        type: null,
        icon: pngIcon ? assetIconPNG : assetIcon,
        displayable: false
    };
};

export {getPreviewContentType};
