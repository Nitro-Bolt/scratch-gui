import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';

import styles from './live-collaboration-modal.css';

const messages = defineMessages({
    title: {
        defaultMessage: 'Live Collaboration',
        description: 'Title of the Live Collaboration panel',
        id: 'nb.liveCollaboration.title'
    },
    roomIdPlaceholder: {
        defaultMessage: 'Enter Room ID…',
        description: 'Placeholder for a Live Collaboration room ID',
        id: 'nb.liveCollaboration.roomIdPlaceholder'
    },
    anonymous: {
        defaultMessage: 'Anonymous',
        description: 'Fallback name for a Live Collaboration participant',
        id: 'nb.liveCollaboration.anonymous'
    },
    kickUser: {
        defaultMessage: 'Remove {username} from the room',
        description: 'Accessible label for removing a Live Collaboration participant',
        id: 'nb.liveCollaboration.kickUser'
    }
});

const Header = props => (
    <div className={styles.header}>
        {props.children}
        <div className={styles.divider} />
    </div>
);

Header.propTypes = {
    children: PropTypes.node
};

class UserCard extends React.Component {
    constructor (props) {
        super(props);
        this.handleKick = this.handleKick.bind(this);
    }

    handleKick () {
        this.props.onKickUser(this.props.peerId);
    }

    render () {
        const username = this.props.username || this.props.anonymousName;
        return (
            <Box className={styles.userCard}>
                <p>{username}</p>
                {this.props.isHost && (this.props.multiSelect ? (
                    <FancyCheckbox
                        checked={this.props.selected}
                        className={styles.checkboxOption}
                        value={this.props.peerId}
                        onChange={this.props.onUserSelectionChange}
                    />
                ) : (
                    <button
                        aria-label={this.props.kickLabel}
                        className={styles.kickOption}
                        title={this.props.kickLabel}
                        type="button"
                        onClick={this.handleKick}
                    />
                ))}
            </Box>
        );
    }
}

UserCard.propTypes = {
    anonymousName: PropTypes.string.isRequired,
    isHost: PropTypes.bool.isRequired,
    kickLabel: PropTypes.string.isRequired,
    multiSelect: PropTypes.bool.isRequired,
    onKickUser: PropTypes.func.isRequired,
    onUserSelectionChange: PropTypes.func.isRequired,
    peerId: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    username: PropTypes.string
};

