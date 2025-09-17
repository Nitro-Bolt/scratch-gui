const savedAccentTemplate = (name, { primaryColor }) => {
    return {
        name: name,
        colors: {
            primary: primaryColor
        }
    }
}

export default savedAccentTemplate;