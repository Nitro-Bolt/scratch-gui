const isMistwarpTheme = data => {
    if (!data || typeof data !== 'object') return false;
    if (data.themes && Array.isArray(data.themes) && data.themes.length > 0) {
        const theme = data.themes[0];
        return !!(theme && theme.accent && theme.accent.guiColors && theme.accent.blockColors);
    }
    return false;
};

const convertMistwarpTheme = mistwarpData => {
    if (!isMistwarpTheme(mistwarpData)) {
        return null;
    }

    const theme = mistwarpData.themes[0];
    const guiColors = theme.accent.guiColors;

    const primaryColor = guiColors['motion-primary'];
    const secondaryColor = guiColors['motion-tertiary'];
    const tertiaryColor = guiColors['extensions-primary'];

    let gradient = null;
    const menuBarGradient = guiColors['menu-bar-background-image'];
    if (menuBarGradient && typeof menuBarGradient === 'string' && menuBarGradient.startsWith('linear-gradient')) {
        const match = menuBarGradient.match(
            /linear-gradient\((\d+)deg,\s*rgba?\([^)]+\)\s*(\d+)%,\s*rgba?\([^)]+\)\s*(\d+)%\)/
        );
        if (match) {
            const direction = parseInt(match[1], 10);
            const colors = [
                {color: primaryColor, position: parseInt(match[2], 10)},
                {color: tertiaryColor, position: parseInt(match[3], 10)}
            ];
            gradient = {direction, colors};
        }
    }

    const accent = {
        name: theme.name,
        primaryColor,
        secondaryColor,
        tertiaryColor,
        gradient,
        isGradient: !!gradient
    };

    const gui = theme.gui === 'dark' ? 'dark' : 'light';

    let blocks = 'three';
    if (theme.blocks === 'dark') {
        blocks = 'dark';
    } else if (theme.blocks === 'high-contrast') {
        blocks = 'high-contrast';
    }

    return {
        accent,
        gui,
        blocks
    };
};

export {
    isMistwarpTheme,
    convertMistwarpTheme
};
