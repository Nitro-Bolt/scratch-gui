import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import {closeLiveCollaborationModal} from '../reducers/modals';
import LiveCollaborationModalComponent from '../components/nb-live-collaboration-modal/live-collaboration-modal.jsx';
import connectionManager from '../lib/nb-connection-manager.js';

class NBLiveCollaborationModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleConnectionLock',
            'handleConnectionUnlock',
            'handlePeersUpdate',
            'handleUsernameUpdate',
            'handleRoomChange',
            'handleClose',
            'handleInput',
            'handleJoinRoom',
            'handleCreateRoom',
            'handleCopyURL',
            'handleCopyID',
            'handleLeaveRoom',
            'handleCloseRoom',
            'handleToggleMultiSelect',
            'handleKickUser',
            'handleUserSelectionChange',
            'handleKickSelected'
        ]);
        this.state = {
            input: '',
            connected: connectionManager.connected,
            isHost: connectionManager.isHost,
            users: new Map(connectionManager.users),
            selectedUsers: [],
            multiSelect: false,
            copyStatus: null,
            connectionLocked: connectionManager.connectionLocked
        };
        this.copyStatusTimer = null;
        this.mounted = false;
    }

    componentDidMount () {
        this.mounted = true;
        if (!connectionManager.initialized) {
            connectionManager.init(localStorage.getItem('tw:username') || 'Anonymous');
        }

        connectionManager.on(connectionManager.Event.CONNECTIONSUPDATE, this.handlePeersUpdate);
        connectionManager.on(connectionManager.Event.ROOMCHANGE, this.handleRoomChange);
        connectionManager.on(connectionManager.Event.JOINLOCK, this.handleConnectionLock);
        connectionManager.on(connectionManager.Event.JOINUNLOCK, this.handleConnectionUnlock);
        connectionManager.on(connectionManager.Event.USERNAMEUPDATE, this.handleUsernameUpdate);
    }

    componentWillUnmount () {
        this.mounted = false;
        if (this.copyStatusTimer) clearTimeout(this.copyStatusTimer);
        connectionManager.off(connectionManager.Event.CONNECTIONSUPDATE, this.handlePeersUpdate);
        connectionManager.off(connectionManager.Event.ROOMCHANGE, this.handleRoomChange);
        connectionManager.off(connectionManager.Event.JOINLOCK, this.handleConnectionLock);
        connectionManager.off(connectionManager.Event.JOINUNLOCK, this.handleConnectionUnlock);
        connectionManager.off(connectionManager.Event.USERNAMEUPDATE, this.handleUsernameUpdate);
    }

    handleConnectionLock () {
        this.setState({connectionLocked: true});
    }

    handleConnectionUnlock () {
        this.setState({connectionLocked: false});
    }

    handlePeersUpdate () {
        const users = new Map(connectionManager.users);
        this.setState(previousState => {
            const selectedUsers = previousState.selectedUsers.filter(peerId => users.has(peerId));
            return {
                users,
                selectedUsers,
                multiSelect: previousState.multiSelect && users.size > 0
            };
        });
    }

    handleUsernameUpdate () {
        this.setState({users: new Map(connectionManager.users)});
    }

    handleRoomChange () {
        if (this.copyStatusTimer) {
            clearTimeout(this.copyStatusTimer);
            this.copyStatusTimer = null;
        }
        this.setState({
            connected: connectionManager.connected,
            isHost: connectionManager.isHost,
            users: new Map(connectionManager.users),
            selectedUsers: [],
            multiSelect: false,
            copyStatus: null
        });
    }

    handleClose () {
        this.props.onClose();
    }

    handleInput (event) {
        this.setState({input: event.target.value});
    }

    handleJoinRoom () {
        const result = connectionManager.joinRoom(this.state.input.trim());
        if (result && typeof result.catch === 'function') result.catch(() => {});
    }

    handleCreateRoom () {
        connectionManager.createRoom();
    }

    handleCopyURL () {
        this.copyText(window.location.href, 'url');
    }

    handleCopyID () {
        this.copyText(connectionManager.roomId, 'id');
    }

    handleLeaveRoom () {
        connectionManager.leaveRoom();
    }

    handleCloseRoom () {
        connectionManager.close();
    }

    handleToggleMultiSelect () {
        this.setState(previousState => ({
            multiSelect: !previousState.multiSelect,
            selectedUsers: []
        }));
    }

    handleKickUser (peerId) {
        connectionManager.kickPeer(peerId);
    }

    handleUserSelectionChange (event) {
        const peerId = event.target.value;
        const checked = event.target.checked;
        this.setState(previousState => ({
            selectedUsers: checked ?
                [...previousState.selectedUsers, peerId] :
                previousState.selectedUsers.filter(user => user !== peerId)
        }));
    }

    handleKickSelected () {
        this.state.selectedUsers.forEach(peerId => {
            connectionManager.kickPeer(peerId);
        });
        this.setState({
            selectedUsers: [],
            multiSelect: false
        });
    }

    copyText (text, item) {
        if (!text || !navigator.clipboard ||
            typeof navigator.clipboard.writeText !== 'function') {
            this.showCopyStatus(`${item}-error`);
            return;
        }
        Promise.resolve(navigator.clipboard.writeText(text))
            .then(() => this.showCopyStatus(item))
            .catch(() => this.showCopyStatus(`${item}-error`));
    }

    showCopyStatus (copyStatus) {
        if (!this.mounted) return;
        if (this.copyStatusTimer) clearTimeout(this.copyStatusTimer);
        this.setState({copyStatus});
        this.copyStatusTimer = setTimeout(() => {
            this.copyStatusTimer = null;
            if (!this.mounted) return;
            this.setState({copyStatus: null});
        }, 2500);
    }

    render () {
        return (
            <LiveCollaborationModalComponent
                connected={this.state.connected}
                connectionLocked={this.state.connectionLocked}
                copyStatus={this.state.copyStatus}
                input={this.state.input}
                isHost={this.state.isHost}
                multiSelect={this.state.multiSelect}
                selectedUsers={this.state.selectedUsers}
                users={this.state.users}
                onClose={this.handleClose}
                onCloseRoom={this.handleCloseRoom}
                onCopyID={this.handleCopyID}
                onCopyURL={this.handleCopyURL}
                onCreateRoom={this.handleCreateRoom}
                onInput={this.handleInput}
                onJoinRoom={this.handleJoinRoom}
                onKickSelected={this.handleKickSelected}
                onKickUser={this.handleKickUser}
                onLeaveRoom={this.handleLeaveRoom}
                onToggleMultiSelect={this.handleToggleMultiSelect}
                onUserSelectionChange={this.handleUserSelectionChange}
            />
        );
    }
}

NBLiveCollaborationModal.propTypes = {
    onClose: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeLiveCollaborationModal())
});

export default connect(
    null,
    mapDispatchToProps
)(NBLiveCollaborationModal);
