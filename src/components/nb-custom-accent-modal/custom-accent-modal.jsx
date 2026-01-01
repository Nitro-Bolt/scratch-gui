import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './custom-accent-modal.css';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import FileInput from './file-input.jsx';
import {gradientDataToCSS} from '../../lib/nb-gradient-to-css.js';

const messages = defineMessages({
    title: {
        defaultMessage: 'Custom Accent Manager',
        description: 'Title of custom accent manager',
        id: 'nb.customAccent.title'
    }
});

const CustomAccentModal = props => {
    if (!localStorage.getItem('nb:custom-accents')) localStorage.setItem('nb:custom-accents', '[]');
    const [themes, setThemes] = useState(JSON.parse(localStorage.getItem('nb:custom-accents')));

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
                                <FormattedMessage
                                    defaultMessage={'You\'re editing an existing accent called "{name}"'}
                                    description="Label for name input"
                                    id="nb.customAccent.editingExisting"
                                    values={{
                                        name: props.name
                                    }}
                                /> :
                                <FormattedMessage
                                    defaultMessage={'A new accent will be created called "{name}"'}
                                    description="Label for name input"
                                    id="nb.customAccent.editingNew"
                                    values={{
                                        name: props.name
                                    }}
                                />
                            }
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
                                        backgroundImage: gradientDataToCSS(props.gradientColors,
                                            props.gradientDirection)
                                    }}
                                />
                                <label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={360}
                                        value={props.gradientDirection}
                                        onChange={props.onChangeGradientDirection}
                                    />
                                    <FormattedMessage
                                        defaultMessage="degrees"
                                        description="Label for degrees"
                                        id="nb.customAccent.headerGradientDegrees"
                                    />
                                </label>
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
                                            dir={props.isRtl ? 'rtl' : 'ltr'}
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
                                    <FormattedMessage
                                        defaultMessage="Add color"
                                        description="Label for button to add a color"
                                        id="nb.customAccent.headerGradientAddColor"
                                    />
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
                                        className={styles.downloadOption}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onClick={() => {
                                            const url = URL.createObjectURL(new Blob([JSON.stringify(value)], {
                                                type: 'application/json'
                                            }));
                                            const element = document.createElement('a');
                                            element.style.display = 'none';
                                            element.href = url;
                                            element.download = `${value.name}.json`;
                                            document.body.append(element);
                                            element.click();
                                            document.body.removeChild(element);
                                            URL.revokeObjectURL(url);
                                        }}
                                    />
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
                                            setThemes(JSON.parse(localStorage.getItem('nb:custom-accents')));
                                            try {
                                                const currentAccentJSON = JSON.parse(localStorage.getItem('tw:theme'));
                                                if (value.name === currentAccentJSON.accent.name) {
                                                    props.onSetThemeToDefault();
                                                }
                                            } catch (_) {
                                                // ignore
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        <FileInput
                            accept="application/json"
                            // eslint-disable-next-line react/jsx-no-bind
                            onChange={async files => {
                                let accentsJSON = JSON.parse(localStorage.getItem('nb:custom-accents'));
                                for (const file of files) {
                                    let isValid = true;
                                    let data;
                                    try {
                                        data = JSON.parse(await file.text());
                                    } catch {
                                        isValid = false;
                                    }
                                    // eslint-disable-next-line max-len
                                    if (isValid && !((data.gradient === null || (data.gradient && data.gradient.colors instanceof Array && ['number', 'string'].includes(typeof data.gradient.direction))) && typeof data.primaryColor === 'string' && typeof data.secondaryColor === 'string' && typeof data.tertiaryColor === 'string' && typeof data.name === 'string' && typeof data.isGradient === 'boolean')) isValid = false;
                                    if (!isValid) {
                                        // eslint-disable-next-line no-alert
                                        alert(`${file.name} is not a valid accent file.`);
                                        continue;
                                    }
                                    accentsJSON = accentsJSON.filter(value => value.name !== data.name);
                                    accentsJSON.push(data);
                                }
                                localStorage.setItem('nb:custom-accents', JSON.stringify(accentsJSON));
                                setThemes(accentsJSON);
                            }}
                        />
                    </Box>
                }
            </Box>
        </Modal>
    );
};

CustomAccentModal.propTypes = {
    gradientColors: PropTypes.array,
    gradientDirection: PropTypes.string,
    intl: intlShape,
    isGradient: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool,
    loadAccentIntoCreate: PropTypes.func.isRequired,
    name: PropTypes.string,
    onAddGradientColor: PropTypes.func.isRequired,
    onChangeGradient: PropTypes.func.isRequired,
    onChangeGradientColorColor: PropTypes.func.isRequired,
    onChangeGradientColorPosition: PropTypes.func.isRequired,
    onChangeGradientDirection: PropTypes.func.isRequired,
    onChangeName: PropTypes.func.isRequired,
    onChangePrimaryColor: PropTypes.func.isRequired,
    onChangeSecondaryColor: PropTypes.func.isRequired,
    onChangeTertiaryColor: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDeleteGradientColor: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    onSetThemeToDefault: PropTypes.func.isRequired,
    onSwitchToCreate: PropTypes.func.isRequired,
    onSwitchToManage: PropTypes.func.isRequired,
    primaryColor: PropTypes.string.isRequired,
    secondaryColor: PropTypes.string.isRequired,
    tab: PropTypes.string.isRequired,
    tertiaryColor: PropTypes.string.isRequired
};

export default injectIntl(CustomAccentModal);
