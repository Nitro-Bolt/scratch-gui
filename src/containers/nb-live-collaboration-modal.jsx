import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeLiveCollaborationModal} from '../reducers/modals';
import LiveCollaborationModalComponent from '../components/nb-live-collaboration-modal/live-collaboration-modal.jsx';
import connectionManager from '../lib/nb-connection-manager.js';

class NBLiveCollaborationModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose',
            'handleInput',
            'handleJoinRoom',
            'handleCreateRoom',
            'handleCopyURL',
            'handleCopyID',
            'handleLeaveRoom',
            'handleCloseRoom',
            'handleMultiSelectState',
            'kickUser',
            'updateUserList',
            'kickUsers'
        ]);
        this.state = {
            input: '',
            connected: connectionManager.connected,
            isHost: connectionManager.isHost,
            users: connectionManager.users,
            selectedUsers: [],
            multiSelect: false
        };
    }

    componentDidMount () {
        connectionManager.init(localStorage.getItem('tw:username'));
    }

    handleClose () {
        this.props.onClose();
    }

    handleInput (input) {
        this.setState({input: input.target.value});
    }

    handleJoinRoom () {
        connectionManager.joinRoom(this.state.input);
        this.setState({connected: true});
    }

    handleCreateRoom () {
        connectionManager.createRoom();
        this.setState({connected: true, isHost: true});
    }

    handleCopyURL () {
        navigator.clipboard.writeText(window.location.href)
        .then(() => {
            alert('URL copied to clipboard!');
        })
        .catch(err => {});
    }

    handleCopyID () {
        navigator.clipboard.writeText(connectionManager.roomId)
        .then(() => {
            alert('ID copied to clipboard!');
        })
        .catch(err => {});
    }

    handleLeaveRoom () {
        connectionManager.leaveRoom();
        this.setState({connected: false, input: ''});
    }

    handleCloseRoom () {
        connectionManager.shutdownRoom();
        connectionManager.init(localStorage.getItem('tw:username'));
        this.setState({connected: false, isHost: false});
    }

    handleMultiSelectState () {
        if (!this.state.multiSelect) {
            this.setState({extensions: []});
        }
        this.setState({multiSelect: !this.state.multiSelect});
    }

    kickUser (userID) {
        connectionManager.kickPeer(userID);
        this.props.onClose();
    }

    updateUserList (checkbox) {
        if (checkbox.target.checked) {
            this.setState({selectedUsers: [...this.state.selectedUsers, checkbox.target.value]});
        } else {
            this.setState({selectedUsers: this.state.selectedUsers.filter(user => user !== checkbox.target.value)});
        }
    }

    kickUsers (users) {
        users.forEach((user) => {
            connectionManager.kickPeer(user);
        });
        this.props.onClose();
    }

    render () {
        return (
            <LiveCollaborationModalComponent // todo: these events can probably just be bound to the thing
                onClose={this.handleClose}
                isHost={this.state.isHost}
                users={this.state.users}
                multiSelect={this.state.multiSelect}
                input={this.state.input}
                changeMultiSelectState={this.handleMultiSelectState}
                selectedUsers={this.state.selectedUsers}
                connected={this.state.connected}
                onInput={this.handleInput}
                onJoinRoom={this.handleJoinRoom}
                onCreateRoom={this.handleCreateRoom}
                onCopyURL={this.handleCopyURL}
                onCopyID={this.handleCopyID}
                onLeaveRoom={this.handleLeaveRoom}
                onCloseRoom={this.handleCloseRoom}
                kickUser={this.kickUser}
                updateUserList={this.updateUserList}
                kickUsers={this.kickUsers}
            />
        );
    }
};

NBLiveCollaborationModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    isHost: PropTypes.bool,
    users: PropTypes.array,
    multiSelect: PropTypes.bool,
    input: PropTypes.string,
    changeMultiSelectState: PropTypes.func,
    selectedUsers: PropTypes.array,
    connected: PropTypes.bool,
    onInput: PropTypes.func,
    onJoinRoom: PropTypes.func,
    onCreateRoom: PropTypes.func,
    onCopyURL: PropTypes.func,
    onCopyID: PropTypes.func,
    onLeaveRoom: PropTypes.func,
    onCloseRoom: PropTypes.func,
    kickUser: PropTypes.func,
    updateUserList: PropTypes.func,
    kickUsers: PropTypes.func
};

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeLiveCollaborationModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBLiveCollaborationModal);