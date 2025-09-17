import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import VM from 'scratch-vm';

import VariablesTabComponent from '../components/variables-tab/variables-tab.jsx';
import { connect } from 'react-redux';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';

import {
    activateTab,
    VARIABLES_TAB_INDEX
} from '../reducers/editor-tab';

class VariablesTab extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, [
            '_fullReload',
            '_quickReload',
            'fullReload',
            'quickReload',
            'handleShowLarge',
            'handleClickVariableName',
            'handleClickVariableValue',
            'handleEditVariableName',
            'handleEditVariableValue',
            'handleTypeVariableName',
            'handleTypeVariableValue',
            'wasSubmit',
        ]);
        this.state = {
            globalVariables: [],
            localVariables: [],

            globalMapping: [],
            localMapping: [],

            showLargeValue: {},

            editingVariableId: '',
            editingVariableInput: '',
            editingVariableEditName: '',
            editingVariableEditValue: '',
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.editingTarget !== this.props.editingTarget) {
            this.fullReload();
        }
    }
    
    componentDidMount() {
        this.props.vm.runtime.on('RUNTIME_STEP_START', this.quickReload);
        this.props.vm.runtime.on('PROJECT_LOADED', this.fullReload);
        this.props.vm.runtime.on('TOOLBOX_EXTENSIONS_NEED_UPDATE', this.fullReload);
        this.fullReload();
    }
    componentWillUnmount() {
        this.props.vm.runtime.off('RUNTIME_STEP_START', this.quickReload);
        this.props.vm.runtime.off('PROJECT_LOADED', this.fullReload);
        this.props.vm.runtime.off('TOOLBOX_EXTENSIONS_NEED_UPDATE', this.fullReload);
    }

    handleShowLarge(varId) {
        const newObj = this.state.showLargeValue;
        newObj[varId] = true;
        this.setState({
            showLargeValue: newObj
        });
    }

    _fullReload() {
        const vm = this.props.vm;
        const id = this.props.editingTarget;

        const editingTarget = vm.runtime.getTargetById(id);
        const stage = vm.runtime.getTargetForStage();
        if (!editingTarget) return;
        if (!stage) return;

        // TODO: Support custom variable types created by extensions.
        if (editingTarget.isStage) {
            this.setState({
                localVariables: [],
                localMapping: [],
            });
        } else {
            const variables = Object.values(editingTarget.variables)
                .filter((i) => i.type === "" || i.type === "list");
            this.setState({
                localVariables: variables,
                localMapping: structuredClone(variables),
            });
        }
        
        const globalVariables = Object.values(stage.variables)
            .filter((i) => i.type === "" || i.type === "list");
        this.setState({
            globalVariables: globalVariables,
            globalMapping: structuredClone(globalVariables),
        });
    }
    _quickReload() {
        // TODO: Lists are not properly accounted for.
        for (const prevVariable of this.state.localMapping) {
            const newVariable = this.state.localVariables.find(v => v.id === prevVariable.id);
            if (!newVariable) {
                return this.fullReload();
            }

            if (prevVariable.value !== newVariable.value || prevVariable.name !== newVariable.name) {
                return this.fullReload();
            }
        }
        for (const prevVariable of this.state.globalMapping) {
            const newVariable = this.state.globalVariables.find(v => v.id === prevVariable.id);
            if (!newVariable) {
                return this.fullReload();
            }

            if (prevVariable.value !== newVariable.value || prevVariable.name !== newVariable.name) {
                return this.fullReload();
            }
        }
    }
    fullReload(...args) {
        try {
            this._fullReload(...args);
        } catch (e) {
            console.log(e);
        }
    }
    quickReload(...args) {
        try {
            this._quickReload(...args);
        } catch (e) {
            console.log(e);
        }
    }

    wasSubmit(event) {
        if (event.type !== 'keydown') return false;
        if (event.target.nodeName !== 'INPUT') return false;
        return event.key === 'Enter';
    }
    handleClickVariableName(variable) {
        this.setState({
            editingVariableId: variable.id,
            editingVariableInput: 'name',
            editingVariableEditName: variable.name,
        });
    }
    handleClickVariableValue(variable) {
        this.setState({
            editingVariableId: variable.id,
            editingVariableInput: 'value',
            editingVariableEditValue: variable.type === 'list' ? variable.value.join('\n') : variable.value,
        });
    }
    handleEditVariableName(event, variable) {
        event.preventDefault();
        const vm = this.props.vm;
        const workspace = Blockly.getMainWorkspace();

        const variableId = this.state.editingVariableId;
        if (!variableId) return;
        if (variableId !== variable.id) return;
        
        const target = vm.runtime.targets.find(t => t.variables[variableId]);
        if (!target) return;

        let newName = this.state.editingVariableEditName;
        if (!newName.trim()) return;
        
        const CLOUD_SYMBOL = "☁";
        const CLOUD_PREFIX = CLOUD_SYMBOL + " ";
        if (variable.isCloud) {
            if (newName.startsWith(CLOUD_SYMBOL)) {
                if (!newName.startsWith(CLOUD_PREFIX)) {
                    // There isn't a space between the cloud symbol and the name, so add one.
                    newName = newName.substring(0, 1) + " " + newName.substring(1);
                }
            } else {
                newName = CLOUD_PREFIX + newName;
            }
        }
        let nameAlreadyUsed = false;
        if (target.isStage) {
            // Global variables must not conflict with any global variables or local variables in any sprite.
            const existingNames = vm.runtime.getAllVarNamesOfType(variable.type);
            nameAlreadyUsed = existingNames.includes(newName);
        } else {
            // Local variables must not conflict with any global variables or local variables in this sprite.
            nameAlreadyUsed = !!workspace.getVariable(newName, variable.type);
        }
        if (nameAlreadyUsed) return;

        workspace.renameVariableById(variable.id, newName);

        this.setState({
            editingVariableId: '',
            editingVariableInput: '',
        });

        this.fullReload();
        event.target.blur();
    }
    handleEditVariableValue(event, variable) {
        event.preventDefault();
        const vm = this.props.vm;
        
        const variableId = this.state.editingVariableId;
        if (!variableId) return;
        if (variableId !== variable.id) return;

        const target = vm.runtime.targets.find(t => t.variables[variableId]);
        if (!target) return;

        const newValue = this.state.editingVariableEditValue;

        if (variable.type === "list") {
            const makeSureNotEmpty = newValue === '' ? [] : newValue.split("\n")
            vm.setVariableValue(target.id, variableId, makeSureNotEmpty);
        } else {
            vm.setVariableValue(target.id, variableId, newValue);
        }
        
        this.setState({
            editingVariableId: '',
            editingVariableInput: '',
        });
        
        this.fullReload();
        event.target.blur();
    }
    handleTypeVariableName(event, variable) {
        const submitted = this.wasSubmit(event);
        if (submitted) return this.handleEditVariableName(event, variable);
        
        this.setState({
            editingVariableEditName: event.target.value
        });
    }
    handleTypeVariableValue(event, variable) {
        const submitted = this.wasSubmit(event);
        if (submitted) return this.handleEditVariableValue(event, variable);
        
        this.setState({
            editingVariableEditValue: event.target.value
        });
    }

    render() {
        return (<VariablesTabComponent
            {...this.props}
            globalVariables={this.state.globalVariables}
            localVariables={this.state.localVariables}
            showLargeValue={this.state.showLargeValue}
            onClickShowLarge={this.handleShowLarge}

            editingVariableId={this.state.editingVariableId}
            editingVariableInput={this.state.editingVariableInput}
            editingVariableEditName={this.state.editingVariableEditName}
            editingVariableEditValue={this.state.editingVariableEditValue}

            onClickVariableName={this.handleClickVariableName}
            onClickVariableValue={this.handleClickVariableValue}
            onEditVariableName={this.handleEditVariableName}
            onEditVariableValue={this.handleEditVariableValue}
            onTypeVariableName={this.handleTypeVariableName}
            onTypeVariableValue={this.handleTypeVariableValue}
        />);
    }
}

VariablesTab.propTypes = {
    editingTarget: PropTypes.string,
    sprites: PropTypes.any,
    intl: intlShape,
    isRtl: PropTypes.bool,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    editingTarget: state.scratchGui.targets.editingTarget,
    sprites: state.scratchGui.targets.sprites,
});

const mapDispatchToProps = dispatch => ({
    onActivateVariablesTab: () => dispatch(activateTab(VARIABLES_TAB_INDEX))
});

export default errorBoundaryHOC('Variables Tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(VariablesTab))
);