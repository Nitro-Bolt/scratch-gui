import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './custom-accent-modal.css';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';

const messages = defineMessages({
    title: {
        defaultMessage: 'Choose Custom Accent',
        description: 'Title of custom accent menu',
        id: 'nb.customAccent.title'
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
            <div className={styles.optionsRow}>
                <div
                    className={styles.optionCard}
                >
                    <div className={styles.optionTitle}>
                        <FormattedMessage
                            defaultMessage="Primary"
                            description="Title for color picker"
                            id="nb.customAccent.primaryTitle"
                        />
                    </div>
                    <input
                        style={{backgroundColor: props.primaryColor}}
                        type="color"
                        value={props.primaryColor}
                        className={styles.colorPicker}
                        onChange={props.onChangePrimaryColor}
                    />
                    <p>
                        <FormattedMessage
                            defaultMessage="For most UI components"
                            description="Label for color picker"
                            id="nb.customAccent.primaryLabel"
                        />
                    </p>
                </div>
                <div
                    className={styles.optionCard}
                >
                    <div className={styles.optionTitle}>
                        <FormattedMessage
                            defaultMessage="Secondary"
                            description="Title for color picker"
                            id="nb.customAccent.secondaryTitle"
                        />
                    </div>
                    <input
                        style={{backgroundColor: props.secondaryColor}}
                        type="color"
                        value={props.secondaryColor}
                        className={styles.colorPicker}
                        onChange={props.onChangeSecondaryColor}
                    />
                    <p>
                        <FormattedMessage
                            defaultMessage="For less important menus"
                            description="Label for color picker"
                            id="nb.customAccent.secondaryLabel"
                        />
                    </p>
                </div>
                <div
                    className={styles.optionCard}
                >
                    <div className={styles.optionTitle}>
                        <FormattedMessage
                            defaultMessage="Tertiary"
                            description="Title for color picker"
                            id="nb.customAccent.tertiaryTitle"
                        />
                    </div>
                    <input
                        style={{backgroundColor: props.tertiaryColor}}
                        type="color"
                        value={props.tertiaryColor}
                        className={styles.colorPicker}
                        onChange={props.onChangeTertiaryColor}
                    />
                    <p>
                        <FormattedMessage
                            defaultMessage="For menus being hovered over"
                            description="Label for color picker"
                            id="nb.customAccent.tertiaryLabel"
                        />
                    </p>
                </div>
            </div>
            <p>
                <label>
                    <FancyCheckbox
                        checked={props.isGradient}
                        onChange={props.onChangeGradient}
                    />
                    <FormattedMessage
                        defaultMessage="Header gradient"
                        description="Message that appears in custom accent prompt"
                        id="nb.customAccent.headerGradient"
                    />
                </label>
            </p>
            <Box className={styles.buttonRow}>
                <button
                    className={styles.cancelButton}
                    onClick={props.onClose}
                >
                    <FormattedMessage
                        defaultMessage="Cancel"
                        description="Label for button to cancel custom procedure edits"
                        id="gui.customProcedures.cancel"
                    />
                </button>
                <button
                    className={styles.okButton}
                    onClick={props.onOk}
                >
                    <FormattedMessage
                        defaultMessage="OK"
                        description="Label for button to save new custom procedure"
                        id="gui.customProcedures.ok"
                    />
                </button>
            </Box>
        </Box>
    </Modal>
);

CustomAccentModal.propTypes = {
    intl: intlShape,
    isGradient: PropTypes.bool.isRequired,
    onChangeGradient: PropTypes.func.isRequired,
    onChangePrimaryColor: PropTypes.func.isRequired,
    onChangeSecondaryColor: PropTypes.func.isRequired,
    onChangeTertiaryColor: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    primaryColor: PropTypes.string.isRequired,
    secondaryColor: PropTypes.string.isRequired,
    tertiaryColor: PropTypes.string.isRequired
};

export default injectIntl(CustomAccentModal);
