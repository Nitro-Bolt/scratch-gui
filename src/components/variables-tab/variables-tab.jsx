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

class VariableTab extends React.Component {
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
              <tbody>{ this.renderGlobalVariable(Object.values(this.props.globalVariables)) }</tbody>
            </table>
          </div>

        </div>
      </div>
    )
  }
}

VariableTab.propTypes = {
  intl: intlShape,
  isRtl: PropTypes.bool,
  localVariables: PropTypes.shape({
    [PropTypes.string]: PropTypes.shape({
      [PropTypes.string]: PropTypes.object
    })
  }),
  globalVariables: PropTypes.shape({
    [PropTypes.string]: PropTypes.object
  })
}

export default injectIntl(VariableTab);