import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import {connect} from 'react-redux';
import {handleFileUpload, assetUpload} from '../lib/file-uploader.js';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import DragConstants from '../lib/drag-constants';
import downloadBlob from '../lib/download-blob';

import {
    activateTab,
    COSTUMES_TAB_INDEX,
    SOUNDS_TAB_INDEX
} from '../reducers/editor-tab';

import {setRestore} from '../reducers/restore-deletion';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';

import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';

const messages = defineMessages({
    addFileAsset: {
        defaultMessage: 'Upload File',
        description: 'Button to upload a generic asset file',
        id: 'gui.assetTab.uploadFile'
    }
});

class AssetTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSelectAsset',
            'handleDeleteAsset',
            'handleDuplicateAsset',
            'handleExportAsset',
            'handleFileUploadClick',
            'handleAssetUpload',
            'handleDrop',
            'setFileInput'
        ]);
        this.state = {selectedAssetIndex: 0};
    }

    componentWillReceiveProps (nextProps) {
        const {assets} = nextProps;
        if (this.state.selectedAssetIndex > (assets.length - 1)) {
            this.setState({selectedAssetIndex: Math.max(assets.length - 1, 0)});
        }
    }

    handleSelectAsset (assetIndex) {
        this.setState({selectedAssetIndex: assetIndex});
    }

    handleDeleteAsset (assetIndex) {
        const restoreFun = this.props.vm.deleteAsset(assetIndex);
        this.props.dispatchUpdateRestore({restoreFun, deletedItem: 'Asset'});
        if (assetIndex >= this.state.selectedAssetIndex) {
            this.setState({selectedAssetIndex: Math.max(0, assetIndex - 1)});
        }
    }

    handleDuplicateAsset (assetIndex) {
        this.props.vm.duplicateAsset(assetIndex);
    }

    handleExportAsset (assetIndex) {
        const item = this.props.vm.editingTarget.sprite.assets[assetIndex];
        const blob = new Blob([item.asset.data], {type: item.asset.assetType.contentType});
        downloadBlob(`${item.name}.${item.asset.dataFormat}`, blob);
    }

    handleFileUploadClick () {
        this.fileInput.click();
    }

    handleAssetUpload (e) {
        const vm = this.props.vm;
        const targetId = this.props.vm.editingTarget.id;
        this.props.onShowImporting();
        handleFileUpload(e.target, (buffer, fileType, fileName, fileIndex, fileCount) => {
            assetUpload(buffer, fileType, vm, newAssets => {
                newAssets.forEach((asset, i) => {
                    asset.name = `${fileName}${i ? i + 1 : ''}`;
                });
                Promise.all(newAssets.map(asset => vm.addAsset(asset, targetId))).then(() => {
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
        }
    }

    setFileInput (input) {
        this.fileInput = input;
    }

    render () {
        const {
            dispatchUpdateRestore, // eslint-disable-line no-unused-vars
            intl,
            isRtl,
            assets
        } = this.props;

        if (!this.props.vm.editingTarget) {
            return null;
        }

        const sprite = this.props.vm.editingTarget.sprite;

        const assetData = sprite.assets ? sprite.assets.map(asset => ({
            name: asset.name,
            asset: asset.asset,
            details: asset.details || '',
            dragPayload: asset
        })) : [];

        return (
            <AssetPanel
                buttons={[
					{
                        title: intl.formatMessage(messages.addFileAsset),
                        img: fileUploadIcon,
                        onClick: this.handleFileUploadClick,
                        fileAccept: '*.*',
                        fileChange: this.handleAssetUpload,
                        fileInput: this.setFileInput,
                        fileMultiple: true
                    },
                    {
                        title: intl.formatMessage(messages.addFileAsset),
                        img: fileUploadIcon,
                        onClick: this.handleFileUploadClick,
                        fileAccept: '*.*',
                        fileChange: this.handleAssetUpload,
                        fileInput: this.setFileInput,
                        fileMultiple: true
                    }
                ]}
                dragType={DragConstants.ASSET}
                isRtl={isRtl}
                items={assetData}
                selectedItemIndex={this.state.selectedAssetIndex}
                onDeleteClick={this.handleDeleteAsset}
                onDrop={this.handleDrop}
                onDuplicateClick={this.handleDuplicateAsset}
                onExportClick={this.handleExportAsset}
                onItemClick={this.handleSelectAsset}
            />
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
    assets: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        details: PropTypes.string
    })),
    sprites: PropTypes.object,
    stage: PropTypes.object,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    isRtl: state.locales.isRtl,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    assets: state.scratchGui.targets.editingTarget
        ? (state.scratchGui.targets.sprites[state.scratchGui.targets.editingTarget].assets || [])
        : []
});

const mapDispatchToProps = dispatch => ({
    onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
    onActivateSoundsTab: () => dispatch(activateTab(SOUNDS_TAB_INDEX)),
    dispatchUpdateRestore: restoreState => {
        dispatch(setRestore(restoreState));
    },
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default errorBoundaryHOC('Asset Tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(AssetTab))
);
