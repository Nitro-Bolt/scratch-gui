import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeGitModal} from '../reducers/modals';
import GitModalComponent from '../components/nb-git-modal/git-modal.jsx';

class NBGitModal extends React.Component {
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
            <GitModalComponent
                onClose={this.handleClose}
                projectPath={this.props.projectPath}
            />
        );
    }
}

NBGitModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    projectPath: PropTypes.string
};

const mapStateToProps = state => ({
    projectPath: state.scratchGui.projectPath
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeGitModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBGitModal);
