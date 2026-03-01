import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';

import getCostumeUrl from '../lib/get-costume-url';

import {connect} from 'react-redux';

import AssetViewerComponent from "../components/asset-viewer/asset-viewer.jsx";

const formatSize = bytes => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const getMediaType = dataFormat => {
    switch (dataFormat) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'svg':
        case 'bmp':
        case 'ico':
            return 'image';
        case 'mp4':
        case 'm4v':
        case 'webm':
        case 'mov':
            return 'video';
        case 'mp3':
        case 'wav':
        case 'aac':
        case 'ogg':
        case 'opus':
        case 'flac':
            return 'audio';
        default:
            return null;
    }
};

class AssetViewer extends React.Component {
    constructor (props) {
        super(props);

        bindAll(this, [
            'handleAssetRename'
        ]);

        this.state = {
            blobURL: null
        };
    }

    componentDidMount () {
        this.updateBlobURL();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.assetId !== this.props.assetId) {
            this.updateBlobURL();
        }
    }

    componentWillUnmount () {
        this.revokeBlobURL();
    }

    revokeBlobURL () {
        if (this.state.blobURL) {
            URL.revokeObjectURL(this.state.blobURL);
        }
    }

    getAssetObject () {
        const sprite = this.props.vm.editingTarget.sprite;
        return sprite.assets[this.props.assetIndex];
    }

    updateBlobURL () {
        this.revokeBlobURL();
        
        if (!this.props.mediaType) {
            this.setState({blobURL: null});
            return;
        }

        const assetObject = this.getAssetObject();
        if (!assetObject) {
            this.setState({blobURL: null});
            return;
        }
        
        const blob = new Blob([assetObject.asset.data], {type: this.props.contentType});
        this.setState({blobURL: URL.createObjectURL(blob)});
    }

    handleAssetRename (newName) {
        const [name, ...extensionParts] = newName.split('.');
        const extension = extensionParts.join('.');
        this.props.vm.renameAsset(this.props.assetIndex, name, extension);
    }

    render () {
        let imageURL;
        if (this.props.icon.asset) {
            imageURL = getCostumeUrl(this.props.icon.asset);
        } else if (this.props.icon.url) {
            imageURL = this.props.icon.url;
        }

        return (
            <AssetViewerComponent
                name={this.props.name}
                lastModified={this.props.lastModified}
                size={this.props.size}
                blobURL={this.state.blobURL}
                mediaType={this.props.mediaType}
                imageURL={imageURL}
                onChangeName={this.handleAssetRename}
            />
        );
    }
}

AssetViewer.propTypes = {
    icon: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    lastModified: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    assetId: PropTypes.string.isRequired,
    assetIndex: PropTypes.number.isRequired,
    contentType: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state, {selectedAssetIndex}) => {
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    const index = selectedAssetIndex < sprite.assets.length ?
        selectedAssetIndex : sprite.assets.length - 1;
    const assetObject = sprite.assets[index];

    return {
        vm: state.scratchGui.vm,
        name: assetObject.dataFormat !== '' ?
            assetObject.name + '.' + assetObject.dataFormat :
            assetObject.name,
        lastModified: assetObject.lastModified ?
            new Date(assetObject.lastModified).toLocaleString() :
            'Unknown',
        size: formatSize(assetObject.asset.data.byteLength),
        assetIndex: index,
        assetId: assetObject.asset.assetId,
        contentType: assetObject.contentType,
        mediaType: getMediaType(assetObject.dataFormat)
    };
};

export default connect(
    mapStateToProps
)(AssetViewer);