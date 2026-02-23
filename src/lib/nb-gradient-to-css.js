export const gradientDataToCSS = (colors, direction) => {
    let buffer = `linear-gradient(${direction}deg`;
    for (const color of colors) {
        buffer += `, ${color.color} ${color.position}%`;
    }
    buffer += ')';
    return buffer;
};
