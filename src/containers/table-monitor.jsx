// This entire thing might need to be redone
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';
import {getEventXY} from '../lib/touch-utils';
import {getVariableValue, setVariableValue} from '../lib/variable-utils';
import TableMonitorComponent from '../components/monitor/table-monitor.jsx';
import {Map} from 'immutable';

class TableMonitor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleActivate',
            'handleDeactivate',
            'handleInput',
            'handleRemove',
            'handleKeyPress',
            'handleFocus',
            'handleResizeMouseDown'
        ]);

        this.state = {
            activeRowIndex: null,
            activeColIndex: null,
            activeValue: null,
            width: props.width || 200,
            height: props.height || 200
        };
    }

    handleActivate (rowIndex, colIndex) {
        // Do nothing if activating the currently active item
        if (this.state.activeRowIndex === rowIndex && this.state.activeColIndex === colIndex) {
            return;
        }

        this.setState({
            activeRowIndex: rowIndex,
            activeColIndex: colIndex,
            activeValue: this.props.value[rowIndex][colIndex]
        });
    }

    handleDeactivate () {
        // Submit any in-progress value edits on blur
        if (this.state.activeRowIndex !== null && this.state.activeColIndex !== null) {
            const {vm, targetId, id: variableId} = this.props;
            const newTableValue = getVariableValue(vm, targetId, variableId);
            newTableValue[this.state.activeRowIndex][this.state.activeColIndex] = this.state.activeValue;
            setVariableValue(vm, targetId, variableId, newTableValue);
            this.setState({activeRowIndex: null, activeColIndex: null, activeValue: null});
        }
    }

    handleFocus (e) {
        // Select all the text in the input when it is focused.
        e.target.select();
    }

    handleKeyPress (e) {
        // Special case for tab, arrow keys and enter.
        // Tab / shift+tab navigate down / up the list.
        // Arrow down / arrow up navigate down / up the list.
        // Enter / shift+enter insert new blank item below / above.
        const previouslyActiveRowIndex = this.state.activeRowIndex;
        const previouslyActiveColIndex = this.state.activeColIndex;
        const {vm, targetId, id: variableId} = this.props;

        let navigateDirection = 0;
        if (e.key === 'Tab') navigateDirection = e.shiftKey ? -1 : 1;
        else if (e.key === 'ArrowUp') navigateDirection = -1;
        else if (e.key === 'ArrowDown') navigateDirection = 1;
        if (navigateDirection) {
            this.handleDeactivate(); // Submit in-progress edits
            const newRowIndex = this.wrapListIndex(previouslyActiveRowIndex + navigateDirection, this.props.value.length);
            this.setState({
                activeRowIndex: newRowIndex,
                activeColIndex: previouslyActiveColIndex,
                activeValue: this.props.value[newRowIndex][previouslyActiveColIndex]
            });
            e.preventDefault(); // Stop default tab behavior, handled by this state change
        } else if (e.key === 'Enter') {
            this.handleDeactivate(); // Submit in-progress edits
            const newListItemValue = ''; // Enter adds a blank item
            const newValueOffset = e.shiftKey ? 0 : 1; // Shift-enter inserts above
            const listValue = getVariableValue(vm, targetId, variableId);
            const newListValue = listValue.slice(0, previouslyActiveRowIndex + newValueOffset)
                .concat([newListItemValue])
                .concat(listValue.slice(previouslyActiveRowIndex + newValueOffset));
            setVariableValue(vm, targetId, variableId, newListValue);
            const newRowIndex = this.wrapListIndex(previouslyActiveRowIndex + newValueOffset, newListValue.length);
            this.setState({
                activeRowIndex: newRowIndex,
                activeColIndex: previouslyActiveColIndex,
                activeValue: newListItemValue
            });
        }
    }

    handleInput (e) {
        this.setState({activeValue: e.target.value});
    }

    handleRemove (e) {
        e.preventDefault(); // Default would blur input, prevent that.
        e.stopPropagation(); // Bubbling would activate, which will be handled here
        const {vm, targetId, id: variableId} = this.props;
        const listValue = getVariableValue(vm, targetId, variableId);
        const newListValue = listValue.slice(0, this.state.activeRowIndex)
            .concat(listValue.slice(this.state.activeRowIndex + 1));
        setVariableValue(vm, targetId, variableId, newListValue);
        const newActiveRowIndex = Math.min(newListValue.length - 1, this.state.activeRowIndex);
        this.setState({
            activeRowIndex: newActiveRowIndex,
            activeColIndex: this.state.activeColIndex,
            activeValue: newListValue[newActiveRowIndex][this.state.activeColIndex]
        });
    }

    handleResizeMouseDown (e) {
        this.initialPosition = getEventXY(e);
        this.initialWidth = this.state.width;
        this.initialHeight = this.state.height;

        const onMouseMove = ev => {
            const newPosition = getEventXY(ev);
            const dx = newPosition.x - this.initialPosition.x;
            const dy = newPosition.y - this.initialPosition.y;
            this.setState({
                width: Math.max(Math.min(this.initialWidth + dx, this.props.customStageSize.width), 100),
                height: Math.max(Math.min(this.initialHeight + dy, this.props.customStageSize.height), 60)
            });
        };

        const onMouseUp = ev => {
            onMouseMove(ev); // Make sure width/height are up-to-date
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            this.props.vm.runtime.requestUpdateMonitor(Map({
                id: this.props.id,
                height: this.state.height,
                width: this.state.width
            }));
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

    }

    wrapListIndex (index, length) {
        return (index + length) % length;
    }

    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            ...props
        } = this.props;
        return (
            <TableMonitorComponent
                {...props}
                activeRowIndex={this.state.activeRowIndex}
                activeColIndex={this.state.activeColIndex}
                activeValue={this.state.activeValue}
                height={this.state.height}
                width={this.state.width}
                onActivate={this.handleActivate}
                onDeactivate={this.handleDeactivate}
                onFocus={this.handleFocus}
                onInput={this.handleInput}
                onKeyPress={this.handleKeyPress}
                onRemove={this.handleRemove}
                onResizeMouseDown={this.handleResizeMouseDown}
            />
        );
    }
}

TableMonitor.propTypes = {
    height: PropTypes.number,
    id: PropTypes.string,
    customStageSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    targetId: PropTypes.string,
    value: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
    ]))),
    vm: PropTypes.instanceOf(VM),
    width: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number
};

const mapStateToProps = state => ({
    customStageSize: state.scratchGui.customStageSize,
    vm: state.scratchGui.vm
});

export default connect(mapStateToProps)(TableMonitor);
