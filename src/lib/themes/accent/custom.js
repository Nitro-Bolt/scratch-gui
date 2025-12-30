const getGuiColors = (primaryColor, secondaryColor, isGradient) => ({
    'motion-primary': `${primaryColor}`,
    'motion-primary-transparent': `${primaryColor}e6`,
    'motion-tertiary': `${secondaryColor}`,

    'looks-secondary': `${primaryColor}`,
    'looks-transparent': `${primaryColor}59`,
    'looks-light-transparent': `${primaryColor}26`,
    'looks-secondary-dark': `${secondaryColor}`,

    'extensions-primary': `${secondaryColor}`,
    'extensions-tertiary': `${primaryColor}`,
    'extensions-transparent': `${primaryColor}6e`,
    'extensions-light': 'hsla(10, 57%, 85%, 1)',

    'drop-highlight': '#ff9d8a',

    'menu-bar-background-image': isGradient ?
        // eslint-disable-next-line max-len
        `linear-gradient(90deg, ${`${primaryColor}`} 0%, ${`${secondaryColor}`} 100%)` :
        'none'
});

const blockColors = {
    checkboxActiveBackground: '#ff5726',
    checkboxActiveBorder: '#fc3900'
};

export {
    getGuiColors,
    blockColors
};
