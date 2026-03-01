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
        const directionMatch = menuBarGradient.match(/linear-gradient\((\d+)deg/);
        
        if (directionMatch) {
            const direction = parseInt(directionMatch[1], 10);
            const colorStopRegex = /(rgba?|hsla?)\([^)]+\)\s*(\d+%)?/g;
            const colorMatches = [];
            let match;
            while ((match = colorStopRegex.exec(menuBarGradient)) !== null) {
                colorMatches.push(match[0]);
            }

            if (colorMatches.length >= 2) {
                const parseColor = colorStr => {
                    const paramsMatch = colorStr.match(/\(([^)]+)\)/);
                    if (!paramsMatch) return null;
                    const params = paramsMatch[1].split(',').map(s => s.trim());
                    
                    const isRgb = colorStr.startsWith('rgb');
                    const isRgba = colorStr.startsWith('rgba');
                    
                    if (isRgb || isRgba) {
                        const r = parseInt(params[0], 10);
                        const g = parseInt(params[1], 10);
                        const b = parseInt(params[2], 10);
                        const a = isRgba ? parseFloat(params[3]) : 1;
                        const rStr = r.toString(16).padStart(2, '0');
                        const gStr = g.toString(16).padStart(2, '0');
                        const bStr = b.toString(16).padStart(2, '0');
                        return {hex: `#${rStr}${gStr}${bStr}`, a};
                    }
                    return null;
                };

                const colors = colorMatches.map((colorStr, index) => {
                    const positionMatch = colorStr.match(/(\d+)%$/);
                    const position = positionMatch ?
                        parseInt(positionMatch[1], 10) :
                        Math.round((index / (colorMatches.length - 1)) * 100);
                    const parsed = parseColor(colorStr);
                    return parsed ? {color: parsed.hex, position} : null;
                }).filter(c => c);

                if (colors.length >= 2) {
                    gradient = {direction, colors};
                }
            }
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
