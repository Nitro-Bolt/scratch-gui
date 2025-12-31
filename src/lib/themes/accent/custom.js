const gradientColorsToCSS = (colors, direction) => {
    let buffer = `linear-gradient(${direction}deg`;
    for (const color of colors) {
        buffer += `, ${color.color} ${color.position}%`;
    }
    buffer += ')';
    return buffer;
};

const getGuiColors = (primaryColor, secondaryColor, tertiaryColor, gradient) => {
    console.log(gradient.colors);
    return ({
        'motion-primary': `${primaryColor}`,
        'motion-primary-transparent': `${primaryColor}e6`,
        'motion-tertiary': `${secondaryColor}`,

        'looks-secondary': `${primaryColor}`,
        'looks-transparent': `${primaryColor}59`,
        'looks-light-transparent': `${primaryColor}26`,
        'looks-secondary-dark': `${secondaryColor}`,

        'extensions-primary': `${tertiaryColor}`,
        'extensions-tertiary': `${tertiaryColor}`,
        'extensions-transparent': `${tertiaryColor}6e`,
        'extensions-light': 'hsla(10, 57%, 85%, 1)',

        'drop-highlight': `${primaryColor}`,

        'menu-bar-background-image': `${gradientColorsToCSS(gradient.colors, gradient.direction)}`
    });
};

const blockColors = {
    checkboxActiveBackground: '#ff5726',
    checkboxActiveBorder: '#fc3900'
};

export {
    getGuiColors,
    blockColors
};
