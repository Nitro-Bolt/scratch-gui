import {defineMessages, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './custom-accent-modal.css';
import Box from '../box/box.jsx';

const messages = defineMessages({
    title: {
        defaultMessage: 'Choose Custom Accent',
        description: 'Title of custom accent menu',
        id: 'tw.customAccent.title'
    }
});

const CustomAccentModal = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="customAccentModal"
    >
        <Box className={styles.body}>
            <p>{'test modal'}</p>
        </Box>
    </Modal>
);

CustomAccentModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired
};

export default injectIntl(CustomAccentModal);
