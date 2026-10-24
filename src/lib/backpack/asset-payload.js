import getAssetType from '../nb-asset-type.js';
import createThumbnail from './thumbnail';
import getCostumeUrl from '../get-costume-url';

const assetPayload = assetObject => {
    const assetDataUrl = assetObject.asset.encodeDataURI();
    const dataSeparator = assetDataUrl.indexOf(',');
    const assetType = getAssetType(assetObject, true);
    const contentType = assetObject.contentType || assetObject.asset.assetType.contentType;
    const payload = {
        type: 'asset',
        name: assetObject.name,
        mime: contentType,
        dataFormat: assetObject.dataFormat,
        contentType,
        lastModified: assetObject.lastModified,
        body: dataSeparator === -1 ? '' : assetDataUrl.slice(dataSeparator + 1),

        // Thumbnail will be filled in below
        thumbnail: ''
    };

    if (assetType.type === 'image') {
        // Do not generate the thumbnail from the raw asset. Instead use the getCostumeUrl
        // utility which inlines the fonts to make the thumbnail show the right fonts.
        const inlinedFontDataUrl = getCostumeUrl(assetObject.asset);
        return createThumbnail(inlinedFontDataUrl).then(thumbnail => {
            payload.thumbnail = thumbnail;
            return payload;
        });
    }
    payload.thumbnail = assetType.icon.replace('data:image/png;base64,', '');
    return new Promise(resolve => resolve(payload));
    
};

export default assetPayload;
