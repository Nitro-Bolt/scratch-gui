import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';

import getCostumeUrl from '../lib/get-costume-url';

import {connect} from 'react-redux';

import AssetViewerComponent from "../components/asset-viewer/asset-viewer.jsx";

class AssetViewer extends React.Component {
    constructor (props) {
        super(props);

        bindAll(this, [
            'handleAssetRename'
        ]);
    }

    handleAssetRename (newName) {
        this.props.vm.renameAsset(this.props.assetIndex, newName);
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
                imageURL={imageURL}
                onChangeName={this.handleAssetRename}
            />
        );
    }
}

AssetViewer.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    assetIndex: PropTypes.number.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state) => {
    return {
        vm: state.scratchGui.vm
    };
};

export default connect(
    mapStateToProps
)(AssetViewer);