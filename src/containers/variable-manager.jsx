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
            'setEditingVariable',
            'onHighlightTarget',
            'onSendBroadcast',
            'onKeyDown',
            'onSubmitEdit'
        ]);

        this.state = {
            editingVariable: {}
        };
    }

    setEditingVariable (inputType, varType, id, value) {
        this.setState({
            editingVariable: {
                inputType: inputType,
                varType: varType,
                id: id,
                value: value
            }
        });
    }

    onHighlightTarget (id) {
        this.props.dispatchHighlightTarget(id);
    }

    onSendBroadcast (event, id) {
        const broadcastVar = this.props.vm.runtime.getTargetForStage().lookupBroadcastMsg(id);
        if (broadcastVar) {
            const broadcastOption = broadcastVar.name;
            this.props.vm.runtime.startHats('event_whenbroadcastreceived', {
                BROADCAST_OPTION: broadcastOption
            });
        }
    }

    onKeyDown (event, optTargetId) {
        if (event.key === 'Enter' && !event.shiftKey) this.onSubmitEdit(event, optTargetId);
    }

    onSubmitEdit (event, optTargetId) {
        event.preventDefault();
        const vm = this.props.vm;
        const workspace = Blockly.getMainWorkspace();

        const editingVariable = this.state.editingVariable;
        if (Object.keys(editingVariable).length === 0) return;

        const variable = this.state.editingVariable;

        const target = optTargetId ?
            vm.runtime.targets.find(t => t.id === optTargetId) :
            vm.runtime.targets.find(t => t.variables[variable.id]);
        if (!target) return;

        switch (this.state.editingVariable.inputType) {
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
                const existingNames = vm.runtime.getAllVarNamesOfType(variable.varType);
                nameAlreadyUsed = existingNames.includes(newName);
            } else {
            // Local variables must not conflict with any global variables or local variables in this sprite.
                nameAlreadyUsed = !!workspace.getVariable(newName, variable.varType);
            }
            if (nameAlreadyUsed) return;

            workspace.renameVariableById(variable.id, newName);
            break;
        }
        case 'value': {
            const newValue = editingVariable.value;

            if (variable.varType === 'list') {
                const makeSureNotEmpty = newValue === '' ? [] : newValue.split('\n');
                vm.setVariableValue(target.id, variable.id, makeSureNotEmpty);
            } else if (variable.varType === 'table') {
                const makeSureNotEmpty = newValue === '' ? [] : newValue.split('\n').map(i => i.split(','));
                vm.setVariableValue(target.id, variable.id, makeSureNotEmpty);
            } else {
                vm.setVariableValue(target.id, variable.id, newValue);
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
                intl={this.props.intl}
                isStage={this.props.isStage}
                globalVariables={this.props.globalVariables}
                clones={this.props.clones}
                editingVariable={this.state.editingVariable}
                setEditingVariable={this.setEditingVariable}
                handleSpriteHighlighting={this.onHighlightTarget}
                handleSendBroadcast={this.onSendBroadcast}
                handleKeyDown={this.onKeyDown}
                handleSubmitEdit={this.onSubmitEdit}
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
    clones: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string, // Clone id
            variables: PropTypes.shape({
                name: PropTypes.string,
                id: PropTypes.string,
                value: PropTypes.any
            })
        })
    ),
    isStage: PropTypes.bool

};

const mapStateToProps = ({locales, scratchGui}) => ({
    isRtl: locales.isRtl,
    isStage: scratchGui.vm.editingTarget.isStage,
    globalVariables: structuredClone(scratchGui.targets.stage.variables),
    clones: scratchGui.vm.editingTarget.sprite.clones.map(({id, variables}) => ({id, variables}))
});

const mapDispatchToProps = dispatch => ({
    dispatchHighlightTarget: id => dispatch(highlightTarget(id))
});

export default errorBoundaryHOC('Variable Manager')(
    connect(mapStateToProps, mapDispatchToProps)(VariableManager)
);
