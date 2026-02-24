import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import AssetViewer from './asset-viewer.jsx';

import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import assetIcon from '../components/asset-panel/icon--asset.svg';
import soundIcon from '../components/asset-panel/icon--sound.svg';
import codeIcon from '../components/asset-panel/icon--code.svg';

import DragConstants from '../lib/drag-constants';
import {handleFileUpload, assetUpload} from '../lib/file-uploader.js';
import downloadBlob from '../lib/download-blob';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';

import {defineMessages, intlShape, injectIntl} from 'react-intl';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';

import {
    activateTab,
    ASSETS_TAB_INDEX,
    COSTUMES_TAB_INDEX,
    SOUNDS_TAB_INDEX
} from '../reducers/editor-tab';

import {connect} from 'react-redux';

const formatSize = bytes => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

// A list of file extensions for scratch-based mods
// Used for the blocks icon
const projectFormats = [
    'sb3',
    'sprite3',
    'pmp', // PenguinMod
    'pms',
    'snail', // Snail-IDE
    '.electra' // Electra-mod
];

class AssetTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSelectAsset',
            'handleDeleteAsset',
            'handleDuplicateAsset',
            'handleExportAsset',
            'handleNewAsset',
            'handleFileUploadClick',
            'handleAssetUpload',
            'handleDrop',
            'setFileInput'
        ]);
        this.state = {selectedAssetIndex: 0};
    }

    getAssetIcon (asset) {
        const contentType = asset.asset.assetType.contentType;
        const dataFormat = asset.dataFormat;
        console.log(asset, contentType);
        if (contentType.startsWith('audio/')) {
            return {url: soundIcon};
        } else if (contentType.startsWith('image/')) {
            const assetObject = asset.asset;
            if (!assetObject) return {url: assetIcon};
            return {asset: assetObject};
        } else if (projectFormats.includes(dataFormat)) {
            return {url: codeIcon};
        } else {
            return {url: assetIcon};
        }
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
            console.log(fileType);
            assetUpload(buffer, fileType, fileExtension || '', storage, newAsset => {
                newAsset.name = fileName;
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

    handleDrop (dropInfo) {
        if (dropInfo.dragType === DragConstants.ASSET) {
            const sprite = this.props.vm.editingTarget.sprite;
            const activeAsset = sprite.assets[this.state.selectedAssetIndex];

            this.props.vm.reorderAsset(this.props.vm.editingTarget.id,
                dropInfo.index, dropInfo.newIndex);

            this.setState({selectedAssetIndex: sprite.assets.indexOf(activeAsset)});
        } else if (dropInfo.dragType === DragConstants.BACKPACK_COSTUME) {
            this.props.onActivateCostumesTab();
            this.props.vm.addCostume(dropInfo.payload.body, {
                name: dropInfo.payload.name
            });
        } else if (dropInfo.dragType === DragConstants.BACKPACK_SOUND) {
            this.props.onActivateSoundsTab();
            this.props.vm.addSound({
                md5: dropInfo.payload.body,
                name: dropInfo.payload.name
            });
        }
    }

    handleDuplicateAsset (assetIndex) {
        this.props.vm.duplicateAsset(assetIndex).then(() => {
            this.setState({selectedAssetIndex: assetIndex + 1});
        });
    }

    handleExportAsset (assetIndex) {
        const item = this.props.vm.editingTarget.sprite.assets[assetIndex];
        const blob = new Blob([item.asset.data], {type: item.asset.assetType.contentType});
        downloadBlob(`${item.name}.${item.asset.dataFormat}`, blob);
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
                    asset.name + '.' + asset.dataFormat : asset.name,
                dragPayload: asset,
                details: formatSize(asset.asset.data.byteLength),
                ...this.getAssetIcon(asset)
            }
        )) : [];

        const messages = defineMessages({
            fileUploadAsset: {
                defaultMessage: 'Upload Asset',
                description: 'Button to upload asset from file in the editor tab',
                id: 'gui.assetTab.fileUploadAsset'
            }
        });

        const selectedAsset = sprite.assets[this.state.selectedAssetIndex];

        return (
            <AssetPanel
                buttons={[{
                    title: intl.formatMessage(messages.fileUploadAsset),
                    img: fileUploadIcon,
                    onClick: this.handleFileUploadClick
                }]}
                dragType={DragConstants.ASSET}
                isRtl={isRtl}
                items={assets}
                selectedItemIndex={this.state.selectedAssetIndex}
                onDeleteClick={this.handleDeleteAsset}
                onDrop={this.handleDrop}
                onDuplicateClick={this.handleDuplicateAsset}
                onExportClick={this.handleExportAsset}
                onItemClick={this.handleSelectAsset}
            >
                <input
                    accept="*"
                    multiple
                    ref={this.setFileInput}
                    style={{ display: 'none' }}
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

AssetTab.propTypes = {
    dispatchUpdateRestore: PropTypes.func,
    editingTarget: PropTypes.string,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onActivateCostumesTab: PropTypes.func.isRequired,
    onActivateSoundsTab: PropTypes.func.isRequired,
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
    stage: state.scratchGui.targets.stage,
});

const mapDispatchToProps = dispatch => ({
    onActivateAssetsTab: () => dispatch(activateTab(ASSETS_TAB_INDEX)),
    onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
    onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default errorBoundaryHOC('Asset tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(AssetTab))
);