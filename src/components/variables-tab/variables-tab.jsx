/* eslint-disable max-len */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import styles from './variables-tab.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {safeStringify} from '../../lib/tw-safe-stringify.js';
import RichDropdown from '../rich-dropdown/dropdown.jsx';

const messages = defineMessages({
    forThisSprite: {
        id: 'gui.variableManager.forThisSprite',
        description: 'Label for sprite-specific variables',
        defaultMessage: 'For this sprite '
    },
    forAllSprites: {
        id: 'gui.variableManager.forAllSprites',
        description: 'Label for global variables',
        defaultMessage: 'For all sprites '
    },
    noVariables: {
        id: 'gui.variableManager.noVariables',
        description: 'Label when there is no variables of any type',
        defaultMessage: 'No Variables'
    },
    original: {
        id: 'gui.variableManager.original',
        description: 'Label for the original sprite.',
        defaultMessage: 'Original'
    },
    clone: {
        id: 'gui.variableManager.clone',
        description:
            'Label for a clone followed by a space. Will be used like: "Clone 1", "Clone 2", etc...',
        defaultMessage: 'Clone '
    }
});

const Variables = ({
    intl,
    variables,
    editingVariable,
    setEditingVariable,
    onSubmitEdit,
    onKeyDown,
    optNameReadonly = false
}) => {
    const final = [];
    for (const id in variables) {
        const currentVar = variables[id];
        const isEditingCurrentVar = editingVariable.id === currentVar.id;

        const name = isEditingCurrentVar && editingVariable.inputType === 'name' ?
            editingVariable.value :
            currentVar.name;
        const value = isEditingCurrentVar && editingVariable.inputType === 'value' ?
            editingVariable.value :
            currentVar.value;

        const handleOnNameChange = event => {
            setEditingVariable('name', currentVar.type, id, event.target.value);
        };

        const handleOnValueChange = event => {
            setEditingVariable('value', currentVar.type, id, event.target.value);
        };

        switch (currentVar.type) {
        case 'list':
            final.push(
                <div key={id} className={classNames(styles.variableItem, styles.listItem)}>
                    <input
                        value={name}
                        onChange={handleOnNameChange}
                        onBlur={onSubmitEdit}
                        onKeyDown={onKeyDown}
                        readOnly={optNameReadonly}
                    />
                    <textarea
                        rows="5"
                        value={
                            Array.isArray(value) ? value.map(i => (safeStringify(i))).join('\n') : value
                        }
                        onChange={handleOnValueChange}
                        onBlur={onSubmitEdit}
                        onKeyDown={onKeyDown}
                    />
                </div>
            );
            break;
        case 'table':
            final.push(
                <div key={id} className={classNames(styles.variableItem, styles.listItem)}>
                    <input
                        value={name}
                        onChange={handleOnNameChange}
                        onBlur={onSubmitEdit}
                        onKeyDown={onKeyDown}
                        readOnly={optNameReadonly}
                    />
                    <textarea
                        rows="5"
                        value={
                            Array.isArray(value) ? value.map(i => i.join(',')).join('\n') : value
                        }
                        onChange={handleOnValueChange}
                        onBlur={onSubmitEdit}
                        onKeyDown={onKeyDown}
                    />
                </div>
            );
            break;
        default:
            final.push(
                <div
                    className={styles.variableItem}
                    key={id}
                >
                    <input
                        value={name}
                        onChange={handleOnNameChange}
                        onBlur={onSubmitEdit}
                        onKeyDown={onKeyDown}
                        readOnly={optNameReadonly}
                    />
                    <input
                        value={safeStringify(value)}
                        onChange={handleOnValueChange}
                        onBlur={onSubmitEdit}
                        onKeyDown={onKeyDown}
                    />
                </div>
            );
        }
    }

    if (final.length > 0) {
        return final;
    } return (
        <div className={styles.box}>{intl.formatMessage(messages.noVariables)}</div>
    );
};

