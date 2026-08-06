import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import AssetViewer from './asset-viewer.jsx';

import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import addNewTxtFileIcon from '../components/asset-panel/icon--add-new-txt-file.svg';

import DragConstants from '../lib/drag-constants';
import {handleFileUpload, assetUpload} from '../lib/file-uploader.js';
import downloadBlob from '../lib/download-blob';
import getAssetType from '../lib/nb-asset-type.js';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';

import {defineMessages, intlShape, injectIntl} from 'react-intl';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';

import {connect} from 'react-redux';

const formatSize = bytes => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

class AssetTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSelectAsset',
            'handleDeleteAsset',
            'handleDuplicateAsset',
            'handleExportAsset',
            'handleMoveToTop',
            'handleMoveToBottom',
            'handleNewAsset',
            'handleCreateBlankTextAsset',
            'handleFileUploadClick',
            'handleAssetUpload',
            'handleFolderReorder',
            'handleItemFolderChangeComplete',
            'handleDrop',
            'setFileInput'
        ]);
        this.state = {selectedAssetIndex: 0};
    }

    getAssetIcon (assetObject) {
        const assetType = getAssetType(assetObject);
        if (assetType.type === 'image') {
            return {asset: assetObject.asset};
        }
        return {url: assetType.icon};
        
    }

    handleSelectAsset (assetIndex) {
        this.setState({selectedAssetIndex: assetIndex});
    }

    handleNewAsset () {
        if (!this.props.vm.editingTarget) {
            return null;
        }
        const sprite = this.props.vm.editingTarget.sprite;
        const assets = sprite.assets ? sprite.assets : [];
        this.setState({selectedAssetIndex: Math.max(assets.length - 1, 0)});
    }

    handleCreateBlankTextAsset () {
        const {vm, intl} = this.props;
        if (!vm.editingTarget || !vm.runtime || !vm.runtime.storage) {
            return;
        }

        const storage = vm.runtime.storage;
        const targetId = vm.editingTarget.id;
        const AssetType = structuredClone(storage.AssetType.Asset);
        AssetType.contentType = 'text/plain';

        const extension = 'txt';
        const asset = storage.createAsset(
            AssetType,
            extension,
            new TextEncoder().encode(''),
            null,
            true
        );

        const newAsset = {
            name: intl.formatMessage(messages.newTextFileName),
            dataFormat: extension,
            contentType: 'text/plain',
            lastModified: Date.now(),
            asset,
            md5: `${asset.assetId}.${extension}`,
            assetId: asset.assetId
        };

        vm.addAsset(newAsset, targetId).then(this.handleNewAsset);
    }

    handleDeleteAsset (assetIndex) {
        this.props.vm.deleteAsset(assetIndex);
        if (assetIndex >= this.state.selectedAssetIndex) {
            this.setState({selectedAssetIndex: Math.max(0, assetIndex - 1)});
        }
    }

    handleAssetUpload (e) {
        const storage = this.props.vm.runtime.storage;
        const targetId = this.props.vm.editingTarget.id;
        this.props.onShowImporting();
        handleFileUpload(e.target, (buffer, fileType, fileName, fileIndex, fileCount, fileExtension, lastModified) => {
            assetUpload(buffer, fileType, fileExtension || 'file', storage, newAsset => {
                newAsset.name = fileName;
                newAsset.contentType = newAsset.asset.assetType.contentType;
                newAsset.lastModified = lastModified;
                this.props.vm.addAsset(newAsset, targetId).then(() => {
                    this.handleNewAsset();
                    if (fileIndex === fileCount - 1) {
                        this.props.onCloseImporting();
                    }
                });
            }, this.props.onCloseImporting);
        }, this.props.onCloseImporting);
    }

    handleFolderReorder (folderId, newIndex) {
        const assets = this.props.vm.editingTarget.sprite.assets;
        const activeAsset = assets[this.state.selectedAssetIndex];
        this.props.vm.moveFolderToIndex(folderId, newIndex);
        this.setState({selectedAssetIndex: this.props.vm.editingTarget.sprite.assets.indexOf(activeAsset)});
    }
    handleItemFolderChangeComplete (activeAsset, targetId) {
        const target = this.props.vm.editingTarget;
        if (!target || target.id !== targetId) return;
        const selectedAssetIndex = target.sprite.assets.indexOf(activeAsset);
        if (selectedAssetIndex >= 0) this.setState({selectedAssetIndex});
    }
    handleDrop (dropInfo) {
        if (dropInfo.dragType === DragConstants.FOLDER_ASSET &&
            dropInfo.payload && dropInfo.payload.nativeFolderId) {
            const sourceId = dropInfo.payload.nativeFolderId;
            const hoveredFolderId = dropInfo.payload.folderAtDisplayIndex &&
                dropInfo.payload.folderAtDisplayIndex[dropInfo.hoveredIndex];
            const hoveredFolder = this.props.vm.runtime.projectFolders.find(folder => folder.id === hoveredFolderId);
            const structuralIndex = typeof dropInfo.hoveredIndex === 'number' ?
                dropInfo.hoveredIndex : dropInfo.newIndex;
            const destinationParentId = hoveredFolder && hoveredFolder._isOpen !== false &&
                hoveredFolder.id !== sourceId ?
                hoveredFolder.id : dropInfo.rootDrop ? null : dropInfo.payload.parentFolderAtDisplayIndex &&
                    dropInfo.payload.parentFolderAtDisplayIndex[structuralIndex];
            if (destinationParentId !== sourceId) {
                try {
                    this.props.vm.setFolderParent(sourceId, destinationParentId || null);
                } catch (error) {
                    return;
                }
            }
            const mappedIndex = dropInfo.payload.dropIndexMap && dropInfo.payload.dropIndexMap[dropInfo.newIndex];
            this.handleFolderReorder(sourceId,
                typeof mappedIndex === 'number' ? mappedIndex : dropInfo.newIndex);
            return;
        }
        if (dropInfo.dragType === DragConstants.ASSET) {
            const assets = this.props.vm.editingTarget.sprite.assets;
            const activeAsset = assets[this.state.selectedAssetIndex];
            const mappedIndex = dropInfo.dropIndexMap && dropInfo.dropIndexMap[dropInfo.newIndex];
            const newIndex = typeof mappedIndex === 'number' ? mappedIndex : dropInfo.newIndex;
            const destination = assets[newIndex];
            const hoveredFolderId = dropInfo.folderAtDisplayIndex &&
                dropInfo.folderAtDisplayIndex[dropInfo.hoveredIndex];
            const hoveredFolder = this.props.vm.runtime.projectFolders.find(folder => folder.id === hoveredFolderId);
            const destinationFolder = hoveredFolder || (destination && destination.folderId &&
                this.props.vm.runtime.projectFolders.find(folder => folder.id === destination.folderId));
            this.props.vm.setItemFolder('asset', this.props.vm.editingTarget.id,
                dropInfo.index, !dropInfo.rootDrop && destinationFolder && destinationFolder._isOpen !== false ?
                    destinationFolder.id : null, newIndex);
            this.setState({
                selectedAssetIndex: this.props.vm.editingTarget.sprite.assets.indexOf(activeAsset)
            });
        } else if (dropInfo.dragType === DragConstants.BACKPACK_COSTUME) {
            this.props.vm.addAsset({
                md5: dropInfo.payload.body,
                lastModified: Date.now(),
                contentType: dropInfo.payload.mime,
                dataFormat: dropInfo.payload.dataFormat,
                name: dropInfo.payload.name
            }).then(this.handleNewAsset);
        } else if (dropInfo.dragType === DragConstants.BACKPACK_SOUND) {
            this.props.vm.addAsset({
                md5: dropInfo.payload.body,
                lastModified: Date.now(),
                contentType: dropInfo.payload.mime,
                dataFormat: dropInfo.payload.dataFormat,
                name: dropInfo.payload.name
            }).then(this.handleNewAsset);
        } else if (dropInfo.dragType === DragConstants.BACKPACK_ASSET) {
            this.props.vm.addAsset({
                md5: dropInfo.payload.body,
                lastModified: dropInfo.payload.lastModified,
                contentType: dropInfo.payload.mime,
                dataFormat: dropInfo.payload.dataFormat,
                name: dropInfo.payload.name
            }).then(this.handleNewAsset);
        }
    }

    handleDuplicateAsset (assetIndex) {
        this.props.vm.duplicateAsset(assetIndex).then(() => {
            this.setState({selectedAssetIndex: assetIndex + 1});
        });
    }

    handleMoveToTop (assetIndex) {
        this.props.vm.editingTarget.reorderAsset(assetIndex, 0);
        this.setState({selectedAssetIndex: 0});
    }

    handleMoveToBottom (assetIndex) {
        const lastAssetIndex = this.props.vm.editingTarget.sprite.assets.length - 1;
        this.props.vm.editingTarget.reorderAsset(assetIndex, lastAssetIndex);
        this.setState({selectedAssetIndex: lastAssetIndex});
    }

    handleExportAsset (assetIndex) {
        const item = this.props.vm.editingTarget.sprite.assets[assetIndex];
        const blob = new Blob([item.asset.data], {type: item.asset.assetType.contentType});
        downloadBlob(`${item.name}.${item.dataFormat}`, blob);
    }

    setFileInput (input) {
        this.fileInput = input;
    }

    handleFileUploadClick () {
        this.fileInput.click();
    }

    render () {
        const {
            intl,
            isRtl,
            vm
        } = this.props;

        if (!vm.editingTarget) {
            return null;
        }

        const sprite = vm.editingTarget.sprite;

        const assets = sprite.assets ? sprite.assets.map(asset => (
            {
                name: asset.dataFormat ?
                    `${asset.name}.${asset.dataFormat}` : asset.name,
                folderId: asset.folderId || null,
                dragPayload: asset,
                details: formatSize(asset.asset.data.byteLength),
                ...this.getAssetIcon(asset)
            }
        )) : [];

        const selectedAsset = sprite.assets[this.state.selectedAssetIndex];

        return (
            <AssetPanel
                buttons={[{
                    title: intl.formatMessage(messages.fileUploadAsset),
                    img: fileUploadIcon,
                    onClick: this.handleFileUploadClick
                }, {
                    title: intl.formatMessage(messages.newTextFile),
                    img: addNewTxtFileIcon,
                    onClick: this.handleCreateBlankTextAsset
                }]}
                dragType={DragConstants.ASSET}
                isRtl={isRtl}
                items={assets}
                vm={vm}
                onFolderReorder={this.handleFolderReorder}
                onItemFolderChangeComplete={this.handleItemFolderChangeComplete}
                selectedItemIndex={this.state.selectedAssetIndex}
                onDeleteClick={this.handleDeleteAsset}
                onDrop={this.handleDrop}
                onDuplicateClick={this.handleDuplicateAsset}
                onExportClick={this.handleExportAsset}
                onItemClick={this.handleSelectAsset}
                onMoveToTopClick={this.handleMoveToTop}
                onMoveToBottomClick={this.handleMoveToBottom}
            >
                <input
                    multiple
                    ref={this.setFileInput}
                    style={{display: 'none'}}
                    type="file"
                    onChange={this.handleAssetUpload}
                />
                {sprite.assets && selectedAsset &&
                    <AssetViewer
                        icon={this.getAssetIcon(selectedAsset)}
                        selectedAssetIndex={this.state.selectedAssetIndex}
                    />
                }
            </AssetPanel>
        );
    }
}

const messages = defineMessages({
    fileUploadAsset: {
        defaultMessage: 'Upload Asset',
        description: 'Button to upload asset from file in the editor tab',
        id: 'gui.assetTab.fileUploadAsset'
    },
    newTextFile: {
        defaultMessage: 'New Text File',
        description: 'Button to create a blank text file in the asset tab',
        id: 'gui.assetTab.newTextFile'
    },
    newTextFileName: {
        defaultMessage: 'file',
        description: 'Default name for new blank text files in the asset tab',
        id: 'gui.assetTab.newTextFileName'
    }
});

AssetTab.propTypes = {
    dispatchUpdateRestore: PropTypes.func,
    editingTarget: PropTypes.string,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onCloseImporting: PropTypes.func.isRequired,
    onShowImporting: PropTypes.func.isRequired,
    sprites: PropTypes.shape({
        id: PropTypes.shape({
            sounds: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string.isRequired
            }))
        })
    }),
    stage: PropTypes.shape({
        sounds: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired
        }))
    }),
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    isRtl: state.locales.isRtl,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage
});

const mapDispatchToProps = dispatch => ({
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default errorBoundaryHOC('Asset tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(AssetTab))
);
