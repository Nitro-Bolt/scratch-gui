import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeInspectBlockModal, openInspectBlockModal} from '../reducers/modals';
import InspectBlockModalComponent from '../components/nb-inspect-block-modal/inspect-block-modal.jsx';

class NBInspectBlockModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose'
        ]);
    }

    handleClose () {
        this.props.onClose();
    }

    render () {
        return (
            <InspectBlockModalComponent
                block={this.props.block}
                onClose={this.handleClose}
                onReplaceBlock={this.props.onReplaceBlock}
                isRtl={this.props.isRtl}
            />
        );
    }
}

NBInspectBlockModal.propTypes = {
    block: PropTypes.object,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onReplaceBlock: PropTypes.func
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    block: state.scratchGui.modals.inspectBlockModalBlock
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeInspectBlockModal()),
    onReplaceBlock: block => dispatch(openInspectBlockModal(block))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBInspectBlockModal);