Variables.propTypes = {
    intl: intlShape,
    variables: PropTypes.shape({
        [PropTypes.string]: PropTypes.shape({
            name: PropTypes.string,
            id: PropTypes.string,
            value: PropTypes.any
        })
    }),
    editingVariable: PropTypes.shape({
        inputType: PropTypes.oneOf(['name', 'value']),
        varType: PropTypes.string,
        id: PropTypes.string,
        value: PropTypes.string
    }),
    setEditingVariable: PropTypes.func,
    onKeyDown: PropTypes.func,
    onSubmitEdit: PropTypes.func,
    optNameReadonly: PropTypes.bool
};


const LocalVariables = ({isStage, label, clones, variables}) => (
    isStage ? '' : (
        <RichDropdown label={label}>
            <div className={styles.localVariablesSelector}>
                <div className={styles.clonesSelectorItemsWrapper}>
                    { clones }
                </div>
                <div className={styles.localVariablesList}>
                    { variables }
                </div>
            </div>
        </RichDropdown>
    )
);

const getSelectedClone = (clones, selectedClone, setSelectedClone) => {
    if (clones[selectedClone]) {
        return clones[selectedClone];
    }
    setSelectedClone(0);
    return clones[0];
};

const VariableTab = props => {
    const [selectedClone, setSelectedClone] = React.useState(0);
    const selectedCloneObject = getSelectedClone(props.clones, selectedClone, setSelectedClone);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <RichDropdown
                    label={props.intl.formatMessage(messages.forAllSprites)}
                >
                    <Variables
                        intl={props.intl}
                        variables={props.globalVariables}
                        editingVariable={props.editingVariable}
                        setEditingVariable={props.setEditingVariable}
                        onKeyDown={props.handleKeyDown}
                        onSubmitEdit={props.handleSubmitEdit}
                    />
                </RichDropdown>

                <LocalVariables
                    isStage={props.isStage}
                    label={props.intl.formatMessage(messages.forThisSprite)}
                    clones={props.clones.map(({id}, i) => (
                        <div
                            key={id}
                            className={classNames(styles.clonesSelectorItem, {
                                [styles.isSelected]: selectedClone === i
                            })}
                            onClick={() => {
                                props.handleSpriteHighlighting(id);
                                setSelectedClone(i);
                            }}
                        >
                            <span className={styles.variableName}>
                                {i === 0 ?
                                    props.intl.formatMessage(messages.original) :
                                    props.intl.formatMessage(messages.clone) + i}{' '}
                                <br />
                                <sub>{id}</sub>
                            </span>
                        </div>
                    ))}
                    variables={
                        <Variables
                            intl={props.intl}
                            variables={selectedCloneObject.variables}
                            editingVariable={props.editingVariable}
                            setEditingVariable={props.setEditingVariable}
                            onSubmitEdit={props.handleSubmitEdit}
                            onKeyDown={event => props.handleKeyDown(event, selectedCloneObject.id)}
                            optNameReadonly={props.clones.length > 1}
                        />
                    }
                />
            </div>
        </div>
    );
};

VariableTab.propTypes = {
    intl: intlShape,
    isStage: PropTypes.bool,
    globalVariables: PropTypes.shape({
        [PropTypes.string]: PropTypes.shape({
            name: PropTypes.string,
            id: PropTypes.string,
            value: PropTypes.any
        })
    }),
    clones: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string, // Clone id
            variables: PropTypes.shape({
                name: PropTypes.string,
                id: PropTypes.string,
                value: PropTypes.any
            })
        })
    ),
    editingVariable: PropTypes.shape({
        inputType: PropTypes.oneOf(['name', 'value']),
        varType: PropTypes.string,
        id: PropTypes.string,
        value: PropTypes.string
    }),
    handleSpriteHighlighting: PropTypes.func,
    setEditingVariable: PropTypes.func,
    handleKeyDown: PropTypes.func,
    handleSubmitEdit: PropTypes.func
};

export default injectIntl(VariableTab);
