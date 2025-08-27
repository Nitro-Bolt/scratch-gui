import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import styles from './custom-accent-modal.css';

/* eslint-disable react/no-multi-comp */

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    title: {
        defaultMessage: 'Custom Accent',
        description: 'Title of the custom accents modal',
        id: 'dm.customAccentModal.title'
    },
    help: {
        defaultMessage: 'Click for help',
        description: 'Hover text of help icon in the custom accents modal',
        id: 'dm.customAccentModal.help'
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

const CustomAccentModalComponent = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={(...args) => {
            props.onClose(...args)
        }}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="customAccentModal"
    >
        <Box className={styles.body}>
            <Header>
                Custom Accents (This is currently unfinished and being worked on.)
            </Header>
            <div className={styles.buttonStretchy}>
                Create new Accent
            </div>
            <div className={styles.label}>
                Saved Accents:
            </div>
            <div className={styles.divStretchy}>
                <div style={{
                    display: 'flex',
                    alignItems: 'middle',
                    gap: '8px'
                }}>
                    <div
                        className={styles.accentIconOuter}
                        style={{
                            backgroundColor: `#757575`
                        }}
                    />
                    <span style={{ lineHeight: '24px' }}>*Name*</span>
                </div>
            </div>
        </Box>
    </Modal>
)

CustomAccentModalComponent.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
};

export default injectIntl(CustomAccentModalComponent)