import bindAll from 'lodash.bindall';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Box from '../components/box/box.jsx';
import Modal from './modal.jsx';
import connectionManager from '../lib/nb-connection-manager.js';

import styles from '../components/nb-collaboration-join-request/join-request.css';

class NBCollaborationJoinRequest extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleJoinRequest',
            'handleAllow',
            'handleDeny'
        ]);
        this.state = {
            requests: []
        };
        this.previousJoinRequestHandler = null;
    }

    componentDidMount () {
        this.previousJoinRequestHandler = connectionManager.joinRequestHandler;
        connectionManager.joinRequestHandler = this.handleJoinRequest;
    }

    componentWillUnmount () {
        if (connectionManager.joinRequestHandler === this.handleJoinRequest) {
            connectionManager.joinRequestHandler = this.previousJoinRequestHandler;
        }
        this.state.requests.forEach(request => request.resolve(false));
    }

    handleJoinRequest (username, peer) {
        return new Promise(resolve => {
            this.setState(previousState => ({
                requests: [...previousState.requests, {
                    username,
                    peerId: peer.peer,
                    resolve
                }]
            }));
        });
    }

    resolveCurrentRequest (allowed) {
        const request = this.state.requests[0];
        if (!request) return;
        request.resolve(allowed);
        this.setState(previousState => ({
            requests: previousState.requests.slice(1)
        }));
    }

    handleAllow () {
        this.resolveCurrentRequest(true);
    }

    handleDeny () {
        this.resolveCurrentRequest(false);
    }

    render () {
        const request = this.state.requests[0];
        if (!request) return null;

        return (
            <Modal
                className={styles.modalContent}
                contentLabel="Live Collaboration Join Request"
                id="collaborationjoinrequest"
                onRequestClose={this.handleDeny}
            >
                <Box className={styles.body}>
                    <p>
                        <FormattedMessage
                            defaultMessage="{username} wants to join this collaboration session."
                            description="Message asking a host to approve a collaboration participant"
                            id="nb.liveCollaboration.joinRequest.message"
                            values={{username: request.username}}
                        />
                    </p>
                    <Box className={styles.buttons}>
                        <button
                            className={styles.denyButton}
                            onClick={this.handleDeny}
                        >
                            <FormattedMessage
                                defaultMessage="Deny"
                                description="Button that rejects a collaboration join request"
                                id="nb.liveCollaboration.joinRequest.deny"
                            />
                        </button>
                        <button
                            className={styles.allowButton}
                            onClick={this.handleAllow}
                        >
                            <FormattedMessage
                                defaultMessage="Allow"
                                description="Button that accepts a collaboration join request"
                                id="nb.liveCollaboration.joinRequest.allow"
                            />
                        </button>
                    </Box>
                </Box>
            </Modal>
        );
    }
}

export default NBCollaborationJoinRequest;
