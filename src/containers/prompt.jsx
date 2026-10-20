import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import PromptComponent from '../components/prompt/prompt.jsx';
import VM from 'scratch-vm';
import {SCRATCH_MAX_CLOUD_VARIABLES} from '../lib/tw-cloud-limits.js';

class Prompt extends React.Component {
    constructor (props) {
        super(props);
        const variableOptions = props.variableOptions;
        bindAll(this, [
            'handleOk',
            'handleScopeOptionSelection',
            'handleCancel',
            'handleChange',
            'handleKeyPress',
            'handleTypeSelection',
            'handleColourSelection',
            'handleCloudVariableOptionChange'
        ]);
        this.state = {
            isAddingCloudVariableScratchSafe: (
                (variableOptions && variableOptions.isCloud) ||
                (props.vm &&
                    props.vm.runtime.getNumberOfCloudVariables() < SCRATCH_MAX_CLOUD_VARIABLES)
            ) || false,
            inputValue: props.defaultValue || '',
            globalSelected: variableOptions ? !variableOptions.isLocal : true,
            cloudSelected: variableOptions ? variableOptions.isCloud : false,
            valueType: variableOptions ? variableOptions.valueType : 'Any',
            colour: variableOptions ? variableOptions.colour : null,
            canAddCloudVariable: (variableOptions && variableOptions.isCloud) ||
                (props.vm && props.vm.runtime.canAddCloudVariable()) || false
        };
    }
    handleKeyPress (event) {
        if (event.key === 'Enter') this.handleOk();
    }
    handleFocus (event) {
        event.target.select();
    }
    handleOk () {
        this.props.onOk(this.state.inputValue, {
            scope: this.state.globalSelected ? 'global' : 'local',
            isCloud: this.state.cloudSelected,
            valueType: this.state.valueType,
            colour: this.state.colour
        });
    }
    handleCancel () {
        this.props.onCancel();
    }
    handleChange (e) {
        this.setState({inputValue: e.target.value});
    }
    handleScopeOptionSelection (e) {
        this.setState({globalSelected: (e.target.value === 'global')});
    }
    handleTypeSelection (e) {
        this.setState({valueType: e.target.value});
    }
    handleColourSelection (colour) {
        this.setState({colour});
    }
    handleCloudVariableOptionChange (e) {
        if (!this.props.showCloudOption) return;

        const checked = e.target.checked;
        this.setState({cloudSelected: checked});
        if (checked) {
            this.setState({globalSelected: true, valueType: 'Any'});
        }
    }
    render () {
        return (
            <PromptComponent
                isAddingCloudVariableScratchSafe={this.state.isAddingCloudVariableScratchSafe}
                canAddCloudVariable={this.state.canAddCloudVariable}
                cloudSelected={this.state.cloudSelected}
                defaultValue={this.props.defaultValue}
                globalSelected={this.state.globalSelected}
                valueType={this.state.valueType}
                colour={this.state.colour || '#FF8C1A'}
                customTypes={this.props.vm ? Array.from(this.props.vm.runtime.customTypes.keys()) : []}
                isStage={this.props.isStage}
                showListMessage={this.props.showListMessage}
                showTableMessage={this.props.showTableMessage}
                label={this.props.label}
                showCloudOption={this.props.showCloudOption}
                showTypeAndColourOptions={this.props.showTypeAndColourOptions}
                showVariableOptions={this.props.showVariableOptions}
                title={this.props.title}
                onCancel={this.handleCancel}
                onChange={this.handleChange}
                onCloudVarOptionChange={this.handleCloudVariableOptionChange}
                onFocus={this.handleFocus}
                onKeyPress={this.handleKeyPress}
                onOk={this.handleOk}
                onScopeOptionSelection={this.handleScopeOptionSelection}
                onTypeSelection={this.handleTypeSelection}
                onColourSelection={this.handleColourSelection}
            />
        );
    }
}

Prompt.propTypes = {
    defaultValue: PropTypes.string,
    isStage: PropTypes.bool.isRequired,
    showListMessage: PropTypes.bool.isRequired,
    showTableMessage: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    showCloudOption: PropTypes.bool.isRequired,
    showTypeAndColourOptions: PropTypes.bool.isRequired,
    showVariableOptions: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    variableOptions: PropTypes.shape({
        colour: PropTypes.string,
        isCloud: PropTypes.bool.isRequired,
        isLocal: PropTypes.bool.isRequired,
        valueType: PropTypes.string.isRequired
    }),
    vm: PropTypes.instanceOf(VM)
};

export default Prompt;
