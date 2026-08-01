import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import BackpackComponent from '../components/backpack/backpack.jsx';
import {
    getBackpackContents,
    saveBackpackObject,
    deleteBackpackObject,
    updateBackpackObject,
    deleteBackpackObjectWithFolders,
    moveBackpackObjectToFolder,
    reorderBackpackFolder,
    soundPayload,
    assetPayload,
    costumePayload,
    spritePayload,
    codePayload,
    LOCAL_API
} from '../lib/backpack-api';
import DragConstants from '../lib/drag-constants';
import DropAreaHOC from '../lib/drop-area-hoc.jsx';

import {connect} from 'react-redux';
import storage from '../lib/storage';
import VM from 'scratch-vm';

const workspaceDragTypes = [DragConstants.COSTUME, DragConstants.SOUND, DragConstants.ASSET, DragConstants.SPRITE];
const backpackDragTypes = [
    DragConstants.BACKPACK_COSTUME,
    DragConstants.BACKPACK_SOUND,
    DragConstants.BACKPACK_ASSET,
    DragConstants.BACKPACK_SPRITE,
    DragConstants.BACKPACK_CODE
];
const dragTypes = workspaceDragTypes.concat(backpackDragTypes);
const DroppableBackpack = DropAreaHOC(dragTypes)(BackpackComponent);
const idsEqual = (first, second) => `${first}` === `${second}`;
const sortByBackpackOrder = (contents, orderedIds) => {
    if (!orderedIds) return contents;
    const positions = new Map(orderedIds.map((id, index) => [`${id}`, index]));
    return contents.slice().sort((first, second) =>
        (positions.get(`${first.id}`) ?? Number.MAX_SAFE_INTEGER) -
        (positions.get(`${second.id}`) ?? Number.MAX_SAFE_INTEGER));
};

const messages = defineMessages({
    rename: {
        defaultMessage: 'New name:',
        description: 'Renaming a backpack item',
        id: 'tw.backpack.rename'
    }
});

