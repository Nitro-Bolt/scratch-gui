/* eslint-disable import/no-commonjs */

const OLD_PRIMARY_COLOR = '#855cd6';
const SECONDARY_COLOR = '#714eb6';
const TERTIARY_COLOR = '#0fbd8c';

const loader = source => `
    const original = ${JSON.stringify(source)};

    const getSRC = () => {
        const recolored = typeof Recolor === 'object' ? (
            original
                .replace(/${OLD_PRIMARY_COLOR}/gi, Recolor.primary)
                .replace(/${SECONDARY_COLOR}/gi, Recolor.secondary)
                .replace(/${TERTIARY_COLOR}/gi, Recolor.tertiary)
        ) : original;
        return 'data:image/svg+xml;,' + encodeURIComponent(recolored);
    };

    export default getSRC;
`;

module.exports = loader;
