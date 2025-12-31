const gradientColorsToCSS = (colors, direction) => {
    let buffer = `linear-gradient(${direction}deg`;
    for (const color of colors) {
        buffer += `, ${color.color} ${color.position}%`;
    }
    buffer += ')';
    return buffer;
};

const getGuiColors = (primaryColor, secondaryColor, tertiaryColor, gradient) => ({
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

    'menu-bar-background-image': `${gradient ? gradientColorsToCSS(gradient.colors, gradient.direction) : 'none'}`
});

const blockColors = {
    checkboxActiveBackground: '#ff5726',
    checkboxActiveBorder: '#fc3900'
};

export {
    getGuiColors,
    blockColors
};
