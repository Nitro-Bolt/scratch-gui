import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import booleanInputIcon from './icon--boolean-input.svg';
import objectInputIcon from './icon--object-input.svg';
import arrayInputIcon from './icon--array-input.svg';
import textInputIcon from './icon--text-input.svg';
import labelIcon from './icon--label.svg';

import styles from './custom-procedures.css';

const messages = defineMessages({
    myblockModalTitle: {
        defaultMessage: 'Make a Block',
        description: 'Title for the modal where you create a custom block.',
        id: 'gui.customProcedures.myblockModalTitle'
    }
});

const CustomProcedures = props => {
    const [inputIcon, setInputIcon] = useState(textInputIcon);
    useEffect(() => {
        switch (props.menuOption) {
        case 'stringornumber': // To be split up as string and number types on a later date
            setInputIcon(textInputIcon);
            break;
        case 'boolean':
            setInputIcon(booleanInputIcon);
            break;
        case 'object':
            setInputIcon(objectInputIcon);
            break;
        case 'array':
            setInputIcon(arrayInputIcon);
            break;
        }
    }, [props.menuOption]);

    return (
        <Modal
            className={styles.modalContent}
            contentLabel={props.intl.formatMessage(messages.myblockModalTitle)}
            onRequestClose={props.onCancel}
            id="customProceduresModal"
        >
            <Box
                className={styles.workspace}
                componentRef={props.componentRef}
            />
            <Box className={styles.body}>
                <div className={styles.optionsRow}>
                    <div
                        className={styles.optionCard}
                        role="button"
                        tabIndex="0"
                        onClick={props.onAddInput}
                    >
                        <img
                            className={styles.optionIcon}
                            src={inputIcon}
                            draggable={false}
                        />
                        <div className={styles.optionTitle}>
                            <FormattedMessage
                                defaultMessage="Add an input"
                                description="Label for button to add a input"
                                id="gui.customProcedures.addAnInput"
                            />
                        </div>
                        <select
                            className={styles.optionMenu}
                            onClick={props.handlePropagation}
                            onChange={props.handleInputMenuChange}
                        >
                            <option value="stringornumber">number or text</option>
                            <option value="boolean">boolean</option>
                            <option value="object">object</option>
                            <option value="array">array</option>
                        </select>
                    </div>
                    <div
                        className={styles.optionCard}
                        role="button"
                        tabIndex="0"
                        onClick={props.onAddLabel}
                    >
                        <img
                            className={styles.optionIcon}
                            src={labelIcon}
                            draggable={false}
                        />
                        <div className={styles.optionTitle}>
                            <FormattedMessage
                                defaultMessage="Add a label"
                                description="Label for button to add a label"
                                id="gui.customProcedures.addALabel"
                            />
                        </div>
                    </div>
                </div>
                <br />
                <div className={styles.sectionTitle}>
                    <FormattedMessage
                        defaultMessage="Select a color"
                        description="Label for row of color options"
                        id="gui.customProcedures.selectAColorText"
                    />
                </div>
                <Box className={styles.colorRow}>
                    <span
                        style={{backgroundColor: '#FF6680'}}
                        className={styles.colorOption}
                        role="button"
                        color="#FF6680"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#4C97FF'}}
                        className={styles.colorOption}
                        role="button"
                        color="#4C97FF"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#9966FF'}}
                        className={styles.colorOption}
                        role="button"
                        color="#9966FF"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#CF63CF'}}
                        className={styles.colorOption}
                        role="button"
                        color="#CF63CF"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#FFBF00'}}
                        className={styles.colorOption}
                        role="button"
                        color="#FFBF00"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#FFAB19'}}
                        className={styles.colorOption}
                        role="button"
                        color="#FFAB19"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#5CB1D6'}}
                        className={styles.colorOption}
                        role="button"
                        color="#5CB1D6"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#59C059'}}
                        className={styles.colorOption}
                        role="button"
                        color="#59C059"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#FF8C1A'}}
                        className={styles.colorOption}
                        role="button"
                        color="#FF8C1A"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#FF661A'}}
                        className={styles.colorOption}
                        role="button"
                        color="#FF661A"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#5755D4'}}
                        className={styles.colorOption}
                        role="button"
                        color="#5755D4"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <span
                        style={{backgroundColor: '#E4DB8C'}}
                        className={styles.colorOption}
                        role="button"
                        color="#E4DB8C"
                        draggable={false}
                        onClick={props.setColor}
                    />
                    <input
                        style={{backgroundColor: props.colour}}
                        type="color"
                        value={props.colour}
                        className={styles.colorPicker}
                        onChange={props.setColor}
                    />
                </Box>
                <div className={styles.checkboxRow}>
                    <label>
                        <FancyCheckbox
                            checked={props.warp}
                            onChange={props.onToggleWarp}
                        />
                        <FormattedMessage
                            defaultMessage="Run without screen refresh"
                            description="Label for checkbox to run without screen refresh"
                            id="gui.customProcedures.runWithoutScreenRefresh"
                        />
                    </label>
                </div>
                <Box className={styles.buttonRow}>
                    <button
                        className={styles.cancelButton}
                        onClick={props.onCancel}
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
};

CustomProcedures.propTypes = {
    componentRef: PropTypes.func.isRequired,
    intl: intlShape,
    onAddInput: PropTypes.func.isRequired,
    onAddLabel: PropTypes.func.isRequired,
    handlePropagation: PropTypes.func.isRequired,
    handleInputMenuChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    onToggleWarp: PropTypes.func.isRequired,
    warp: PropTypes.bool.isRequired
};

export default injectIntl(CustomProcedures);
