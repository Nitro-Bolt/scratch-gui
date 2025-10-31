import React from 'react';
import styles from './variables-tab.css'
import { defineMessages, injectIntl } from 'react-intl';
import dropdownCaret from './dropdown-caret.svg';
import classNames from 'classnames';

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
    description: 'Label for a clone followed by a space. Will be used like: "Clone 1", "Clone 2", etc...',
    defaultMessage: 'Clone '
  }
})

function _noVariablesItem(intl) {
  return (
    <div className={ styles.box }>
      { intl.formatMessage(messages.noVariables) }
    </div>
  )
}

function _isList(varr) {
  return varr.type === 'list';
}

function Variables({variables, intl}) {
  let final = []
  for (const id in variables) {
    const currentVar = variables[id]
    
    final.push(
      <tr key={id}>
        <td className={styles.variableName}>
          <input value={currentVar.name}/>
        </td>
        <td className={styles.variableValue}>
          <input value={_isList(currentVar) ? 'List not supported yet' : currentVar.value}/>
        </td>
      </tr>
    )
  }

  if (final.length > 0) return (
    <table>
      <tbody>{ final }</tbody>
    </table>
  )
  return _noVariablesItem(intl)
}

function LocalVariables({clones, handleSpriteHighlighting, intl}) {
  const [selectedClone, setSelectedClone] = React.useState(0)

  const variables = clones[selectedClone]?.variables
  return (
    <div className={styles.localVariablesSelector}>

      <div className={styles.clonesSelectorItemsWrapper}>
        { clones.map(({ id }, i) => (
          <div 
            className={classNames(styles.clonesSelectorItem, {
              [styles.isSelected]: selectedClone === i
            })}
            onClick={() => { 
              handleSpriteHighlighting(id)
              setSelectedClone(i)
            }}
          >
            <span className={styles.variableName}>
              { i === 0 ? intl.formatMessage(messages.original) : intl.formatMessage(messages.clone) +  i} <br/>
              <sub>{ '(' + id + ')' }</sub>
            </span>
          </div>
        )) }
      </div>

      {
        !variables || Object.keys(variables).length > 0
        ? <div className={styles.localVariablesList}>
            <Variables 
              variables={variables}
              intl={intl}
            />
          </div>
        : _noVariablesItem(intl)
      }

    </div>
  )
}

// The CSS to make the dropdown look good is beyond me
// Someone please please fix my CSS
function VariableDropdown({ label, style, children }) {
  //const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div 
      className={ styles.variableDropdown }
      style={ style }
    >
      <div 
        className={ styles.variableDropdownHeader }
        //onClick={ () => setIsCollapsed(isCollapsed => !isCollapsed) }
      >
        {/*<img
          src={dropdownCaret}
          draggable={false}
          width={8}
          height={5}
          style={{
            transform: `rotate(${isCollapsed ? -90 : 0}deg)`
          }}
        />*/}
        <span className={styles.variableDropdownHeaderLabel}>{ label }</span>
      </div>

      { //isCollapsed ? '' :  
        <div className={ styles.variableDropdownBody }>
            { children }
        </div>
      }

    </div>
  )
};

function VariableTab({
  intl,
  isRtl,
  globalVariables,
  clones,
  handleSpriteHighlighting,
  isStage
}) {

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <VariableDropdown 
          label={ intl.formatMessage(messages.forAllSprites) }
          style={{
            minHeight: `${isStage ? '100' : '30'}%`
          }}
        >
          <Variables 
            variables={globalVariables}
            intl={intl}
          />
        </VariableDropdown>
        
        {isStage ? '' : 
          <VariableDropdown 
            label={ intl.formatMessage(messages.forThisSprite) }
            style={{
              minHeight: '70%'
            }}
          >
            <LocalVariables
              clones={clones}
              handleSpriteHighlighting={handleSpriteHighlighting}
              intl={intl}
            />
          </VariableDropdown> 
        }
      </div>
    </div>
  )
}

export default injectIntl(VariableTab);