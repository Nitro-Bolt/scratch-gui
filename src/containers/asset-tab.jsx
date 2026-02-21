import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';

import {defineMessages, intlShape, injectIntl} from 'react-intl';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';

import {
    activateTab,
    ASSETS_TAB_INDEX
} from '../reducers/editor-tab';

import {connect} from 'react-redux';

class AssetTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [

        ]);
        this.state = {selectedAssetIndex: 0};
    }

    render () {
        return (
            <></>
        );
    }
}

AssetTab.propTypes = {
    dispatchUpdateRestore: PropTypes.func,
    editingTarget: PropTypes.string,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onActivateCostumesTab: PropTypes.func.isRequired,
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
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default errorBoundaryHOC('Asset tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(AssetTab))
);