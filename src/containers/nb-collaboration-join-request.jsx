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
            'handleDeny',
            'handleClientDisconnect'
        ]);
        this.state = {
            requests: []
        };
        this.previousJoinRequestHandler = null;
    }

    componentDidMount () {
        this.previousJoinRequestHandler = connectionManager.joinRequestHandler;
        connectionManager.joinRequestHandler = this.handleJoinRequest;
        connectionManager.on(
            connectionManager.Event.CLIENTDISCONNECT,
            this.handleClientDisconnect
        );
    }

    componentWillUnmount () {
        if (connectionManager.joinRequestHandler === this.handleJoinRequest) {
            connectionManager.joinRequestHandler = this.previousJoinRequestHandler;
        }
        connectionManager.off(
            connectionManager.Event.CLIENTDISCONNECT,
            this.handleClientDisconnect
        );
        this.state.requests.forEach(request => {
            clearTimeout(request.timeout);
            request.resolve(false);
        });
    }

    handleJoinRequest (username, peer) {
        const existing = this.state.requests.find(request => request.peerId === peer.peer);
        if (existing) return existing.promise;

        let resolveRequest;
        const promise = new Promise(resolve => {
            resolveRequest = resolve;
        });
        const request = {
            username: username.trim().slice(0, 64) || 'Anonymous',
            peer,
            peerId: peer.peer,
            resolve: resolveRequest,
            promise,
            timeout: null
        };
        request.timeout = setTimeout(() => {
            this.resolveRequest(request.peerId, false);
        }, 20000);
        this.setState(previousState => ({
            requests: [...previousState.requests, request]
        }));
        return promise;
    }

    resolveRequest (peerId, allowed) {
        const request = this.state.requests.find(item => item.peerId === peerId);
        if (!request) return;
        clearTimeout(request.timeout);
        request.resolve(Boolean(allowed && request.peer.open));
        this.setState(previousState => ({
            requests: previousState.requests.filter(item => item !== request)
        }));
    }

    resolveCurrentRequest (allowed) {
        const request = this.state.requests[0];
        if (request) this.resolveRequest(request.peerId, allowed);
    }

    handleClientDisconnect (peerId) {
        this.resolveRequest(peerId, false);
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
