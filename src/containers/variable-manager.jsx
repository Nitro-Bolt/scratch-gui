import React from 'react';
import bindAll from 'lodash.bindall';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import VM from 'scratch-vm';
import VariableTab from '../components/variables-tab/variables-tab.jsx';
import PropTypes from 'prop-types';

class VariableManager extends React.Component {
  constructor (props) {
    super(props);

    bindAll(this, [
      'clearLocalVariables',
      '_reload',
      'reload'
    ]);

    this.state = {
      localVariables: {},
      globalVariables: {}
    }

    /* State format
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
          const newVariable = Object.assign({}, this.props.sprite.clones[i].variables[key])
          const oldVariable = this.state.localVariables[key]

          if (!oldVariable) {
            didStateChange = true
            newVariableState[key][this.props.sprite.clones[i].id] = structuredClone(newVariable)
            continue
          }

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
      const varToCheck = oldVariables[newVariables[i].id]
      
      if (!varToCheck) {
        return this.setState({
          globalVariables: structuredClone(this.props.stage.variables)
        })
      }

      if (varToCheck.name !== newVariables[i].name || varToCheck.value !== newVariables[i].value) {
        return this.setState({
          globalVariables: structuredClone(this.props.stage.variables)
        })
      }
    }
  }

  reload() {
    try {
        this._reload();
    } catch (e) {
        console.error(e);
    }
  }

  render () {
    return (
      <VariableTab
        localVariables={this.state.localVariables}
        globalVariables={this.state.globalVariables}
        editingTarget={this.props.editingTarget}
        isRtl={this.props.isRtl}
      />
    )
  }
}

VariableManager.propTypes = {
  intl: intlShape,
  isRtl: PropTypes.bool,
  stage: PropTypes.shape({
    variables: PropTypes.object
  }),
  sprite: PropTypes.shape({
    clones: PropTypes.array.isRequired
  }),
  editingTarget: PropTypes.object,
  vm: PropTypes.instanceOf(VM).isRequired,
}

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    stage: state.scratchGui.targets.stage,
    sprite: state.scratchGui.vm.editingTarget.sprite,
    editingTarget: state.scratchGui.vm.editingTarget,
    vm: state.scratchGui.vm,
});

export default errorBoundaryHOC('Variable Manager')(
  injectIntl(connect(
    mapStateToProps,
    //mapDispatchToProps
  )(VariableManager))
);