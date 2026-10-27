import classNames from 'classnames';
import {defineMessages, FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import FancyDropdown from '../nb-fancy-dropdown/dropdown.jsx';
import FancyColorPicker from '../nb-fancy-color-picker/color-picker.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';

import styles from './prompt.css';
import {SCRATCH_MAX_CLOUD_VARIABLES} from '../../lib/tw-cloud-limits.js';
import isScratchDesktop from '../../lib/isScratchDesktop.js';
import FancyTextInput from '../nb-fancy-text-input/text-input.jsx';


const messages = defineMessages({
    forAllSpritesMessage: {
        defaultMessage: 'For all sprites',
        description: 'Option message when creating a variable for making it available to all sprites',
        id: 'gui.gui.variableScopeOptionAllSprites'
    },
    forThisSpriteMessage: {
        defaultMessage: 'For this sprite only',
        description: 'Option message when creating a varaible for making it only available to the current sprite',
        id: 'gui.gui.variableScopeOptionSpriteOnly'
    },
    variableTypeMessage: {
        defaultMessage: 'Type:',
        description: 'Option message to define the type for a variable',
        id: 'gui.gui.variableTypeMessage'
    },
    variableColorMessage: {
        defaultMessage: 'Color:',
        description: 'Label for the color picker used when creating a variable',
        id: 'gui.gui.variableColorMessage'
    },
    cloudVarOptionMessage: {
        defaultMessage: 'Cloud variable (stored on server)',
        description: 'Option message when creating a variable for making it a cloud variable, a variable that is stored on the server', /* eslint-disable-line max-len */
        id: 'gui.gui.cloudVariableOption'
    },
    availableToAllSpritesMessage: {
        defaultMessage: 'This variable will be available to all sprites.',
        description: 'A message that displays in a variable modal when the stage is selected indicating ' +
            'that the variable being created will available to all sprites.',
        id: 'gui.gui.variablePromptAllSpritesMessage'
    },
    listAvailableToAllSpritesMessage: {
        defaultMessage: 'This list will be available to all sprites.',
        description: 'A message that displays in a list modal when the stage is selected indicating ' +
            'that the list being created will available to all sprites.',
        id: 'gui.gui.listPromptAllSpritesMessage'
    },
    tableAvailableToAllSpritesMessage: {
        defaultMessage: 'This table will be available to all sprites.',
        description: 'A message that displays in a table modal when the stage is selected indicating ' +
            'that the table being created will available to all sprites.',
        id: 'gui.gui.tablePromptAllSpritesMessage'
    }
});

const defaultTypes = ['Any', 'Boolean', 'Object', 'Array'];

const Packager = () => (
    <a
        href="https://packager.nitrobolt.org"
        target="_blank"
        rel="noopener noreferrer"
    >
        {/* Should not be translated */}
        {'NitroBolt Packager'}
    </a>
);

const PromptComponent = props => (
    <Modal
        className={styles.modalContent}
        contentLabel={props.title}
        onRequestClose={props.onCancel}
        id="promptModal"
    >
        <Box className={styles.body}>
            <Box className={styles.label}>
                {props.label}
            </Box>
            <Box className={styles.variableNameTextInput}>
                <FancyTextInput
                    autoFocus
                    defaultValue={props.defaultValue}
                    name={props.label}
                    onChange={props.onChange}
                    onFocus={props.onFocus}
                    onKeyPress={props.onKeyPress}
                />
            </Box>
            {props.showVariableOptions ?
                <div>
                    {props.showTypeAndColourOptions ? (
                        <Box className={styles.optionsRow}>
                            <label>
                                <FormattedMessage
                                    {...messages.variableTypeMessage}
                                />
                                <FancyDropdown
                                    className={styles.typeDropdown}
                                    disabled={props.cloudSelected}
                                    value={props.valueType}
                                    onChange={props.onTypeSelection}
                                >
                                    {defaultTypes.concat(props.customTypes).map(type => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </FancyDropdown>
                            </label>
                            <label className={styles.colorOptionLabel}>
                                <FormattedMessage
                                    {...messages.variableColorMessage}
                                />
                                <FancyColorPicker
                                    value={props.colour}
                                    showIcon={false}
                                    onChange={props.onColourSelection}
                                />
                            </label>
                        </Box>
                    ) : null}
                    {props.isStage && (props.showListMessage || props.showTableMessage) ?
                        <div className={styles.infoMessage}>
                            {props.showTableMessage ? (
                                <FormattedMessage
                                    {...messages.tableAvailableToAllSpritesMessage}
                                />
                            ) : (props.showListMessage ? (
                                <FormattedMessage
                                    {...messages.listAvailableToAllSpritesMessage}
                                />
                            ) : null)}
                        </div> :
                        <Box className={styles.scopeOption}>
                            <label>
                                <FancyCheckbox
                                    checked={props.globalSelected || props.cloudSelected || props.isStage}
                                    disabled={props.cloudSelected || props.isStage}
                                    onChange={props.onScopeOptionSelection}
                                />
                                <FormattedMessage
                                    {...messages.forAllSpritesMessage}
                                />
                            </label>
                        </Box>
                    }
                    {props.showCloudOption ?
                        <Box className={classNames(styles.cloudOption)}>
                            <label
                                className={classNames({[styles.disabledLabel]: !props.canAddCloudVariable})}
                            >
                                <FancyCheckbox
                                    checked={props.cloudSelected && props.canAddCloudVariable}
                                    disabled={!props.canAddCloudVariable}
                                    onChange={props.onCloudVarOptionChange}
                                />
                                <FormattedMessage
                                    {...messages.cloudVarOptionMessage}
                                />
                            </label>
                        </Box> : null}
                </div> : null}

            {props.cloudSelected && !props.isAddingCloudVariableScratchSafe && (
                <Box className={styles.infoMessage}>
                    <FormattedMessage
                        // eslint-disable-next-line max-len
                        defaultMessage="If you make this cloud variable, the project will exceed Scratch's limit of {number} variables, and some variables will not function if you upload the project to Scratch."
                        // eslint-disable-next-line max-len
                        description="Warning that appears when adding a new cloud variable will make it exceeded Scratch's cloud variable limit. number will be 10."
                        id="tw.scratchUnsafeCloud"
                        values={{
                            number: SCRATCH_MAX_CLOUD_VARIABLES
                        }}
                    />
                </Box>
            )}

            {props.cloudSelected && props.canAddCloudVariable && (
                <Box className={styles.infoMessage}>
                    {isScratchDesktop() ? (
                        <FormattedMessage
                            // eslint-disable-next-line max-len
                            defaultMessage="In the desktop app, cloud variables sync between all desktop app windows on this computer. Use the {packager} for them to sync with the cloud."
                            description="Appears when creating a cloud variable in the desktop app"
                            values={{
                                packager: <Packager />
                            }}
                            id="nb.desktopCloud"
                        />
                    ) : (
                        <FormattedMessage
                            defaultMessage="Although you can create cloud variables, they won't work until this project is {packaged}."
                            // eslint-disable-next-line max-len
                            description="Reminder that cloud variables will not work when the editor is open. {packaged} is replaced with a link to open the NitroBolt Packager with the word 'packaged'."
                            values={{
                                packaged: <a
                                    href="https://packager.nitrobolt.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                ><FormattedMessage
                                    defaultMessage="packaged"
                                    // eslint-disable-next-line max-len
                                    description="The link within the warning that cloud variables will not work with the editor open. 'Although you can create cloud variables, they won't work until this project is ____'."
                                    id="nb.cantUseCloud.packaged"
                                /></a>
                            }}
                            id="nb.cantUseCloud"
                        />
                    )}
                </Box>
            )}

            <Box className={styles.buttonRow}>
                <button
                    className={styles.cancelButton}
                    onClick={props.onCancel}
                >
                    <FormattedMessage
                        defaultMessage="Cancel"
                        description="Button in prompt for cancelling the dialog"
                        id="gui.prompt.cancel"
                    />
                </button>
                <button
                    className={styles.okButton}
                    onClick={props.onOk}
                >
                    <FormattedMessage
                        defaultMessage="OK"
                        description="Button in prompt for confirming the dialog"
                        id="gui.prompt.ok"
                    />
                </button>
            </Box>
        </Box>
    </Modal>
);

PromptComponent.propTypes = {
    customTypes: PropTypes.arrayOf(PropTypes.string),
    valueType: PropTypes.string,
    colour: PropTypes.string,
    isAddingCloudVariableScratchSafe: PropTypes.bool.isRequired,
    canAddCloudVariable: PropTypes.bool.isRequired,
    cloudSelected: PropTypes.bool.isRequired,
    defaultValue: PropTypes.string,
    globalSelected: PropTypes.bool.isRequired,
    isStage: PropTypes.bool.isRequired,
    showListMessage: PropTypes.bool.isRequired,
    showTableMessage: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onCloudVarOptionChange: PropTypes.func,
    onFocus: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    onScopeOptionSelection: PropTypes.func.isRequired,
    onTypeSelection: PropTypes.func,
    onColourSelection: PropTypes.func,
    showCloudOption: PropTypes.bool.isRequired,
    showTypeAndColourOptions: PropTypes.bool.isRequired,
    showVariableOptions: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired
};

PromptComponent.defaultProps = {
    customTypes: [],
    valueType: 'Any',
    colour: '#FF8C1A'
};

export default PromptComponent;
