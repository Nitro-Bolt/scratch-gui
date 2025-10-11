import React from 'react';
import PropTypes from 'prop-types';
import styles from './variables-tab.css'
import expandCaret from './expand-caret.svg';
import collapseCaret from './collapse-caret.svg'
import classNames from 'classnames'

class VariableDropdown extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isCollapsed: true
    }
  }
  render() {
    return (
      <div 
        className={ styles.variableDropdown }
        style={ this.props.style }
      >
        <div 
          className={ styles.variableDropdownHeader }
          onClick={ () => { this.setState({isCollapsed: !this.state.isCollapsed}) } }
        >
          <img
            src={ this.state.isCollapsed ? expandCaret : collapseCaret }
            draggable={false}
            width={12}
            height={7.5}
          />
          { this.props.headerContent }
        </div>

        { this.state.isCollapsed ? '' :  
          <div className={ styles.variableDropdownBody } style={this.props.bodyStyle}>
              { this.props.bodyContent }
          </div>
        }
      </div>
    )
  }
};

VariableDropdown.propTypes = {
  style: PropTypes.any,
  onClick: PropTypes.func,
  isCollapsed: PropTypes.bool,
  headerContent: PropTypes.node,
  bodyContent: PropTypes.node,
  bodyStyle: PropTypes.any
};

export default VariableDropdown;
