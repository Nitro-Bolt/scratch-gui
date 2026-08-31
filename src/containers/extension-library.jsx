import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import log from '../lib/log';
import {manuallyTrustExtension} from './tw-security-manager.jsx';

import extensionLibraryContent, {
    galleryStatusItems
} from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/tw-extension-tags';
import {
    addPackURL,
    getCachedPack,
    getExtensionId,
    getIndividualExtensions,
    getPackURLs,
    removePackURL,
    resolveURL,
    setCachedPack,
    setIndividualExtensions,
    setPackURLs,
    validatePack
} from '../lib/extension-packs';

import LibraryComponent from '../components/library/library.jsx';
import ExtensionPackManager from '../components/nb-extension-pack-manager/extension-pack-manager.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';
import defaultExtensionBanner from '../lib/libraries/extensions/custom/custom.svg';

const gallerySources = [
    {
        id: 'nitrobolt',
        baseURL: 'https://extensions.nitrobolt.org/',
        metadataURL: 'https://extensions.nitrobolt.org/generated-metadata/extensions-v0.json',
        tag: 'nb'
    },
    {
        id: 'turbowarp',
        baseURL: 'https://extensions.turbowarp.org/',
        metadataURL: 'https://extensions.turbowarp.org/generated-metadata/extensions-v0.json',
        tag: 'tw'
    }
];

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    }
});

const toLibraryItem = extension => {
    if (typeof extension === 'object') {
        return ({
            rawURL: extension.iconURL || extensionIcon,
            ...extension
        });
    }
    return extension;
};

const translateGalleryItem = (extension, locale) => ({
    ...extension,
    name: extension.nameTranslations[locale] || extension.name,
    description: extension.descriptionTranslations[locale] || extension.description
});

const mapGalleryExtension = (extension, source) => ({
    name: extension.name,
    nameTranslations: extension.nameTranslations || {},
    description: extension.description,
    descriptionTranslations: extension.descriptionTranslations || {},
    extensionId: extension.id,
    extensionURL: `${source.baseURL}${extension.slug}.js`,
    iconURL: extension.image ? `${source.baseURL}${extension.image}` : defaultExtensionBanner,
    tags: [source.tag],
    credits: [
        ...(extension.original || []),
        ...(extension.by || [])
    ].map(credit => {
        if (credit.link) {
            return (
                <a
                    href={credit.link}
                    target="_blank"
                    rel="noreferrer"
                    key={credit.name}
                >
                    {credit.name}
                </a>
            );
        }
        return credit.name;
    }),
    docsURI: extension.docs ? `${source.baseURL}${extension.slug}` : null,
    samples: extension.samples ? extension.samples.map(sample => ({
        href: `${process.env.ROOT}editor?project_url=${source.baseURL}samples/${encodeURIComponent(sample)}.sb3`,
        text: sample
    })) : null,
    incompatibleWithScratch: !extension.scratchCompatible,
    featured: true
});

const mapPackExtension = (extension, pack) => ({
    name: extension.name,
    nameTranslations: extension.nameTranslations || {},
    description: extension.description || '',
    descriptionTranslations: extension.descriptionTranslations || {},
    extensionId: extension.id,
    extensionURL: resolveURL(
        extension.slug.endsWith('.js') ? extension.slug : `${extension.slug}.js`,
        pack.information.source
    ),
    iconURL: extension.image ? resolveURL(extension.image, pack.information.source) : defaultExtensionBanner,
    tags: [pack.information.tag],
    credits: [
        ...(extension.original || []),
        ...(extension.by || [])
    ].map(credit => (credit.link ? (
        <a
            href={credit.link}
            target="_blank"
            rel="noreferrer"
            key={credit.name}
        >
            {credit.name}
        </a>
    ) : credit.name)),
    docsURI: extension.docs ? resolveURL(extension.slug, pack.information.source) : null,
    samples: extension.samples ? extension.samples.map(sample => ({
        href: `${process.env.ROOT}editor?project_url=${encodeURIComponent(
            resolveURL(`samples/${sample}.sb3`, pack.information.source)
        )}`,
        text: sample
    })) : null,
    incompatibleWithScratch: !extension.scratchCompatible,
    featured: true
});

const preparePack = (packURL, pack, error) => ({
    url: packURL,
    name: pack.information.name,
    tag: pack.information.tag,
    extensions: pack.extensions.map(extension => mapPackExtension(extension, pack)),
    error
});

const fetchPack = async packURL => {
    try {
        const res = await fetch(packURL);
        if (!res.ok) throw new Error(`[extension pack] HTTP status ${res.status}`);
        const pack = validatePack(await res.json(), packURL);
        setCachedPack(packURL, pack);
        return preparePack(packURL, pack, null);
    } catch (error) {
        const cachedPack = getCachedPack(packURL);
        if (!cachedPack) throw error;
        const pack = validatePack(cachedPack, packURL);
        log.warn(`[extension pack] Using saved copy of ${packURL}`, error);
        return preparePack(packURL, pack, 'Offline — using saved copy');
    }
};

