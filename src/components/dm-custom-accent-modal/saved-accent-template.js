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

const CUSTOM_ACCENTS_KEY = "tw:accent:customAccents";

export {
    CUSTOM_ACCENTS_KEY,
    savedAccentTemplate as default
};