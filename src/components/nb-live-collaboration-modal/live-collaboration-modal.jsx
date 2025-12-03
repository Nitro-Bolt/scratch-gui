/* eslint-disable indent */
import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import styles from './live-collaboration-modal.css';
import classNames from 'classnames';

const messages = defineMessages({
    title: {
        defaultMessage: 'Live Collaboration',
        description: 'Title of modal that appears when loading the Live Collaboration Panel',
        id: 'nb.liveCollaboration.title'
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
/**
 * @param {{
 * users: Map<string, string>,
 * isHost: boolean,
 * multiSelect: boolean,
 * input: string,
 * selectedUsers: Array<string>,
 * connected: boolean
 * }} props Props
 * @returns {void}
 */
const LiveCollaborationModal = props =>
    (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="liveCollaborationModal"
        >
            <Box className={styles.body}>
                {!props.connected ? (
                    <>
                        <Header>
                            <FormattedMessage
                                defaultMessage='Join a room'
                                description='Title for the join a room section'
                                id='nb.liveCollaboration.joinARoom'
                            />
                        </Header>
                        <Box className={styles.row}>
                            <input
                                className={styles.input}
                                onChange={props.onInput}
                                placeholder='Enter Room ID...'
                                type='string'
                                id='roomID'
                            />
                            <button
                                className={styles.button}
                                onClick={props.onJoinRoom}
                                disabled={props.input === '' || props.connectionLocked} // todo: check initialization
                                id='joinRoom'
                            >
                                Connect to Room
                            </button>
                        </Box>
                        <Header>
                            <FormattedMessage
                                defaultMessage='Create a room'
                                description='Title for the create a room section'
                                id='nb.liveCollaboration.createARoom'
                            />
                        </Header>
                        <Box className={styles.row}>
                            <button
                                className={classNames(styles.button, styles.buttonFlex)}
                                onClick={props.onCreateRoom}
                                id='createRoom'
                                disabled={props.connectionLocked}
                            >
                                Create a Room
                            </button>
                        </Box>
                    </>
                )
                :
                (
                    <>
                        <Header>
                            <FormattedMessage
                                defaultMessage='Room details'
                                description='Title for the room details section'
                                id='nb.liveCollaboration.roomDetails'
                            />
                        </Header>
                        {!props.isHost ? (
                            <Box className={styles.row}>
                                <button
                                    className={classNames(styles.button, styles.buttonFlex)}
                                    onClick={props.onLeaveRoom}
                                    id='leaveRoom'
                                >
                                    Leave Room
                                </button>
                            </Box>
                        )
                        :
                        (
                            <Box className={styles.roomDetails}>
                                <button
                                    className={classNames(styles.button, styles.fullWidthButton)}
                                    onClick={props.onCloseRoom}
                                    id='closeRoom'
                                >
                                    Close Room
                                </button>
                                <div className={styles.halfButtonRow}>
                                    <button
                                        className={classNames(styles.buttonAlternate, styles.buttonFlex)}
                                        onClick={props.onCopyURL}
                                        id='copyURL'
                                    >
                                        Copy share URL
                                    </button>
                                    <button
                                        className={classNames(styles.buttonAlternate, styles.buttonFlex)}
                                        onClick={props.onCopyID}
                                        id='closeID'
                                    >
                                        Copy share ID
                                    </button>
                                </div>
                            </Box>
                        )}
                        {Array.from(props.users.entries()).map(userEntry => {
                            const [peerId, username] = userEntry;
                            return (
                                <Box
                                    className={styles.userCard}
                                    key={peerId}
                                >
                                    <p>{username}</p>
                                    {props.isHost && (
                                        // eslint-disable-next-line no-negated-condition
                                        !props.multiSelect ? (
                                            <button
                                                className={styles.kickOption}
                                                onClick={() => props.kickUser(peerId)}
                                            />
                                        ) : (
                                            <FancyCheckbox
                                                className={styles.checkboxOption}
                                                onChange={props.updateUserList}
                                                value={peerId}
                                            />
                                        )
                                    )}
                                </Box>
                            )}
                        )}
                        <Box
                            className={styles.testButton}
                        >
                            <input
                                className={styles.input}
                                placeholder='Enter some text...'
                                onChange={props.onPacketInput}
                                value={props.packetInput}
                                type='string'
                                id='testPacketContent'
                            />
                            <button
                                className={classNames(styles.button, styles.fullWidthButton)}
                                id="sendTestPacket"
                                onClick={props.onPacketSend}
                            >Send to all peers</button>
                        </Box>
                        {props.isHost && (
                            (!(props.users.size < 2) && !props.multiSelect) && (
                                <Box className={styles.multiSelectRow}>
                                    <button
                                        className={styles.multiSelectNormal}
                                        onClick={props.changeMultiSelectState}
                                    >
                                        Select Multiple
                                    </button>
                                </Box>
                            ) || (
                                props.multiSelect && (
                                    <Box className={styles.multiSelectRow}>
                                        <button
                                            className={styles.multiSelectNormal}
                                            onClick={props.changeMultiSelectState}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className={styles.multiSelectKick}
                                            onClick={() => props.kickUsers(props.selectedUsers)}
                                        >
                                            Kick selected
                                        </button>
                                    </Box>
                                )
                            )
                        )}
                    </>
                )}
            </Box>
        </Modal>
    );

LiveCollaborationModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    isHost: PropTypes.bool,
    users: PropTypes.object,
    multiSelect: PropTypes.bool,
    input: PropTypes.string,
    changeMultiSelectState: PropTypes.func,
    selectedUsers: PropTypes.array,
    connected: PropTypes.bool,
    onInput: PropTypes.func,
    onPacketInput: PropTypes.func,
    onPacketSend: PropTypes.func,
    packetInput: PropTypes.string,
    onJoinRoom: PropTypes.func,
    onCreateRoom: PropTypes.func,
    onCopyURL: PropTypes.func,
    onCopyID: PropTypes.func,
    onLeaveRoom: PropTypes.func,
    onCloseRoom: PropTypes.func,
    kickUser: PropTypes.func,
    updateUserList: PropTypes.func,
    kickUsers: PropTypes.func,
    connectionLocked: PropTypes.bool
};

export default injectIntl(LiveCollaborationModal);
