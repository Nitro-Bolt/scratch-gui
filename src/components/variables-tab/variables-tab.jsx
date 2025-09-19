import React from 'react';
import styles from './variables-tab.css'
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

const messages = defineMessages({
  forThisSprite: {
    id: 'gui.variableManager.forThisSprite',
    description: 'Label for sprite-specific variables',
    defaultMessage: 'For this sprite: '
  },
  forAllSprites: {
    id: 'gui.variableManager.forAllSprites',
    description: 'Label for global variables',
    defaultMessage: 'For all sprites: '
  },
  noVariables: {
    id: 'gui.variableManager.noVariables',
    description: 'Label when there is no variables of a type',
    defaultMessage: 'No Variables'
  }
})

class VariableManager extends React.Component {
  constructor (props) {
    super(props)
  }

  variableItem(variable) { 
    return (
      <tr key={variable.id}>
        <td className={styles.variableName}>
          <span>{variable.name}</span>
        </td>
        <td className={styles.variableValue}>
          <span>{variable.value}</span>
        </td>
      </tr>
    )
  }

  renderGlobalVariable(data) {
    const variables = data.filter(varr => varr.type === '' )

    if (variables.length) { 
      return variables.map(this.variableItem)
    } else {
      return <tr><td>
              <div style={{textAlign: 'center'}}>
                { this.props.intl.formatMessage(messages.noVariables) }
              </div>
            </td></tr>
    }
  }

  render () {
    const localVariables = Object.values(this.props.localVariables)
    const clonesVariables = this.props.clonesVariables
    const globalVariables = Object.values(this.props.globalVariables)

    return (
      <div className={styles.editorWrapper}>
        <div className={styles.editorContainer}>

          { /*this.props.isStage ? ' ' : <div className={styles.variableWrapper}>
            <h3>{ this.props.intl.formatMessage(messages.forThisSprite) }</h3>
            <table>
              <tbody> { this.renderLocalVariable(localVariables, clonesVariables) } </tbody>
            </table>
          </div> */ }

          <div className={styles.variableWrapper}>
            <h3>{ this.props.intl.formatMessage(messages.forAllSprites)}</h3>
            <table>
              <tbody>{ this.renderGlobalVariable(globalVariables) }</tbody>
            </table>
          </div>

        </div>
      </div>
    )
  }
}

VariableManager.propTypes = {
  intl: intlShape,
  isRtl: PropTypes.bool,
  localVariables: PropTypes.any,
  globalVariables: PropTypes.any
}

export default injectIntl(VariableManager);