const LiveCollaborationModal = props => {
    const anonymousName = props.intl.formatMessage(messages.anonymous);
    const userCards = Array.from(props.users.entries()).map(([peerId, username]) => (
        <UserCard
            anonymousName={anonymousName}
            isHost={props.isHost}
            key={peerId}
            kickLabel={props.intl.formatMessage(messages.kickUser, {
                username: username || anonymousName
            })}
            multiSelect={props.multiSelect}
            peerId={peerId}
            selected={props.selectedUsers.includes(peerId)}
            username={username}
            onKickUser={props.onKickUser}
            onUserSelectionChange={props.onUserSelectionChange}
        />
    ));

    const disconnectedContent = (
        <React.Fragment>
            <Header>
                <FormattedMessage
                    defaultMessage="Join a room"
                    description="Title for the join a room section"
                    id="nb.liveCollaboration.joinARoom"
                />
            </Header>
            <Box className={styles.row}>
                <input
                    className={styles.input}
                    id="roomID"
                    placeholder={props.intl.formatMessage(messages.roomIdPlaceholder)}
                    type="text"
                    value={props.input}
                    onChange={props.onInput}
                />
                <button
                    className={styles.button}
                    disabled={!props.input.trim() || props.connectionLocked}
                    id="joinRoom"
                    type="button"
                    onClick={props.onJoinRoom}
                >
                    <FormattedMessage
                        defaultMessage="Connect to Room"
                        description="Button for joining a Live Collaboration room"
                        id="nb.liveCollaboration.connect"
                    />
                </button>
            </Box>
            <Header>
                <FormattedMessage
                    defaultMessage="Create a room"
                    description="Title for the create a room section"
                    id="nb.liveCollaboration.createARoom"
                />
            </Header>
            <Box className={styles.row}>
                <button
                    className={classNames(styles.button, styles.buttonFlex)}
                    disabled={props.connectionLocked}
                    id="createRoom"
                    type="button"
                    onClick={props.onCreateRoom}
                >
                    <FormattedMessage
                        defaultMessage="Create a Room"
                        description="Button for creating a Live Collaboration room"
                        id="nb.liveCollaboration.create"
                    />
                </button>
            </Box>
        </React.Fragment>
    );

    const hostRoomControls = (
        <Box className={styles.roomDetails}>
            <button
                className={classNames(styles.button, styles.fullWidthButton)}
                id="closeRoom"
                type="button"
                onClick={props.onCloseRoom}
            >
                <FormattedMessage
                    defaultMessage="Close Room"
                    description="Button for closing a hosted Live Collaboration room"
                    id="nb.liveCollaboration.closeRoom"
                />
            </button>
            <div className={styles.halfButtonRow}>
                <button
                    className={classNames(styles.buttonAlternate, styles.buttonFlex)}
                    id="copyURL"
                    type="button"
                    onClick={props.onCopyURL}
                >
                    {props.copyStatus === 'url' && (
                        <FormattedMessage
                            defaultMessage="Copied!"
                            description="Confirmation shown after copying a Live Collaboration room URL"
                            id="nb.liveCollaboration.urlCopiedShort"
                        />
                    )}
                    {props.copyStatus === 'url-error' && (
                        <FormattedMessage
                            defaultMessage="Copy failed"
                            description="Error shown after failing to copy a Live Collaboration room URL"
                            id="nb.liveCollaboration.urlCopyFailedShort"
                        />
                    )}
                    {props.copyStatus !== 'url' && props.copyStatus !== 'url-error' && (
                        <FormattedMessage
                            defaultMessage="Copy share link"
                            description="Button for copying a Live Collaboration room URL"
                            id="nb.liveCollaboration.copyUrl"
                        />
                    )}
                </button>
                <button
                    className={classNames(styles.buttonAlternate, styles.buttonFlex)}
                    id="copyID"
                    type="button"
                    onClick={props.onCopyID}
                >
                    {props.copyStatus === 'id' && (
                        <FormattedMessage
                            defaultMessage="Copied!"
                            description="Confirmation shown after copying a Live Collaboration room ID"
                            id="nb.liveCollaboration.idCopiedShort"
                        />
                    )}
                    {props.copyStatus === 'id-error' && (
                        <FormattedMessage
                            defaultMessage="Copy failed"
                            description="Error shown after failing to copy a Live Collaboration room ID"
                            id="nb.liveCollaboration.idCopyFailedShort"
                        />
                    )}
                    {props.copyStatus !== 'id' && props.copyStatus !== 'id-error' && (
                        <FormattedMessage
                            defaultMessage="Copy share code"
                            description="Button for copying a Live Collaboration room ID"
                            id="nb.liveCollaboration.copyId"
                        />
                    )}
                </button>
            </div>
        </Box>
    );

    const clientRoomControls = (
        <Box className={styles.row}>
            <button
                className={classNames(styles.button, styles.buttonFlex)}
                id="leaveRoom"
                type="button"
                onClick={props.onLeaveRoom}
            >
                <FormattedMessage
                    defaultMessage="Leave Room"
                    description="Button for leaving a Live Collaboration room"
                    id="nb.liveCollaboration.leaveRoom"
                />
            </button>
        </Box>
    );

    const connectedContent = (
        <React.Fragment>
            <Header>
                <FormattedMessage
                    defaultMessage="Room details"
                    description="Title for the room details section"
                    id="nb.liveCollaboration.roomDetails"
                />
            </Header>
            {props.isHost ? hostRoomControls : clientRoomControls}
            {userCards}
            {props.isHost && props.users.size >= 2 && !props.multiSelect && (
                <Box className={styles.multiSelectRow}>
                    <button
                        className={styles.multiSelectNormal}
                        type="button"
                        onClick={props.onToggleMultiSelect}
                    >
                        <FormattedMessage
                            defaultMessage="Select Multiple"
                            description="Button for selecting multiple collaboration participants"
                            id="nb.liveCollaboration.selectMultiple"
                        />
                    </button>
                </Box>
            )}
            {props.isHost && props.multiSelect && (
                <Box className={styles.multiSelectRow}>
                    <button
                        className={styles.multiSelectNormal}
                        type="button"
                        onClick={props.onToggleMultiSelect}
                    >
                        <FormattedMessage
                            defaultMessage="Cancel"
                            description="Button for cancelling participant selection"
                            id="nb.liveCollaboration.cancelSelection"
                        />
                    </button>
                    <button
                        className={styles.multiSelectKick}
                        disabled={props.selectedUsers.length === 0}
                        type="button"
                        onClick={props.onKickSelected}
                    >
                        <FormattedMessage
                            defaultMessage="Kick selected"
                            description="Button for removing selected collaboration participants"
                            id="nb.liveCollaboration.kickSelected"
                        />
                    </button>
                </Box>
            )}
        </React.Fragment>
    );

    return (
        <Modal
            className={styles.modalContent}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="liveCollaborationModal"
            onRequestClose={props.onClose}
        >
            <Box className={styles.body}>
                {props.connected ? connectedContent : disconnectedContent}
                <Box className={styles.warning}>
                    <p>
                        <FormattedMessage
                            defaultMessage="Anyone can choose any username, so impersonation is possible."
                            description="Live Collaboration username impersonation warning"
                            id="nb.liveCollaboration.usernameWarning"
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            defaultMessage={
                                'People you connect to may be able to see your IP address. ' +
                                'Only connect to people you trust.'
                            }
                            description="Live Collaboration peer-to-peer privacy warning"
                            id="nb.liveCollaboration.ipWarning"
                        />
                    </p>
                </Box>
            </Box>
        </Modal>
    );
};

LiveCollaborationModal.propTypes = {
    connected: PropTypes.bool.isRequired,
    connectionLocked: PropTypes.bool.isRequired,
    copyStatus: PropTypes.oneOf(['url', 'id', 'url-error', 'id-error']),
    input: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    isHost: PropTypes.bool.isRequired,
    multiSelect: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCloseRoom: PropTypes.func.isRequired,
    onCopyID: PropTypes.func.isRequired,
    onCopyURL: PropTypes.func.isRequired,
    onCreateRoom: PropTypes.func.isRequired,
    onInput: PropTypes.func.isRequired,
    onJoinRoom: PropTypes.func.isRequired,
    onKickSelected: PropTypes.func.isRequired,
    onKickUser: PropTypes.func.isRequired,
    onLeaveRoom: PropTypes.func.isRequired,
    onToggleMultiSelect: PropTypes.func.isRequired,
    onUserSelectionChange: PropTypes.func.isRequired,
    selectedUsers: PropTypes.arrayOf(PropTypes.string).isRequired,
    users: PropTypes.instanceOf(Map).isRequired
};

export default injectIntl(LiveCollaborationModal);
