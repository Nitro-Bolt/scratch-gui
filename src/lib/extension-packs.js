const STORAGE_KEY = 'nb:extension-packs';
const EXTENSIONS_STORAGE_KEY = 'nb:individual-extensions';
const PACK_CACHE_STORAGE_KEY = 'nb:extension-pack-cache';

const isHTTPURL = value => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (e) {
        return false;
    }
};

const isExtensionURL = value => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ||
            (url.protocol === 'data:' && value.startsWith('data:application/javascript'));
    } catch (e) {
        return false;
    }
};

const getExtensionId = source => {
    const getInfo = source.match(/getInfo\s*\([^)]*\)\s*{([\s\S]*?)\n?\s*}/);
    const metadata = getInfo ? getInfo[1] : source;
    const match = metadata.match(/(?:^|[{,;]\s*)["']?id["']?\s*:\s*(["'`])([^"'`]+)\1/);
    if (!match || !match[2].trim()) {
        throw new Error('Could not find the extension ID in getInfo().');
    }
    return match[2].trim();
};

const resolveURL = (value, baseURL) => new URL(value, baseURL).href;

const validatePack = (pack, packURL) => {
    if (!pack || typeof pack !== 'object' || !pack.information || !Array.isArray(pack.extensions)) {
        throw new Error('Extension pack must contain "information" and an "extensions" array.');
    }

    const information = pack.information;
    if (typeof information.name !== 'string' || !information.name.trim()) {
        throw new Error('Extension pack information.name must be a non-empty string.');
    }
    if (typeof information.tag !== 'string' || !information.tag.trim()) {
        throw new Error('Extension pack information.tag must be a non-empty string.');
    }

    const source = information.source ? resolveURL(information.source, packURL) : resolveURL('.', packURL);
    if (!isHTTPURL(source)) {
        throw new Error('Extension pack source must use HTTP or HTTPS.');
    }

    const extensions = pack.extensions.map((extension, index) => {
        if (!extension || typeof extension !== 'object' ||
            typeof extension.id !== 'string' || !extension.id ||
            typeof extension.name !== 'string' || !extension.name ||
            typeof extension.slug !== 'string' || !extension.slug) {
            throw new Error(`Extension pack item ${index + 1} must have slug, id, and name strings.`);
        }
        return extension;
    });

    return {
        information: {
            ...information,
            name: information.name.trim(),
            tag: information.tag.trim().toLowerCase(),
            source
        },
        extensions
    };
};

const getPackURLs = () => {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(value) ? value.filter(isHTTPURL) : [];
    } catch (e) {
        return [];
    }
};

const setPackURLs = urls => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
};

const addPackURL = url => {
    if (!isHTTPURL(url)) {
        throw new Error('Pack URL must use HTTP or HTTPS.');
    }
    const normalized = new URL(url).href;
    const urls = getPackURLs();
    if (!urls.includes(normalized)) {
        setPackURLs([...urls, normalized]);
    }
    return normalized;
};

const getPackCache = () => {
    try {
        const value = JSON.parse(localStorage.getItem(PACK_CACHE_STORAGE_KEY));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (e) {
        return {};
    }
};

const setPackCache = cache => {
    try {
        localStorage.setItem(PACK_CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
        // Ignore storage quota and privacy mode errors.
    }
};

const getCachedPack = url => getPackCache()[url] || null;

const setCachedPack = (url, pack) => {
    setPackCache({
        ...getPackCache(),
        [url]: pack
    });
};

const removePackURL = url => {
    setPackURLs(getPackURLs().filter(item => item !== url));
    const cache = getPackCache();
    delete cache[url];
    setPackCache(cache);
};

const getIndividualExtensions = () => {
    try {
        const value = JSON.parse(localStorage.getItem(EXTENSIONS_STORAGE_KEY));
        return Array.isArray(value) ? value.filter(item => (
            item && typeof item.name === 'string' && typeof item.id === 'string' && isExtensionURL(item.url)
        )) : [];
    } catch (e) {
        return [];
    }
};

const setIndividualExtensions = extensions => {
    localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(extensions));
};

export {
    STORAGE_KEY,
    EXTENSIONS_STORAGE_KEY,
    PACK_CACHE_STORAGE_KEY,
    addPackURL,
    getCachedPack,
    getExtensionId,
    getIndividualExtensions,
    getPackURLs,
    isHTTPURL,
    removePackURL,
    resolveURL,
    setCachedPack,
    setIndividualExtensions,
    setPackURLs,
    validatePack
};
