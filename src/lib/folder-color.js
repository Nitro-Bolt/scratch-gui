const getFolderForeground = color => {
    const normalizedColor = typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : '#d8b24a';
    const channels = [1, 3, 5].map(offset => parseInt(normalizedColor.slice(offset, offset + 2), 16) / 255)
        .map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
    const luminance = (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
    return luminance > 0.179 ? '#000000' : '#ffffff';
};

export default getFolderForeground;
