import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import VM from 'scratch-vm';
import {getIsError} from '../reducers/project-state';
import {ProjectUnsharedError, ProjectFetchError} from '../lib/tw-load-project-error';

const ENDPOINT = 'https://windchimes.turbowarp.org/api/chime';
const OPT_OUT_KEY = 'tw:windchime_opt_out';
const submittedViewsThisSession = new Set();
const submittedErrorsThisSession = new Set();

const isOptedOut = () => {
    if (!process.env.ENABLE_WINDCHIMES) {
        return true;
    }

    try {
        const local = localStorage.getItem(OPT_OUT_KEY);
        if (local !== null) {
            return local === 'true';
        }
    } catch (e) {
        // ignore
    }

    // These headers are really intended to be about third-parties so we don't need to follow them,
    // but if someone has these set, it's good to assume that they would opt out if given the choice.
    // So we'll just respect that preemptively.
    return navigator.globalPrivacyControl || navigator.doNotTrack === '1';
};

const getErrorEvent = error => {
    if (error instanceof ProjectUnsharedError) {
        return 'error/unshared';
    }
    if (error instanceof ProjectFetchError) {
        return 'error/fetch';
    }
    return 'error/loading';
};

const submitChime = async (resource, event) => {
    if (isOptedOut()) {
        return;
    }

    try {
        await fetch(ENDPOINT, {
            method: 'PUT',
            body: JSON.stringify({
                resource,
                event
            }),
            headers: {
                'content-type': 'application/json'
            }
        });
        // safe to not check response - we don't do anything with it
    } catch (e) {
        // safe to just ignore - windchimes are not critical
    }
};

const isEligible = projectId => projectId !== '0' && projectId !== null;

const submitOnce = (submitted, projectId, event) => {
    if (!isEligible(projectId) || submitted.has(projectId)) {
        return;
    }
    submitted.add(projectId);
    submitChime(`scratch/${projectId}`, event);
};

class TWWindchimeSubmitter extends React.Component {
    constructor (props) {
        super(props);
        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleCompileError = this.handleCompileError.bind(this);
    }

    componentDidMount () {
        const vm = this.props.vm;
        vm.on('COMPILE_ERROR', this.handleCompileError);
        if (vm.renderer) {
            vm.renderer.on('ContextLost', this.handleContextLost);
        }
    }

    componentDidUpdate (prevProps) {
        if (this.props.isStarted && !prevProps.isStarted) {
            submitOnce(
                submittedViewsThisSession,
                this.props.projectId,
                this.props.isEmbedded ? 'view/embed' : 'view/index'
            );
        }

        if (this.props.isError && !prevProps.isError) {
            submitOnce(submittedErrorsThisSession, this.props.projectId, getErrorEvent(this.props.error));
        }
    }

    componentWillUnmount () {
        const vm = this.props.vm;
        vm.off('COMPILE_ERROR', this.handleCompileError);
        if (vm.renderer) {
            vm.renderer.off('ContextLost', this.handleContextLost);
        }
    }

    handleCompileError () {
        submitOnce(submittedErrorsThisSession, this.props.projectId, 'error/compiler');
    }

    handleContextLost () {
        submitOnce(submittedErrorsThisSession, this.props.projectId, 'error/webgl');
    }

    render () {
        // No visible components.
        return null;
    }
}

TWWindchimeSubmitter.propTypes = {
    error: PropTypes.any,
    isEmbedded: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    error: state.scratchGui.projectState.error,
    isEmbedded: state.scratchGui.mode.isEmbedded,
    isStarted: state.scratchGui.vmStatus.running,
    isError: getIsError(state.scratchGui.projectState.loadingState),
    projectId: state.scratchGui.projectState.projectId,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWWindchimeSubmitter);
