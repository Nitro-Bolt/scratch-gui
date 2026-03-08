import React from 'react';
import bindAll from 'lodash.bindall';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import VM from 'scratch-vm';
import VariableTab from '../components/variables-tab/variables-tab.jsx';
import PropTypes from 'prop-types';
import {highlightTarget} from '../reducers/targets';

class VariableManager extends React.Component {
    constructor (props) {
        super(props);

        bindAll(this, [
            'onHighlightTarget',
            'onInputChange',
            'onKeyDown',
            'onSubmitEditedVariable'
        ]);

        this.state = {
            editingVariable: {}
        };
    }

    onHighlightTarget (id) {
        this.props.dispatchHighlightTarget(id);
    }

    onInputChange (event, inputType, variable) {
        this.setState({
            editingVariable: {
                id: variable.id,
                type: inputType,
                value: event.target.value
            }
        });
    }

    onKeyDown (event, inputType, variable, optTargetId) {
        if (
            event.key === 'Enter' && (variable.type === '' || inputType === 'name' || event.shiftKey)
        ) this.onSubmitEditedVariable(event, variable, optTargetId);
    }

    onSubmitEditedVariable (event, variable, optTargetId) {
        event.preventDefault();
        const vm = this.props.vm;
        const workspace = Blockly.getMainWorkspace();

        const editingVariable = this.state.editingVariable;
        if (Object.keys(editingVariable).length === 0) return;

        const variableId = this.state.editingVariable.id;
        if (!variableId) return;
        if (variableId !== variable.id) return;

        const target = optTargetId ?
            vm.runtime.targets.find(t => t.id === optTargetId) :
            vm.runtime.targets.find(t => t.variables[variableId]);
        if (!target) return;

        switch (this.state.editingVariable.type) {
        // https://github.com/PenguinMod/penguinmod.github.io/blob/8feeec6ba93a3e1e5e4004c9354440c099c115fb/src/containers/variables-tab.jsx#L162
        case 'name': {
            let newName = editingVariable.value;
            if (!newName.trim()) break; // Check if it's empty

            const CLOUD_SYMBOL = '☁';
            const CLOUD_PREFIX = `${CLOUD_SYMBOL} `;
            if (variable.isCloud) {
                if (newName.startsWith(CLOUD_SYMBOL) && !newName.startsWith(CLOUD_PREFIX)) {
                    // There isn't a space between the cloud symbol and the name, so add one.
                    newName = `${newName.substring(0, 1)} ${newName.substring(1)}`;
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
            break;
        }
        case 'value': {
            const newValue = editingVariable.value;

            if (variable.type === 'list') {
                const makeSureNotEmpty = newValue === '' ? [] : newValue.split('\n');
                vm.setVariableValue(target.id, variableId, makeSureNotEmpty);
            } else {
                vm.setVariableValue(target.id, variableId, newValue);
            }
            break;
        }
        }

        this.setState({
            editingVariable: {}
        });

        event.target.blur();
    }

    render () {
        return (
            <VariableTab
                isRtl={this.props.isRtl}
                globalVariables={this.props.globalVariables}
                clones={this.props.localVariables}
                editingVariable={this.state.editingVariable}
                handleSpriteHighlighting={this.onHighlightTarget}
                handleInputChange={this.onInputChange}
                handleKeyDown={this.onKeyDown}
                handleSubmitEditedVariable={this.onSubmitEditedVariable}
                intl={this.props.intl}
                isStage={this.props.isStage}
            />
        );
    }
}

VariableManager.propTypes = {
    intl: intlShape,
    isRtl: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired,
    dispatchHighlightTarget: PropTypes.func,
    globalVariables: PropTypes.shape({
        [PropTypes.string]: PropTypes.shape({
            id: PropTypes.string,
            value: PropTypes.string
        })
    }),
    localVariables: PropTypes.shape([
        PropTypes.shape({
            id: PropTypes.string,
            variables: PropTypes.shape({
                [PropTypes.string]: PropTypes.shape({
                    id: PropTypes.string,
                    value: PropTypes.string
                })
            })
        })
    ]),
    isStage: PropTypes.bool

};

const mapStateToProps = ({locales, scratchGui}) => ({
    isRtl: locales.isRtl,
    isStage: scratchGui.vm.editingTarget.isStage,
    globalVariables: scratchGui.targets.stage.variables,
    localVariables: scratchGui.vm.editingTarget.sprite.clones.map(({id, variables}) => ({
        id: id,
        variables: variables
    }))

});

const mapDispatchToProps = dispatch => ({
    dispatchHighlightTarget: id => dispatch(highlightTarget(id))
});

export default errorBoundaryHOC('Variable Manager')(
    connect(mapStateToProps, mapDispatchToProps)(VariableManager)
);
