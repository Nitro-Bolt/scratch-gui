import React from 'react';
import styles from './variables-tab.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import dropdownCaret from './dropdown-caret.svg';
import {safeStringify} from '../../lib/tw-safe-stringify.js';

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

const _dropdownCaretElement = isCollapsed => (
    <img
        src={dropdownCaret}
        draggable={false}
        width={8}
        height={5}
        style={{
            transform: `rotate(${isCollapsed ? -90 : 0}deg)`,
            filter: 'var(--filter-icon-black)'
        }}
    />
);

const Variables = ({
    variables, optCloneId, optNameReadonly = false, intl, editingVariable, handleInputChange, handleKeyDown, handleSubmitEditedVariable
}) => {
    const final = [];
    for (const id in variables) {
        const currentVar = variables[id];
        const isEditingCurrentVar = editingVariable.id === currentVar.id;

        const currentVarName = isEditingCurrentVar && editingVariable.type === 'name' ?
            editingVariable.value :
            currentVar.name;
        const currentVarValue = isEditingCurrentVar && editingVariable.type === 'value' ?
            editingVariable.value :
            currentVar.value;

        const valueHandlers = {
            onChange: e => handleInputChange(e, 'value', currentVar),
            onKeyDown: e => handleKeyDown(e, 'value', currentVar, optCloneId),
            onBlur: e => handleSubmitEditedVariable(e, currentVar, optCloneId)

        };

        const nameHandlers = {
            onChange: e => handleInputChange(e, 'name', currentVar),
            onKeyDown: e => handleKeyDown(e, 'name', currentVar, optCloneId),
            onBlur: e => handleSubmitEditedVariable(e, currentVar, optCloneId)

        };
        switch (currentVar.type) {
        case 'list':
            final.push(
                <div
                    key={id}
                    style={{
                        border: '1px solid var(--ui-black-transparent)',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        borderLeftWidth: '2px'
                    }}
                >
                    <div
                        className={styles.variableItem}
                        style={{
                            gridTemplateRows: 'auto auto',
                            gridTemplateColumns: 'auto'
                        }}
                    >
                        <input
                            value={currentVarName}
                            onChange={nameHandlers.onChange}
                            onKeyDown={nameHandlers.onKeyDown}
                            onBlur={nameHandlers.onBlur}
                            readOnly={optNameReadonly}
                        />
                        <textarea
                            rows="5"
                            value={
                                Array.isArray(currentVarValue) ? currentVarValue.map(i => (safeStringify(i))).join('\n') : currentVarValue
                            }
                            onChange={valueHandlers.onChange}
                            onKeyDown={valueHandlers.onKeyDown}
                            onBlur={valueHandlers.onBlur}
                        />
                    </div>
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
                        value={currentVarName}
                        onChange={nameHandlers.onChange}
                        onKeyDown={nameHandlers.onKeyDown}
                        onBlur={nameHandlers.onBlur}
                        readOnly={optNameReadonly}
                    />
                    <input
                        value={safeStringify(currentVarValue)}
                        onChange={valueHandlers.onChange}
                        onKeyDown={valueHandlers.onKeyDown}
                        onBlur={valueHandlers.onBlur}
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

const VariableDropdown = function ({label, children}) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div
            className={classNames(styles.variableDropdown, {
                [styles.variableDropdownCollapsed]: isCollapsed
            })}
        >
            <div
                className={styles.variableDropdownHeader}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {_dropdownCaretElement(isCollapsed)}
                <span>{label}</span>
            </div>
            {isCollapsed ? (
                ''
            ) : (
                <div className={styles.variableDropdownBody}>{children}</div>
            )}
        </div>
    );
};

const LocalVariables = ({isStage, label, clones, variables}) => (
    isStage ? '' : (
        <VariableDropdown label={label}>
            <div className={styles.localVariablesSelector}>
                <div className={styles.clonesSelectorItemsWrapper}>
                    { clones }
                </div>
                <div className={styles.localVariablesList}>
                    { variables }
                </div>
            </div>
        </VariableDropdown>
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
                <VariableDropdown
                    label={props.intl.formatMessage(messages.forAllSprites)}
                >
                    <Variables
                        variables={props.globalVariables}
                        intl={props.intl}
                        editingVariable={props.editingVariable}
                        handleInputChange={props.handleInputChange}
                        handleKeyDown={props.handleKeyDown}
                        handleSubmitEditedVariable={props.handleSubmitEditedVariable}
                    />
                </VariableDropdown>

                <LocalVariables
                    isStage={props.isStage}
                    label={props.intl.formatMessage(messages.forThisSprite)}
                    clones={props.clones.map(({id}, i) => (
                        <div
                            className={classNames(styles.clonesSelectorItem, {
                                [styles.isSelected]: selectedClone === i
                            })}
                            onClick={() => {
                                props.handleSpriteHighlighting(id);
                                setSelectedClone(i);
                            }}
                            key={id}
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
                            variables={selectedCloneObject.variables}
                            optCloneId={selectedCloneObject.id}
                            optNameReadonly={props.clones.length > 1}
                            intl={props.intl}
                            editingVariable={props.editingVariable}
                            handleInputChange={props.handleInputChange}
                            handleKeyDown={props.handleKeyDown}
                            handleSubmitEditedVariable={props.handleSubmitEditedVariable}
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
        id: PropTypes.string,
        type: PropTypes.oneOf(['name', 'value']),
        value: PropTypes.string
    }),
    handleSpriteHighlighting: PropTypes.func,
    handleInputChange: PropTypes.func,
    handleKeyDown: PropTypes.func,
    handleSubmitEditedVariable: PropTypes.func
};

export default injectIntl(VariableTab);
