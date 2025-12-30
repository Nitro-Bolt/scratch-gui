import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeCustomAccentModal} from '../reducers/modals.js';
import CustomAccentModalComponent from '../components/nb-custom-accent-modal/custom-accent-modal.jsx';

class NBCustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['handleClose']);
        this.state = {
            multiSelect: false,
            draggable: true,
            dragging: null,
            extensions: []
        };
    }

    handleClose () {
        this.props.onClose();
    }

    render () {
        return (
            <CustomAccentModalComponent
                onClose={this.handleClose}
            />
        );
    }
}

NBCustomAccentModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeCustomAccentModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBCustomAccentModal);
