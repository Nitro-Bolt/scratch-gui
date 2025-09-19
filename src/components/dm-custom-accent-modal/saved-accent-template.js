const savedAccentTemplate = (name, { primaryColor }, enabled) => {
    return {
        name: name,
        colors: {
            primary: primaryColor
        },
        enabled: enabled
    }
}

export default savedAccentTemplate;