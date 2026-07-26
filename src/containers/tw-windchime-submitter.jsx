import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
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

class TWWindchimeSubmitter extends React.Component {
    componentDidUpdate (prevProps) {
        if (this.props.projectId === '0' || this.props.projectId === null) {
            // Only projects with a real ID are eligible for windchimes.
            return;
        }

        if (
            this.props.isStarted && !prevProps.isStarted &&
            !submittedViewsThisSession.has(this.props.projectId)
        ) {
            submittedViewsThisSession.add(this.props.projectId);
            submitChime(`scratch/${this.props.projectId}`, this.props.isEmbedded ? 'view/embed' : 'view/index');
        }

        if (
            this.props.isError && !prevProps.isError &&
            !submittedErrorsThisSession.has(this.props.projectId)
        ) {
            submittedErrorsThisSession.add(this.props.projectId);
            submitChime(`scratch/${this.props.projectId}`, getErrorEvent(this.props.error));
        }
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
    projectId: PropTypes.string
};

const mapStateToProps = state => ({
    error: state.scratchGui.projectState.error,
    isEmbedded: state.scratchGui.mode.isEmbedded,
    isStarted: state.scratchGui.vmStatus.running,
    isError: getIsError(state.scratchGui.projectState.loadingState),
    projectId: state.scratchGui.projectState.projectId
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWWindchimeSubmitter);
