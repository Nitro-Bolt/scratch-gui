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
    description: 'Label when there is no variables of any type',
    defaultMessage: 'No Variables'
  }
})

class VariableTab extends React.Component {
  constructor (props) {
    super(props)
  }

  variableItem(data) { 
    return (
      <tr key={data.id}>
        <td className={styles.variableName}>
          <span>{data.name}</span>
        </td>
        <td className={styles.variableValue}>
          <span>{data.value}</span>
        </td>
      </tr>
    )
  }

  renderGlobalVariable() {
    const variables = Object.values(this.props.globalVariables).filter(varr => varr.type === '' )

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

  mapClonesInLocalVariables(clones) {
    let final = []
    for (const id in clones) {
      const clone = clones[id]
      
      final.push(
      <tr key={id}>
        <td className={styles.variableName}>
          <span>{this.props.editingTarget.id === id ? this.props.editingTarget.sprite.name : 'Clone ' + Object.keys(clones).indexOf(id)}</span>
        </td>
        <td className={styles.variableValue}>
          <span>{clone.value}</span>
        </td>
      </tr>)
    }
    return <table><tbody>
      { final }
    </tbody></table>
  }

  renderLocalVariable() {
    const variables = Object.values(this.props.editingTarget.variables)

    let final = []
    if (variables.length) { 
      for (let i = 0; i < variables.length; i++) {
        final.push(
          <tr key={variables[i].id}>
            <td className={styles.variableName}>
              <span>{variables[i].name}</span>
            </td>
            <td className={styles.variableValue}>
              { this.mapClonesInLocalVariables(this.props.localVariables[variables[i].id]) }
            </td>
          </tr>
        )
      }
      return final
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

          { this.props.editingTarget.isStage ? '' : <div className={styles.variableWrapper}>
            <h3>{ this.props.intl.formatMessage(messages.forThisSprite) }</h3>
            <table>
              <tbody> { this.renderLocalVariable() } </tbody>
            </table>
          </div> }

          <div className={styles.variableWrapper}>
            <h3>{ this.props.intl.formatMessage(messages.forAllSprites)}</h3>
            <table>
              <tbody>{ this.renderGlobalVariable() }</tbody>
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
  }),
  editingTarget: PropTypes.object,
}

export default injectIntl(VariableTab);