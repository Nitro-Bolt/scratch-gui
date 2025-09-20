const savedAccentTemplate = (name, { primaryColor, primaryColorDark }, enabled) => {
    return {
        name: name,
        colors: {
            primary: primaryColor,
            primaryDark: primaryColorDark
        },
        enabled: enabled
    }
}

export default savedAccentTemplate;