import {
    BLOCKS_MAP,
    BLOCKS_CUSTOM,
    defaultBlockColors,
} from "./themes/index.js";

export const BLOCK_COLORS_STORAGE_KEY = "nb:blockColors";

export const BLOCK_COLOR_CATEGORIES = [
    { colorId: "motion", label: "Motion", default: "#4C97FF" },
    { colorId: "looks", label: "Looks", default: "#9966FF" },
    { colorId: "sounds", label: "Sound", default: "#CF63CF" },
    { colorId: "event", label: "Events", default: "#FFBF00" },
    { colorId: "control", label: "Control", default: "#FFAB19" },
    { colorId: "sensing", label: "Sensing", default: "#5CB1D6" },
    { colorId: "operators", label: "Operators", default: "#59C059" },
    { colorId: "data", label: "Variables", default: "#FF8C1A" },
    { colorId: "data_lists", label: "Lists", default: "#FF661A" },
    { colorId: "json", label: "JSON", default: "#5755D4" },
    { colorId: "more", label: "My Blocks", default: "#FF6680" },
    { colorId: "pen", label: "Extensions", default: "#0FBD8C" },
];

const hexToRgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
});

const rgbToHex = ({ r, g, b }) =>
    `#${[r, g, b]
        .map((v) =>
            Math.max(0, Math.min(255, Math.round(v)))
                .toString(16)
                .padStart(2, "0"),
        )
        .join("")}`;

const multiplyColor = (hex, factor) => {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex({ r: r * factor, g: g * factor, b: b * factor });
};

export const loadBlockColors = () => {
    try {
        return JSON.parse(localStorage.getItem(BLOCK_COLORS_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

export const saveBlockColors = (colors) => {
    if (Object.keys(colors).length === 0) {
        localStorage.removeItem(BLOCK_COLORS_STORAGE_KEY);
    } else {
        localStorage.setItem(BLOCK_COLORS_STORAGE_KEY, JSON.stringify(colors));
    }
};

export const buildBlockColorMap = (overrides) => {
    const colors = JSON.parse(JSON.stringify(defaultBlockColors));
    for (const cat of BLOCK_COLOR_CATEGORIES) {
        const primary = overrides[cat.colorId] || cat.default;
        colors[cat.colorId] = {
            primary,
            secondary: multiplyColor(primary, 0.9),
            tertiary: multiplyColor(primary, 0.8),
            quaternary: multiplyColor(primary, 0.8),
        };
    }
    return colors;
};

export const applyBlockColors = (overrides) => {
    BLOCKS_MAP[BLOCKS_CUSTOM].colors = buildBlockColorMap(overrides);
};

const _stored = loadBlockColors();
if (Object.keys(_stored).length > 0) {
    applyBlockColors(_stored);
}
