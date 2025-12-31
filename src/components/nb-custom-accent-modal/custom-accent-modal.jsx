import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './custom-accent-modal.css';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';

const messages = defineMessages({
    title: {
        defaultMessage: 'Custom Accent Manager',
        description: 'Title of custom accent manager',
        id: 'nb.customAccent.title'
    }
});

const gradientColorsToCSS = (colors, direction) => {
    let buffer = `linear-gradient(${direction}deg`;
    for (const color of colors) {
        buffer += `, ${color.color} ${color.position}%`;
    }
    buffer += ')';
    return buffer;
};

const CustomAccentModal = props => {
    if (!localStorage.getItem('nb:custom-accents')) localStorage.setItem('nb:custom-accents', '[]');
    /**
     * @type {any[]}
     */
    let themes = JSON.parse(localStorage.getItem('nb:custom-accents'));

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="customAccentModal"
        >
            <Box className={styles.body}>
                <div className={styles.typeSelectorContainer}>
                    <div
                        className={styles.typeSelectorButton}
                        data-active={props.tab === 'create'}
                        onClick={props.onSwitchToCreate}
                        tabIndex={0}
                    >
                        <FormattedMessage
                            defaultMessage="Create/Edit"
                            description="Button to choose to create or edit a custom accent."
                            id="nb.customAccent.create"
                        />
                    </div>
                    <div
                        className={styles.typeSelectorButton}
                        data-active={props.tab === 'manage'}
                        onClick={props.onSwitchToManage}
                        tabIndex={0}
                    >
                        <FormattedMessage
                            defaultMessage="Manage"
                            description="Button to choose to manage custom accents."
                            id="nb.customAccent.manage"
                        />
                    </div>
                </div>
                {props.tab === 'create' ?
                    // Create tab
                    <Box>
                        <input
                            type="text"
                            className={styles.input}
                            value={props.name}
                            onChange={props.onChangeName}
                            placeholder="Name"
                            autoFocus
                        />
                        <p>
                            {themes.some(value => value.name === props.name) ?
                                <span>{'You\'re editing an existing accent'}</span> :
                                <span>{'A new accent will be created'}</span>
                            }{' called "'}{props.name}{'"'}
                        </p>
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
                        {props.isGradient && (
                            <Box
                                className={styles.cardBox}
                            >
                                <Box
                                    className={styles.card}
                                    style={{
                                        height: '3.5rem',
                                        backgroundImage: gradientColorsToCSS(props.gradientColors,
                                            props.gradientDirection)
                                    }}
                                />
                                {props.gradientColors.map((value, index) => (
                                    <Box
                                        className={styles.card}
                                        key={index}
                                    >
                                        <input
                                            style={{backgroundColor: value.color}}
                                            type="color"
                                            value={value.color}
                                            className={styles.colorPicker}
                                            // eslint-disable-next-line react/jsx-no-bind
                                            onChange={e => props.onChangeGradientColorColor(e, index)}
                                        />
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={value.position}
                                            // eslint-disable-next-line react/jsx-no-bind
                                            onChange={e => props.onChangeGradientColorPosition(e, index)}
                                        />
                                        <div
                                            style={{
                                                flexGrow: 1
                                            }}
                                        >
                                            <button
                                                className={styles.deleteOption}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onClick={() => props.onDeleteGradientColor(index)}
                                            />
                                        </div>
                                    </Box>
                                ))}
                                <button
                                    className={styles.button}
                                    onClick={props.onAddGradientColor}
                                >
                                    {'Add color'}
                                </button>
                            </Box>
                        )}
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
                    </Box> :
                    // Manage tab
                    <Box
                        className={styles.cardBox}
                    >
                        {themes.length === 0 && <p>
                            <FormattedMessage
                                defaultMessage="No custom accents to show"
                                description="Label to show no custom accents exist"
                                id="nb.customAccent.noAccents"
                            />
                        </p>}
                        {themes.sort((a, b) => a.name > b.name).map((value, index) => (
                            <div
                                className={styles.card}
                                key={index}
                            >
                                <div
                                    className={styles.name}
                                >{value.name}</div>
                                <div>
                                    <div
                                        className={styles.colorPreview}
                                        style={{
                                            backgroundColor: value.primaryColor
                                        }}
                                    />
                                    <div
                                        className={styles.colorPreview}
                                        style={{
                                            backgroundColor: value.secondaryColor
                                        }}
                                    />
                                    <div
                                        className={styles.colorPreview}
                                        style={{
                                            backgroundColor: value.tertiaryColor
                                        }}
                                    />
                                </div>
                                <div>
                                    <button
                                        className={styles.editOption}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onClick={() => {
                                            props.loadAccentIntoCreate(value);
                                            props.onSwitchToCreate();
                                        }}
                                    />
                                    <button
                                        className={styles.deleteOption}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onClick={() => {
                                            let accentsJSON = JSON.parse(localStorage.getItem('nb:custom-accents'));
                                            accentsJSON = accentsJSON.filter(v => v.name !== value.name);
                                            localStorage.setItem('nb:custom-accents', JSON.stringify(accentsJSON));
                                            themes = JSON.parse(localStorage.getItem('nb:custom-accents'));
                                            props.onSwitchToCreate();
                                            try {
                                                const currentAccentJSON = JSON.parse(localStorage.getItem('tw:theme'));
                                                if (value.name === currentAccentJSON.accent.name) {
                                                    props.setThemeToDefault();
                                                }
                                            } catch (_) {
                                                // ignore
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </Box>
                }
            </Box>
        </Modal>
    );
};

CustomAccentModal.propTypes = {
    gradientColors: PropTypes.array,
    gradientDirection: PropTypes.number,
    intl: intlShape,
    isGradient: PropTypes.bool.isRequired,
    loadAccentIntoCreate: PropTypes.func.isRequired,
    name: PropTypes.string,
    onAddGradientColor: PropTypes.func.isRequired,
    onChangeGradient: PropTypes.func.isRequired,
    onChangeGradientColorColor: PropTypes.func.isRequired,
    onChangeGradientColorPosition: PropTypes.func.isRequired,
    onChangeName: PropTypes.func.isRequired,
    onChangePrimaryColor: PropTypes.func.isRequired,
    onChangeSecondaryColor: PropTypes.func.isRequired,
    onChangeTertiaryColor: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDeleteGradientColor: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    onSwitchToCreate: PropTypes.func.isRequired,
    onSwitchToManage: PropTypes.func.isRequired,
    primaryColor: PropTypes.string.isRequired,
    secondaryColor: PropTypes.string.isRequired,
    setThemeToDefault: PropTypes.func.isRequired,
    tab: PropTypes.string.isRequired,
    tertiaryColor: PropTypes.string.isRequired
};

export default injectIntl(CustomAccentModal);