class Backpack extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleDrop',
            'handleToggle',
            'handleDelete',
            'handleRename',
            'handleCreateFolder',
            'handleFolderColorChange',
            'handleFolderDropTargetChange',
            'handleFolderReorder',
            'handleFolderToggle',
            'handleMoveToFolder',
            'getBackpackAssetURL',
            'getContents',
            'handleMouseEnter',
            'handleMouseLeave',
            'handleBlockDragEnd',
            'handleBlockDragUpdate',
            'handleMore'
        ]);
        this.state = {
            // While the DroppableHOC manages drop interactions for asset tiles,
            // we still need to micromanage drops coming from the block workspace.
            // TODO this may be refactorable with the share-the-love logic in SpriteSelectorItem
            blockDragOutsideWorkspace: false,
            blockDragOverBackpack: false,
            error: false,
            itemsPerPage: 20,
            moreToLoad: false,
            loading: false,
            expanded: false,
            contents: []
        };
        this.folderDropTarget = null;

        // If a host is given, add it as a web source to the storage module
        // TODO remove the hacky flag that prevents double adding
        if (props.host && !storage._hasAddedBackpackSource && props.host !== LOCAL_API) {
            storage.addWebSource(
                [storage.AssetType.ImageVector, storage.AssetType.ImageBitmap, storage.AssetType.Sound],
                this.getBackpackAssetURL
            );
            storage._hasAddedBackpackSource = true;
        }
    }
    componentDidMount () {
        this.props.vm.addListener('BLOCK_DRAG_END', this.handleBlockDragEnd);
        this.props.vm.addListener('BLOCK_DRAG_UPDATE', this.handleBlockDragUpdate);
    }
    componentWillUnmount () {
        this.props.vm.removeListener('BLOCK_DRAG_END', this.handleBlockDragEnd);
        this.props.vm.removeListener('BLOCK_DRAG_UPDATE', this.handleBlockDragUpdate);
    }
    getBackpackAssetURL (asset) {
        return `${this.props.host}/${asset.assetId}.${asset.dataFormat}`;
    }
    handleToggle () {
        const newState = !this.state.expanded;
        this.setState({expanded: newState, contents: []}, () => {
            // Emit resize on window to get blocks to resize
            window.dispatchEvent(new Event('resize'));
        });
        if (newState) {
            this.getContents();
        }
    }
    handleError (error) {
        this.setState({
            error: `${error}`,
            loading: false
        });
        // Log error to console and make the Promise reject.
        throw error;
    }
    handleDrop (dragInfo) {
        const dropTarget = this.props.host === LOCAL_API ? this.folderDropTarget : null;
        const destinationFolderId = dropTarget ? dropTarget.folderId : null;
        this.folderDropTarget = null;
        // Folders have their own drag payload and cannot be serialized by
        // the costume/sound/asset payload builders.
        if (dragInfo.payload && dragInfo.payload.nativeFolderId) return;
        if (backpackDragTypes.includes(dragInfo.dragType)) {
            if (this.props.host === LOCAL_API && dragInfo.payload && dragInfo.payload.id) {
                this.handleMoveToFolder(
                    dragInfo.payload.id,
                    destinationFolderId,
                    null,
                    dropTarget && dropTarget.destinationId,
                    dropTarget && dropTarget.insertAfter
                );
            }
            return;
        }
        let payloader = null;
        let presaveAsset = null;
        switch (dragInfo.dragType) {
        case DragConstants.COSTUME:
            payloader = costumePayload;
            presaveAsset = dragInfo.payload.asset;
            break;
        case DragConstants.SOUND:
            payloader = soundPayload;
            presaveAsset = dragInfo.payload.asset;
            break;
        case DragConstants.ASSET:
            payloader = assetPayload;
            presaveAsset = dragInfo.payload.asset;
            break;
        case DragConstants.SPRITE:
            payloader = spritePayload;
            break;
        case DragConstants.CODE:
            payloader = codePayload;
            break;
        }
        if (!payloader) return;

        // Creating the payload is async, so set loading before starting
        this.setState({loading: true}, () => {
            Promise.resolve()
                .then(() => payloader(dragInfo.payload, this.props.vm))
                .then(payload => {
                    if (!payload) throw new Error('Could not serialize backpack item');
                    // Force the asset to save to the asset server before storing in backpack
                    // Ensures any asset present in the backpack is also on the asset server
                    if (presaveAsset && !presaveAsset.clean && this.props.host !== LOCAL_API) {
                        return storage.store(
                            presaveAsset.assetType,
                            presaveAsset.dataFormat,
                            presaveAsset.data,
                            presaveAsset.assetId
                        ).then(() => payload);
                    }
                    return payload;
                })
                .then(payload => saveBackpackObject({
                    host: this.props.host,
                    token: this.props.token,
                    username: this.props.username,
                    ...(this.props.host === LOCAL_API ? {folderId: null} : {}),
                    ...payload
                }))
                .then(item => {
                    const contents = [item].concat(this.state.contents);
                    if (this.props.host !== LOCAL_API || !destinationFolderId) {
                        this.setState({loading: false, contents});
                        return null;
                    }
                    return moveBackpackObjectToFolder({
                        host: this.props.host,
                        id: item.id,
                        folderId: destinationFolderId,
                        destinationId: dropTarget && dropTarget.destinationId,
                        insertAfter: dropTarget && dropTarget.insertAfter
                    }).then(({item: updatedItem, deletedFolderId, orderedIds}) => this.setState({
                        loading: false,
                        contents: sortByBackpackOrder(contents
                            .filter(candidate => !deletedFolderId || !idsEqual(candidate.id, deletedFolderId))
                            .map(candidate => (idsEqual(candidate.id, item.id) ? updatedItem : candidate)), orderedIds)
                    }));
                })
                .catch(error => {
                    this.handleError(error);
                });
        });
    }
    async handleCreateFolder (itemId) {
        if (this.props.host !== LOCAL_API) return;
        // eslint-disable-next-line no-alert
        const name = await prompt('Folder name:');
        if (!name || !name.trim()) return;
        const thumbnail = btoa('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path fill="#ffbf00" d="M3 13h23l6 7h29v39H3z"/></svg>');
        this.setState({loading: true});
        saveBackpackObject({
            host: this.props.host,
            token: this.props.token,
            username: this.props.username,
            type: 'folder',
            mime: 'application/json',
            name: name.trim(),
            body: btoa('{}'),
            thumbnail,
            folderId: null,
            color: '#d8b24a',
            open: true
        }).then(folder => {
            const contents = [folder].concat(this.state.contents);
            const item = itemId && this.findItemById(itemId);
            if (!item) {
                this.setState({loading: false, contents});
                return null;
            }
            return moveBackpackObjectToFolder({
                host: this.props.host,
                id: item.id,
                folderId: folder.id
            })
                .then(({item: updatedItem, deletedFolderId, orderedIds}) => this.setState({
                    loading: false,
                    contents: sortByBackpackOrder(contents
                        .filter(candidate => !deletedFolderId || !idsEqual(candidate.id, deletedFolderId))
                        .map(candidate => (idsEqual(candidate.id, item.id) ? updatedItem : candidate)), orderedIds)
                }))
                .catch(error => deleteBackpackObject({
                    host: this.props.host,
                    id: folder.id
                }).then(() => Promise.reject(error)));
        })
            .catch(error => this.handleError(error));
    }
    handleDelete (id) {
        const item = this.findItemById(id);
        this.setState({loading: true}, () => {
            if (this.props.host !== LOCAL_API) {
                deleteBackpackObject({
                    host: this.props.host,
                    token: this.props.token,
                    username: this.props.username,
                    id: id
                })
                    .then(() => this.setState({
                        loading: false,
                        contents: this.state.contents.filter(candidate => !idsEqual(candidate.id, id))
                    }))
                    .catch(error => this.handleError(error));
                return;
            }

            deleteBackpackObjectWithFolders({host: this.props.host, id})
                .then(({deletedFolderId}) => this.setState({
                    loading: false,
                    contents: this.state.contents
                        .filter(candidate => !idsEqual(candidate.id, id) &&
                            (!deletedFolderId || !idsEqual(candidate.id, deletedFolderId)))
                        .map(candidate => (item && item.type === 'folder' &&
                            idsEqual(candidate.folderId, id) ? {...candidate, folderId: null} : candidate))
                }))
                .catch(error => this.handleError(error));
        });
    }
    findItemById (id) {
        return this.state.contents.find(i => i.id === id);
    }
    async handleRename (id, suppliedName) {
        const item = this.findItemById(id);
        // prompt() returns Promise in desktop app
        // eslint-disable-next-line no-alert
        const newName = suppliedName || await prompt(this.props.intl.formatMessage(messages.rename), item.name);
        if (!newName) {
            return;
        }
        this.setState({loading: true}, () => {
            updateBackpackObject({
                host: this.props.host,
                id: item.id,
                name: newName
            })
                .then(newItem => {
                    this.setState({
                        loading: false,
                        contents: this.state.contents.map(i => (i === item ? newItem : i))
                    });
                })
                .catch(error => {
                    this.handleError(error);
                });
        });
    }
    handleFolderColorChange (id, color) {
        if (this.props.host !== LOCAL_API) return;
        const item = this.findItemById(id);
        if (!item) return;
        this.setState({loading: true}, () => {
            updateBackpackObject({host: this.props.host, id, color})
                .then(newItem => this.setState({
                    loading: false,
                    contents: this.state.contents.map(candidate =>
                        (idsEqual(candidate.id, id) ? newItem : candidate))
                }))
                .catch(error => this.handleError(error));
        });
    }
    handleFolderDropTargetChange (folderId, destinationId, insertAfter) {
        this.folderDropTarget = destinationId === null ? null : {
            folderId: folderId || null,
            destinationId,
            insertAfter: Boolean(insertAfter)
        };
    }
    handleFolderReorder (sourceId, destinationId, insertAfter) {
        if (this.props.host !== LOCAL_API || idsEqual(sourceId, destinationId)) return;
        this.setState({loading: true}, () => {
            reorderBackpackFolder({host: this.props.host, sourceId, destinationId, insertAfter})
                .then(orderedIds => {
                    this.setState({
                        loading: false,
                        contents: sortByBackpackOrder(this.state.contents, orderedIds)
                    });
                })
                .catch(error => this.handleError(error));
        });
    }
    handleFolderToggle (id, open) {
        if (this.props.host !== LOCAL_API) return;
        this.setState({
            contents: this.state.contents.map(candidate =>
                (idsEqual(candidate.id, id) ? {...candidate, open} : candidate))
        });
        updateBackpackObject({host: this.props.host, id, open})
            .then(newItem => this.setState({
                contents: this.state.contents.map(candidate =>
                    (idsEqual(candidate.id, id) ? newItem : candidate))
            }))
            .catch(error => this.handleError(error));
    }
    handleMoveToFolder (id, folderId, event, destinationId, insertAfter) {
        if (event) event.stopPropagation();
        if (this.props.host !== LOCAL_API) return;
        const item = this.findItemById(id);
        if (!item) return;
        this.setState({loading: true}, () => {
            moveBackpackObjectToFolder({
                host: this.props.host,
                id,
                folderId,
                destinationId,
                insertAfter
            })
                .then(({item: newItem, deletedFolderId, orderedIds}) => this.setState({
                    loading: false,
                    contents: sortByBackpackOrder(this.state.contents
                        .filter(candidate => !deletedFolderId || !idsEqual(candidate.id, deletedFolderId))
                        .map(candidate => (idsEqual(candidate.id, id) ? newItem : candidate)), orderedIds)
                }))
                .catch(error => this.handleError(error));
        });
    }
    getContents () {
        if ((this.props.token && this.props.username) || this.props.host === LOCAL_API) {
            const localFoldersEnabled = this.props.host === LOCAL_API;
            this.setState({loading: true, error: false}, () => {
                getBackpackContents({
                    host: this.props.host,
                    token: this.props.token,
                    username: this.props.username,
                    // Local folders must be loaded as complete groups so
                    // their children and every context-menu destination are
                    // available together. Remote backpacks keep pagination.
                    offset: localFoldersEnabled ? 0 : this.state.contents.length,
                    limit: localFoldersEnabled ? null : this.state.itemsPerPage
                })
                    .then(contents => {
                        this.setState({
                            contents: localFoldersEnabled ? contents : this.state.contents.concat(contents),
                            moreToLoad: !localFoldersEnabled && contents.length === this.state.itemsPerPage,
                            loading: false
                        });
                    })
                    .catch(error => {
                        this.handleError(error);
                    });
            });
        }
    }
    handleBlockDragUpdate (isOutsideWorkspace) {
        this.setState({
            blockDragOutsideWorkspace: isOutsideWorkspace
        });
    }
    handleMouseEnter () {
        if (this.state.blockDragOutsideWorkspace) {
            this.setState({
                blockDragOverBackpack: true
            });
        }
    }
    handleMouseLeave () {
        this.setState({
            blockDragOverBackpack: false
        });
    }
    handleBlockDragEnd (blocks, topBlockId) {
        if (this.state.blockDragOverBackpack) {
            this.handleDrop({
                dragType: DragConstants.CODE,
                payload: {
                    blockObjects: this.props.vm.exportStandaloneBlocks(blocks),
                    topBlockId: topBlockId
                }
            });
        }
        this.setState({
            blockDragOverBackpack: false,
            blockDragOutsideWorkspace: false
        });
    }
    handleMore () {
        this.getContents();
    }
    render () {
        return (
            <DroppableBackpack
                blockDragOver={this.state.blockDragOverBackpack}
                contents={this.state.contents}
                error={this.state.error}
                expanded={this.state.expanded}
                loading={this.state.loading}
                showMore={this.state.moreToLoad}
                onDelete={this.handleDelete}
                onRename={this.handleRename}
                onDrop={this.handleDrop}
                onMore={this.handleMore}
                onCreateFolder={this.handleCreateFolder}
                onFolderColorChange={this.handleFolderColorChange}
                onFolderDropTargetChange={this.handleFolderDropTargetChange}
                onFolderReorder={this.handleFolderReorder}
                onFolderToggle={this.handleFolderToggle}
                onMoveToFolder={this.handleMoveToFolder}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                onToggle={this.props.host ? this.handleToggle : null}
                foldersEnabled={this.props.host === LOCAL_API}
                preferences={this.props.preferences}
            />
        );
    }
}

Backpack.propTypes = {
    intl: intlShape,
    host: PropTypes.string,
    token: PropTypes.string,
    preferences: PropTypes.object,
    username: PropTypes.string,
    vm: PropTypes.instanceOf(VM)
};

const getTokenAndUsername = state => {
    // Look for the session state provided by scratch-www
    if (state.session && state.session.session && state.session.session.user) {
        return {
            token: state.session.session.user.token,
            username: state.session.session.user.username
        };
    }
    // Otherwise try to pull testing params out of the URL, or return nulls
    // TODO a hack for testing the backpack
    const tokenMatches = window.location.href.match(/[?&]token=([^&]*)&?/);
    const usernameMatches = window.location.href.match(/[?&]username=([^&]*)&?/);
    return {
        token: tokenMatches ? tokenMatches[1] : null,
        username: usernameMatches ? usernameMatches[1] : null
    };
};

const mapStateToProps = state => Object.assign(
    {
        dragInfo: state.scratchGui.assetDrag,
        vm: state.scratchGui.vm,
        preferences: state.scratchGui.preferences,
        blockDrag: state.scratchGui.blockDrag
    },
    getTokenAndUsername(state)
);

const mapDispatchToProps = () => ({});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Backpack));
