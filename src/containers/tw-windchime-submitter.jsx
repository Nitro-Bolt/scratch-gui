import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import log from '../lib/log';

const ENDPOINT = 'https://windchimes.turbowarp.org/api/chime';
const OPT_OUT_KEY = 'tw:windchime_opt_out';
const submittedThisSession = new Set();

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

class TWWindchimeSubmitter extends React.Component {
    componentDidUpdate (prevProps) {
        if (
            (this.props.isStarted && !prevProps.isStarted) &&
            this.props.projectId !== '0'
        ) {
            this.submit();
        }
    }

    submit () {
        if (isOptedOut() || submittedThisSession.has(this.props.projectId)) {
            return;
        }

        submittedThisSession.add(this.props.projectId);

        fetch(ENDPOINT, {
            method: 'PUT',
            body: JSON.stringify({
                resource: `scratch/${this.props.projectId}`,
                event: this.props.isEmbedded ? 'view/embed' : 'view/index'
            }),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    log.error('Windchime request got status', res.status);
                }
            })
            .catch(err => {
                log.error('Windchime request failed', err);
            });
    }

    render () {
        // No visible components.
        return null;
    }
}

TWWindchimeSubmitter.propTypes = {
    isEmbedded: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    projectId: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.running,
    projectId: state.scratchGui.projectState.projectId
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWWindchimeSubmitter);
