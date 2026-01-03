/* eslint-disable max-len */
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './editor-settings-modal.css';
import Box from '../box/box.jsx';
import classNames from 'classnames';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import FileInput from './file-input.jsx';
import {gradientDataToCSS} from '../../lib/nb-gradient-to-css.js';
import AddonSettingsComponent from '../../addons/settings/settings.jsx';
import {onExportSettings} from '../../playground/addon-settings.jsx';

const messages = defineMessages({
    title: {
        defaultMessage: 'Editor Settings',
        description: 'Title of editor settings modal',
        id: 'nb.editorSettings.title'
    },
    accents: {
        id: 'nb.editorSettings.accentsSection',
        defaultMessage: 'Accents'
    },
    addons: {
        id: 'nb.editorSettings.addonsSection',
        defaultMessage: 'Addons'
    },
    git: {
        id: 'nb.editorSettings.gitSection',
        defaultMessage: 'Git'
    },
    shortcuts: {
        id: 'nb.editorSettings.shortcutsSection',
        defaultMessage: 'Shortcuts'
    }
});

const EditorSettingsModal = props => {
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);

    if (!localStorage.getItem('nb:custom-accents')) localStorage.setItem('nb:custom-accents', '[]');
    const [themes, setThemes] = useState(JSON.parse(localStorage.getItem('nb:custom-accents')));
    const [dirty, setDirty] = useState(false);

    let [bulkSelect, setBulkSelect] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState([]);

    const _setBulkSelect = setBulkSelect;
    setBulkSelect = value => {
        setSelectedThemes(Array(themes.length).fill(false));
        _setBulkSelect(value);
    };

    const sections = [
        {
            title: messages.accents,
            content: <Box>
                <h2>
                    <FormattedMessage
                        id="nb.customAccent.manageTitle"
                        defaultMessage="Manage"
                    />
                </h2>
                {themes.length === 0 && <p>
                    <FormattedMessage
                        defaultMessage="No custom accents to show"
                        description="Label to show no custom accents exist"
                        id="nb.customAccent.noAccents"
                    />
                </p>}
                <Box
                    className={styles.cardBox}
                >
                    {themes.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase()).map((value, index) => (
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
                                {bulkSelect ?
                                    <FancyCheckbox
                                        checked={selectedThemes[index]}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onChange={e => {
                                            const temp = [...selectedThemes];
                                            temp[index] = e.target.checked;
                                            setSelectedThemes(temp);
                                        }}
                                    /> :
                                    <>
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
                                    </>
                                }
                            </div>
                        </div>
                    ))}
                    {!bulkSelect &&
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
                                    const colorRegex = /^#[a-fA-F0-9]{6}$/;
                                    // eslint-disable-next-line max-len
                                    if (isValid && (data.gradient === null || (data.gradient && data.gradient.colors instanceof Array && !isNaN(parseFloat(data.gradient.direction)))) && typeof data.primaryColor === 'string' && typeof data.secondaryColor === 'string' && typeof data.tertiaryColor === 'string' && typeof data.name === 'string' && typeof data.isGradient === 'boolean' && data.primaryColor.match(colorRegex) && data.secondaryColor.match(colorRegex) && data.tertiaryColor.match(colorRegex)) {
                                        if (data.gradient !== null) {
                                            for (const color of data.gradient.colors) {
                                                const position = parseFloat(color.position);
                                                if (position > 100 || position < 0 || !color.color.match(colorRegex)) isValid = false;
                                            }
                                        }
                                    } else isValid = false;
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
                    }
                </Box>
                <Box className={styles.buttonRow}>
                    {themes.length > 1 && (bulkSelect ?
                        <>
                            <button
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick={() => setBulkSelect(false)}
                            >
                                <FormattedMessage
                                    defaultMessage="Cancel"
                                    description="Label for button to cancel"
                                    id="gui.customProcedures.cancelSelectMultiple"
                                />
                            </button>
                            {selectedThemes.every(v => v) ?
                                <button
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onClick={() => setSelectedThemes(Array(themes.length).fill(false))}
                                >
                                    <FormattedMessage
                                        defaultMessage="Select None"
                                        description="Label for button to select none"
                                        id="nb.customAccent.selectNone"
                                    />
                                </button> :
                                <button
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onClick={() => setSelectedThemes(Array(themes.length).fill(true))}
                                >
                                    <FormattedMessage
                                        defaultMessage="Select All"
                                        description="Label for button to select all"
                                        id="nb.customAccent.selectAll"
                                    />
                                </button>
                            }
                            <button
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick={() => {
                                    let accentsJSON = JSON.parse(localStorage.getItem('nb:custom-accents'));
                                    for (const i in selectedThemes) {
                                        if (!selectedThemes[i]) continue;
                                        const value = themes[i];
                                        accentsJSON = accentsJSON.filter(v => v.name !== value.name);
                                        try {
                                            const currentAccentJSON = JSON.parse(localStorage.getItem('tw:theme'));
                                            if (value.name === currentAccentJSON.accent.name) {
                                                props.onSetThemeToDefault();
                                            }
                                        } catch (_) {
                                            // ignore
                                        }
                                    }
                                    localStorage.setItem('nb:custom-accents', JSON.stringify(accentsJSON));
                                    setThemes(accentsJSON);
                                    setSelectedThemes(Array(accentsJSON.length).fill(false));
                                    setBulkSelect(false);
                                }}
                                className={styles.okButton}
                            >
                                <FormattedMessage
                                    defaultMessage="Delete"
                                    description="Label for button to delete"
                                    id="nb.customAccent.deleteMultiple"
                                />
                            </button>
                            <button
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick={() => {
                                    const accentsJSON = JSON.parse(localStorage.getItem('nb:custom-accents'));
                                    for (const i in selectedThemes) {
                                        if (!selectedThemes[i]) continue;
                                        const value = themes[i];
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
                                    }
                                    localStorage.setItem('nb:custom-accents', JSON.stringify(accentsJSON));
                                    setThemes(accentsJSON);
                                    setSelectedThemes(Array(accentsJSON.length).fill(false));
                                    setBulkSelect(false);
                                }}
                                className={styles.okButton}
                            >
                                <FormattedMessage
                                    defaultMessage="Export"
                                    description="Label for button to export"
                                    id="nb.customAccent.exportMultiple"
                                />
                            </button>
                        </> :
                        <button
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => setBulkSelect(true)}
                        >
                            <FormattedMessage
                                defaultMessage="Select Multiple"
                                description="Label for button to select multiple accents"
                                id="nb.customAccent.selectMultiple"
                            />
                        </button>
                    )}
                </Box>
                <h2>
                    <FormattedMessage
                        id="nb.customAccent.createOrEditTitle"
                        defaultMessage="Create/Edit"
                    />
                </h2>
                <input
                    type="text"
                    className={styles.input}
                    value={props.name}
                    onChange={props.onChangeName}
                    placeholder="Name"
                />
                <p>
                    {props.name.length > 0 && (themes.some(value => value.name === props.name) ?
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
                    )}
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
                                    props.gradientDirection),
                                border: 'none'
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
                        className={styles.okButton}
                        // eslint-disable-next-line react/jsx-no-bind
                        onClick={() => {
                            props.onOk();
                            setThemes(JSON.parse(localStorage.getItem('nb:custom-accents')));
                        }}
                    >
                        <FormattedMessage
                            defaultMessage="OK"
                            description="Label for button to save new custom procedure"
                            id="gui.customProcedures.ok"
                        />
                    </button>
                </Box>
            </Box>
        },
        {
            title: messages.addons,
            content: <Box>
                <AddonSettingsComponent
                    // eslint-disable-next-line react/jsx-no-bind
                    onDirty={d => setDirty(d)}
                    onExportSettings={onExportSettings}
                />
            </Box>,
            escaped: true
        },
        {
            title: messages.git,
            content: null
        },
        {
            title: messages.shortcuts,
            content: null
        }
    ];

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="editorSettingsModal"
        >
            <Box className={styles.body}>
                <div className={styles.topicList}>
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={classNames(styles.topicItem, {
                                [styles.active]: selectedSectionIndex === index
                            })}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => setSelectedSectionIndex(index)}
                        >
                            {section.icon &&
                                <img
                                    src={section.icon}
                                    width="20"
                                    height="20"
                                />
                            }
                            <FormattedMessage
                                {...section.title}
                            />
                        </div>
                    ))}
                    {dirty && (
                        <div
                            className={styles.topicItem}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => location.reload()}
                        >
                            <FormattedMessage
                                id="nb.editorSettings.dirty"
                                defaultMessage="Reload to apply settings"
                            />
                        </div>
                    )}
                </div>
                {sections[selectedSectionIndex].escaped ?
                    <div
                        className={classNames(
                            styles.content,
                            styles.escaped
                        )}
                    >
                        {sections[selectedSectionIndex].content}
                    </div> :
                    <div className={styles.content}>
                        <h1><FormattedMessage {...sections[selectedSectionIndex].title} /></h1>
                        {sections[selectedSectionIndex].content}
                    </div>
                }
            </Box>
        </Modal>
    );
};

EditorSettingsModal.propTypes = {
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
    primaryColor: PropTypes.string.isRequired,
    secondaryColor: PropTypes.string.isRequired,
    tertiaryColor: PropTypes.string.isRequired
};

export default injectIntl(EditorSettingsModal);
