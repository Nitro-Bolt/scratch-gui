import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {closeGitModal} from '../reducers/modals';
import {activateTab, BLOCKS_TAB_INDEX} from '../reducers/editor-tab';
import {setFileHandle, setGitProjectPath} from '../reducers/tw';
import GitModalComponent from '../components/nb-git-modal/git-modal.jsx';

const NBGitModal = props => (
    <GitModalComponent
        dark={props.dark}
        onClearFileHandle={props.onClearFileHandle}
        onClose={props.onClose}
        onShowBlocks={props.onShowBlocks}
        onSetProjectPath={props.onSetProjectPath}
        projectPath={props.projectPath}
        vm={props.vm}
    />
);

NBGitModal.propTypes = {
    dark: PropTypes.bool,
    onClearFileHandle: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onShowBlocks: PropTypes.func.isRequired,
    onSetProjectPath: PropTypes.func.isRequired,
    projectPath: PropTypes.string,
    vm: PropTypes.shape({
        loadProject: PropTypes.func.isRequired,
        quit: PropTypes.func.isRequired,
        renderer: PropTypes.shape({
            draw: PropTypes.func.isRequired
        })
    }).isRequired
};

const mapStateToProps = state => ({
    dark: state.scratchGui.theme.theme.gui === 'dark',
    projectPath: state.scratchGui.tw.gitProjectPath,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClearFileHandle: () => dispatch(setFileHandle(null)),
    onClose: () => dispatch(closeGitModal()),
    onShowBlocks: () => dispatch(activateTab(BLOCKS_TAB_INDEX)),
    onSetProjectPath: projectPath => dispatch(setGitProjectPath(projectPath))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBGitModal);
