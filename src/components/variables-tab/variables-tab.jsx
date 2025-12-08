/* eslint-disable require-jsdoc */
import React from 'react';
import styles from './variables-tab.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';

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

const _noVariablesItem = intl => (
    <div className={styles.box}>{intl.formatMessage(messages.noVariables)}</div>
);

const VariableDropdown = function ({label, style, children}) {
    return (
        <div
            className={styles.variableDropdown}
            style={style}
        >
            <div className={styles.variableDropdownHeader}>
                <span className={styles.variableDropdownHeaderLabel}>
                    {label}
                </span>
            </div>

            {<div className={styles.variableDropdownBody}>{children}</div>}
        </div>
    );
};


const variableItem = variable => (
    <tr key={variable.id}>
        <td className={styles.variableName}>
            <input value={variable.name} />
        </td>
        <td className={styles.variableValue}>
            <input
                value={variable.value}
            />
        </td>
    </tr>
);

const listItem = variable => (
    <tr key={variable.id}>
        <td
            colSpan={2}
            className={styles.variableName}
        >
            <input value={variable.name} />
            {variable.value.map((item, index) => (
                <div
                    className={styles.listItem}
                    key={index}
                >
                    <span> {index + 1}. </span>
                    <input
                        className={styles.variableValue}
                        value={item}
                    />
                </div>
            ))}
        </td>
    </tr>
);

/* eslint-disable react/prop-types */
const Variables = ({variables, intl}) => {
    const final = [];
    for (const id in variables) {
        const currentVar = variables[id];

        switch (currentVar.type) {
            case 'list':
                final.push(listItem(currentVar));
                break;
            default:
                final.push(variableItem(currentVar));
        }
    }

    if (final.length > 0) {
        return (
            <table>
                <tbody>{final}</tbody>
            </table>
        );
    }
    return _noVariablesItem(intl);
};

/**
 * @param {Array} param0 List of clones.
 * @param {Function} param1 Ran once when a clone is selected.
 * @returns {HTMLElement} Display of every variables in the selected clone.
 */
const LocalVariables = ({clones, onHighlightSprite, intl}) => {
    const [selectedClone, setSelectedClone] = React.useState(0);
    const variables = clones[selectedClone]?.variables;

    return (
        <div className={styles.localVariablesSelector}>
            <div className={styles.clonesSelectorItemsWrapper}>
                {clones.map(({id}, i) => (
                    <div
                        className={classNames(styles.clonesSelectorItem, {
                            [styles.isSelected]: selectedClone === i
                        })}
                        // eslint-disable-next-line react/jsx-no-bind
                        onClick={() => {
                            onHighlightSprite(id);
                            setSelectedClone(i);
                        }}
                        key={id}
                    >
                        <span className={styles.variableName}>
                            {i === 0 ?
                                intl.formatMessage(messages.original) :
                                intl.formatMessage(messages.clone) + i
                            }{' '}
                            <br />
                            <sub>{`(${id})`}</sub>
                        </span>
                    </div>
                ))}
            </div>

            {!variables || Object.keys(variables).length > 0 ? (
                <div className={styles.localVariablesList}>
                    <Variables
                        variables={variables}
                        intl={intl}
                    />
                </div>
            ) : (
                _noVariablesItem(intl)
            )}
        </div>
    );
};
/* eslint-enable react/prop-types */

const VariableTab = props => (
    <div className={styles.wrapper}>
        <div className={styles.container}>
            <VariableDropdown
                label={props.intl.formatMessage(messages.forAllSprites)}
                style={{
                    minHeight: `${props.isStage ? '100' : '30'}%`
                }}
            >
                <Variables
                    variables={props.globalVariables}
                    intl={props.intl}
                />
            </VariableDropdown>

            {props.isStage ? (
                ''
            ) : (
                <VariableDropdown
                    label={props.intl.formatMessage(messages.forThisSprite)}
                    style={{
                        minHeight: '70%'
                    }}
                >
                    <LocalVariables
                        clones={props.clones}
                        selectedClone={props.selectedClone}
                        onHighlightSprite={props.handleSpriteHighlighting}
                        intl={props.intl}
                    />
                </VariableDropdown>
            )}
        </div>
    </div>
);

VariableTab.propTypes = {
    intl: intlShape,
    isStage: PropTypes.bool,
    globalVariables: PropTypes.object,
    clones: PropTypes.array,
    selectedClone: PropTypes.number,
    handleSpriteHighlighting: PropTypes.func
};

export default injectIntl(VariableTab);
