import React from 'react';
import bindAll from 'lodash.bindall';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import VM from 'scratch-vm';
import VariableManager from '../components/variable-manager/variable-manager.jsx';
import PropTypes from 'prop-types';

class VariableTab extends React.Component {
  constructor (props) {
    super(props);

    bindAll(this, [
      'clearLocalVariables',
      '_reload',
      'reload'
    ]);

    this.state = {
      localVariables: {},
      globalVariables: []
    }

    /*
    {
      localVariables: {
        [variableId]: {
          [cloneId]: Variable Object,
          ...
        },
        ...
      },

      globalVariable: {
        [variableId]: Variable Object,
        ...
      }
    }
    */

    console.log(this.props.vm)
    console.log(this.props.sprite)
  }

  componentDidMount() {
    this.props.vm.runtime.on('RUNTIME_STEP_START', this.reload);
    this.props.vm.runtime.on('PROJECT_LOADED', this.reload);
    this.props.vm.runtime.on('TOOLBOX_EXTENSIONS_NEED_UPDATE', this.reload);

    this.props.vm.runtime.on('PROJECT_RUN_START', this.clearLocalVariables);
    this.props.vm.runtime.on('PROJECT_RUN_STOP ', this.clearLocalVariables);

    this.reload()
  }

  componentWillUnmount() {
    this.props.vm.runtime.off('RUNTIME_STEP_START', this.reload);
    this.props.vm.runtime.off('PROJECT_LOADED', this.reload);
    this.props.vm.runtime.off('TOOLBOX_EXTENSIONS_NEED_UPDATE', this.reload);

    this.props.vm.runtime.off('PROJECT_RUN_START', this.clearLocalVariables);
    this.props.vm.runtime.off('PROJECT_RUN_STOP ', this.clearLocalVariables);
  }

  clearLocalVariables() {
    this.setState({
      localVariables: {}
    })
    this.reload()
  }

  _reload() {
    // reload local variables
    if (!this.props.sprite.clones[0].isStage) {
      let didStateChange = false
      let newVariableState = {}

      for (const key in this.props.sprite.clones[0].variables) {
        newVariableState[key] = {}

        for (let i = 0; i < this.props.sprite.clones.length; i++) {
          const newVariable = this.props.sprite.clones[i].variables[key]
          const oldVariable = this.state.localVariables[key]

          if (!oldVariable) {
            didStateChange = true
            newVariableState[key][this.props.sprite.clones[i].id] = structuredClone(newVariable)
            continue
          }

          console.log(newVariableState)
          if (oldVariable[this.props.sprite.clones[i].id].name !== newVariable.name || oldVariable[this.props.sprite.clones[i].id].value !== newVariable.value) {
            didStateChange = true
          }

          newVariableState[key][this.props.sprite.clones[i].id] = structuredClone(newVariable)
        }
      }

      if (didStateChange) {
        this.setState({
          localVariables: structuredClone(newVariableState)
        })
      }
    }

    // reload global variables
    const newVariables = Object.values(this.props.stage.variables)
    const oldVariables = this.state.globalVariables

    for (let i = 0; i < newVariables.length; i++) {
      const varToCheck = oldVariables.find(varr => varr.id === newVariables[i].id)
      
      if (!varToCheck) {
        return this.setState({
          globalVariables: structuredClone(newVariables)
        })
      }

      if (varToCheck.name !== newVariables[i].name || varToCheck.value !== newVariables[i].value) {
        return this.setState({
          globalVariables: structuredClone(newVariables)
        })
      }
    }
  }

  reload() {
    try {
        this._reload();
    } catch (e) {
        console.log(e);
    }
  }

  render () {
    return (
      <VariableManager
        localVariables={this.state.localVariables}
        globalVariables={this.state.globalVariables}
        isStage={this.props.sprite.isStage}
      />
    )
  }
}

VariableTab.propTypes = {
  intl: intlShape,
  isRtl: PropTypes.bool,
  targets: PropTypes.any,
  stage: PropTypes.any,
  vm: PropTypes.instanceOf(VM).isRequired,
  editingTarget: PropTypes.any
}

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    targets: state.scratchGui.targets,
    stage: state.scratchGui.targets.stage,
    sprite: state.scratchGui.vm.editingTarget.sprite,
    vm: state.scratchGui.vm,
});

export default errorBoundaryHOC('Variable Manager')(
  injectIntl(connect(
    mapStateToProps,
    //mapDispatchToProps
  )(VariableTab))
);