import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import log from '../lib/log';

import extensionLibraryContent, {
    galleryStatusItems
} from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/tw-extension-tags';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

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
    iconURL: `${source.baseURL}${extension.image || 'images/unknown.svg'}`,
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
            'handleItemSelect'
        ]);
        this.state = {
            galleryBySource: cachedGalleryBySource,
            galleryTimedOut: false
        };
    }
    componentDidMount () {
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
        if (this.state.galleryBySource || this.state.galleryTimedOut) {
            library = extensionLibraryContent.map(toLibraryItem);
            library.push('---');

            const locale = this.props.intl.locale;

            for (const source of gallerySources) {
                const sourceGallery = this.state.galleryBySource ? this.state.galleryBySource[source.id] : null;
                const sourceStatusItems = galleryStatusItems[source.id];

                const extensionsToExclude = ['faceSensing','lmscomments'];
                
                if (sourceGallery && sourceGallery.status === 'success') {
                    library.push(toLibraryItem(sourceStatusItems.more));
                    library.push(
                        ...sourceGallery.extensions
                            .filter(i => !extensionsToExclude.includes(i.extensionId))
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

            if (library[library.length - 1] === '---') {
                library.pop();
            }
        }

        return (
            <LibraryComponent
                data={library}
                filterable
                persistableKey="extensionId"
                id="extensionLibrary"
                tags={extensionTags}
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
