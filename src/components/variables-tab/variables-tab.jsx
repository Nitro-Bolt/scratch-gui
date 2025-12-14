/* eslint-disable require-jsdoc */
import React from 'react';
import styles from './variables-tab.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import dropdownCaret from './dropdown-caret.svg';

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
            transform: `rotate(${isCollapsed ? -90 : 0}deg)`
        }}
    />
);

/* eslint-disable react/prop-types */
const Variables = ({variables, intl, onNameChange}) => {
    const final = [];
    for (const id in variables) {
        const currentVar = variables[id];

        switch (currentVar.type) {
        case 'list':
            final.push(
                <div
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
                            value={currentVar.name}
                            onChange={e => onNameChange(e, currentVar)}
                        />
                        <textarea
                            rows="5"
                            value={currentVar.value.join('\n')}
                        />
                    </div>
                </div>
            );
            break;
        default:
            final.push(
                <div className={styles.variableItem}>
                    <input
                        value={currentVar.name}
                        onChange={e => onNameChange(e, currentVar)}
                    />
                    <input value={currentVar.value} />
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
                // eslint-disable-next-line react/jsx-no-bind
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
/* eslint-enable react/prop-types */

const VariableTab = props => {
    const [selectedClone, setSelectedClone] = React.useState(0);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <VariableDropdown
                    label={props.intl.formatMessage(messages.forAllSprites)}
                >
                    <Variables
                        variables={props.globalVariables}
                        intl={props.intl}
                        onNameChange={props.onNameChange}
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
                            // eslint-disable-next-line react/jsx-no-bind
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
                            variables={props.clones[selectedClone].variables}
                            intl={props.intl}
                            onNameChange={props.onNameChange}
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
    globalVariables: PropTypes.object,
    clones: PropTypes.array,
    handleSpriteHighlighting: PropTypes.func,
    onNameChange: PropTypes.func
};

export default injectIntl(VariableTab);