const fetchSavedPacks = async () => {
    const packURLs = getPackURLs();
    const results = await Promise.allSettled(packURLs.map(fetchPack));
    const packs = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            packs.push(result.value);
        } else {
            log.error(result.reason);
            packs.push({
                url: packURLs[index],
                name: packURLs[index],
                tag: '',
                extensions: [],
                error: result.reason.message
            });
        }
    });
    return packs;
};

let cachedPacks = [];
const initialPackLoad = fetchSavedPacks().then(packs => {
    const savedPackURLs = new Set(getPackURLs());
    cachedPacks = packs.filter(pack => savedPackURLs.has(pack.url));
    return packs;
});

let cachedGalleryBySource = null;

const fetchLibrary = async () => {
    const results = await Promise.allSettled(gallerySources.map(async source => {
        const res = await fetch(source.metadataURL);
        if (!res.ok) {
            throw new Error(`[${source.id}] HTTP status ${res.status}`);
        }
        const data = await res.json();
        return data.extensions.map(extension => mapGalleryExtension(extension, source));
    }));

    const extensionIds = new Set();
    const galleryBySource = {};

    for (const [index, result] of results.entries()) {
        const source = gallerySources[index];

        if (result.status === 'fulfilled') {
            const extensions = [];
            for (const extension of result.value) {
                // Keep first occurrence, so NitroBolt wins when IDs overlap.
                if (!extensionIds.has(extension.extensionId)) {
                    extensionIds.add(extension.extensionId);
                    extensions.push(extension);
                }
            }
            galleryBySource[source.id] = {
                status: 'success',
                extensions
            };
        } else {
            log.error(result.reason);
            galleryBySource[source.id] = {
                status: 'error',
                error: result.reason,
                extensions: []
            };
        }
    }

    return galleryBySource;
};

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'handleAddPack',
            'handleAddExtension',
            'handleRemoveExtension',
            'handleRemovePack',
            'handleReorderExtensions',
            'handleReorderPacks',
            'handleOpenManager',
            'handleCloseManager'
        ]);
        this.state = {
            galleryBySource: cachedGalleryBySource,
            galleryTimedOut: false,
            packs: cachedPacks,
            individualExtensions: getIndividualExtensions(),
            managerVisible: false,
            managerError: ''
        };
    }
    componentDidMount () {
        initialPackLoad.then(packs => {
            this.setState(state => {
                const savedPackURLs = getPackURLs();
                const packsByURL = new Map([
                    ...packs.map(pack => [pack.url, pack]),
                    ...state.packs.map(pack => [pack.url, pack])
                ]);
                const currentPacks = savedPackURLs
                    .map(url => packsByURL.get(url))
                    .filter(Boolean);
                cachedPacks = currentPacks;
                return {packs: currentPacks};
            });
        });
        if (!this.state.galleryBySource) {
            const timeout = setTimeout(() => {
                this.setState({
                    galleryTimedOut: true
                });
            }, 750);

            fetchLibrary()
                .then(galleryBySource => {
                    cachedGalleryBySource = galleryBySource;
                    this.setState({
                        galleryBySource
                    });
                    clearTimeout(timeout);
                })
                .catch(error => {
                    log.error(error);
                    clearTimeout(timeout);
                });
        }
    }
    async handleAddPack (value) {
        if (!value) return;
        try {
            const url = new URL(value.trim()).href;
            const pack = await fetchPack(url);
            addPackURL(url);
            this.setState(state => ({
                packs: [...state.packs.filter(item => item.url !== url), pack],
                managerError: ''
            }), () => {
                cachedPacks = this.state.packs;
            });
        } catch (error) {
            log.error(error);
            this.setState({managerError: `Could not add extension pack: ${error.message}`});
        }
    }
    handleRemovePack (url) {
        removePackURL(url);
        this.setState(state => ({packs: state.packs.filter(item => item.url !== url)}), () => {
            cachedPacks = this.state.packs;
        });
    }
    async handleAddExtension (extension) {
        const name = extension.name.trim();
        try {
            if (!name) throw new Error('Enter a display name.');
            let url;
            let source;
            if (extension.type === 'url') {
                url = new URL(extension.url.trim()).href;
                if (!/^https?:$/.test(new URL(url).protocol)) throw new Error('Enter an HTTP(S) extension URL.');
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Extension returned HTTP ${response.status}.`);
                source = await response.text();
            } else {
                source = extension.source;
                if (!source) throw new Error('Choose a JavaScript file or paste extension code.');
                url = `data:application/javascript,${encodeURIComponent(source)}`;
            }
            const id = getExtensionId(source);
            const item = {name, id, url, sourceType: extension.type, fileName: extension.fileName};
            const individualExtensions = [
                ...this.state.individualExtensions.filter(oldItem => oldItem.id !== id && oldItem.url !== url),
                item
            ];
            setIndividualExtensions(individualExtensions);
            this.setState({individualExtensions, managerError: ''});
        } catch (error) {
            this.setState({managerError: `Could not add extension: ${error.message}`});
        }
    }
    handleRemoveExtension (url) {
        this.setState(state => {
            const individualExtensions = state.individualExtensions.filter(item => item.url !== url);
            setIndividualExtensions(individualExtensions);
            return {individualExtensions};
        });
    }
    handleReorderPacks (fromIndex, toIndex) {
        this.setState(state => {
            const packs = [...state.packs];
            const [pack] = packs.splice(fromIndex, 1);
            packs.splice(toIndex, 0, pack);
            setPackURLs(packs.map(item => item.url));
            cachedPacks = packs;
            return {packs};
        });
    }
    handleReorderExtensions (fromIndex, toIndex) {
        this.setState(state => {
            const individualExtensions = [...state.individualExtensions];
            const [extension] = individualExtensions.splice(fromIndex, 1);
            individualExtensions.splice(toIndex, 0, extension);
            setIndividualExtensions(individualExtensions);
            return {individualExtensions};
        });
    }
    handleOpenManager () {
        this.setState({managerVisible: true, managerError: ''});
    }
    handleCloseManager () {
        this.setState({managerVisible: false, managerError: ''});
    }
    handleItemSelect (item) {
        if (item.href) {
            return;
        }

        const extensionId = item.extensionId;

        if (extensionId === 'custom_extension') {
            this.props.onOpenCustomExtensionModal();
            return;
        }

        const url = item.extensionURL ? item.extensionURL : extensionId;
        if (!item.disabled) {
            if (item.extensionURL) manuallyTrustExtension(url);
            if (this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
                this.props.onCategorySelected(extensionId);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url)
                    .then(() => {
                        this.props.onCategorySelected(extensionId);
                    })
                    .catch(err => {
                        log.error(err);
                        // eslint-disable-next-line no-alert
                        alert(err);
                    });
            }
        }
    }
    render () {
        let library = null;
        let tags = extensionTags;
        if (this.state.galleryBySource || this.state.galleryTimedOut) {
            library = extensionLibraryContent.map(toLibraryItem);
            const locale = this.props.intl.locale;

            tags = [
                ...extensionTags,
                {tag: 'individual', intlLabel: 'Individual'},
                ...this.state.packs
                    .filter(pack => pack.tag)
                    .map(pack => ({tag: pack.tag, intlLabel: pack.name}))
            ];

            library = extensionLibraryContent.map(toLibraryItem);
            library.push('---');

            for (const source of gallerySources) {
                const sourceGallery = this.state.galleryBySource ? this.state.galleryBySource[source.id] : null;
                const sourceStatusItems = galleryStatusItems[source.id];

                const extensionsToExclude = [
                    'faceSensing',
                    'fetch',
                    'fullscreen0419',
                    'images',
                    'lmsCast',
                    'lmscomments',
                    'lmsHackedBlocks',
                    'lmsmcutils',
                    'lmsutilsblocks',
                    'RixxyX',
                    'ShovelUtils',
                    'shreder95resolution',
                    'skyhigh173JSON'
                ];
                const sourceExtensionsToExclude = source.id === 'turbowarp' ? [
                    'penP',
                    'xeltallivclipblend'
                ] : [];

                if (sourceGallery && sourceGallery.status === 'success') {
                    library.push(toLibraryItem(sourceStatusItems.more));
                    library.push(
                        ...sourceGallery.extensions
                            .filter(i => !extensionsToExclude.includes(i.extensionId) &&
                                !sourceExtensionsToExclude.includes(i.extensionId))
                            .map(i => translateGalleryItem(i, locale))
                            .map(toLibraryItem)
                    );
                } else if (sourceGallery && sourceGallery.status === 'error') {
                    library.push(toLibraryItem(sourceStatusItems.error));
                } else {
                    library.push(toLibraryItem(sourceStatusItems.loading));
                }

                library.push('---');
            }

            if (this.state.individualExtensions.length) {
                library.push(...this.state.individualExtensions.map(extension => toLibraryItem({
                    name: extension.name,
                    description: '',
                    extensionId: extension.id,
                    extensionURL: extension.url,
                    iconURL: defaultExtensionBanner,
                    tags: ['individual'],
                    incompatibleWithScratch: true,
                    featured: true
                })));
                library.push('---');
            }

            for (const pack of this.state.packs) {
                if (!pack.extensions.length) continue;
                library.push(...pack.extensions
                    .map(i => translateGalleryItem(i, locale))
                    .map(toLibraryItem));
                library.push('---');
            }

            if (library[library.length - 1] === '---') {
                library.pop();
            }
        }

        if (this.state.managerVisible) {
            return (
                <ExtensionPackManager
                    error={this.state.managerError}
                    extensions={this.state.individualExtensions}
                    packs={this.state.packs}
                    onAddExtension={this.handleAddExtension}
                    onAddPack={this.handleAddPack}
                    onClose={this.handleCloseManager}
                    onRemoveExtension={this.handleRemoveExtension}
                    onRemovePack={this.handleRemovePack}
                    onReorderExtensions={this.handleReorderExtensions}
                    onReorderPacks={this.handleReorderPacks}
                />
            );
        }

        return (
            <LibraryComponent
                data={library}
                filterable
                persistableKey="extensionId"
                id="extensionLibrary"
                tags={tags}
                onTagManager={this.handleOpenManager}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onOpenCustomExtensionModal: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);
