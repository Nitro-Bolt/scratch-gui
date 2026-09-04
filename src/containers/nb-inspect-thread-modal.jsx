import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeInspectThreadModal} from '../reducers/modals.js';
import InspectThreadModalComponent from '../components/nb-inspect-thread-modal/inspect-thread-modal.jsx';

class NBInspectThreadModal extends React.Component {
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
            <InspectThreadModalComponent
                thread={this.props.thread}
                onClose={this.handleClose}
                isRtl={this.props.isRtl}
            />
        );
    }
}

NBInspectThreadModal.propTypes = {
    thread: PropTypes.object,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onReplaceBlock: PropTypes.func
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    thread: state.scratchGui.modals.inspectThreadModalThread
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeInspectThreadModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBInspectThreadModal);
