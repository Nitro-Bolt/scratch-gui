import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';
import {getEventXY} from '../lib/touch-utils';
import {getVariableValue, setVariableValue} from '../lib/variable-utils';
import TableMonitorComponent from '../components/monitor/table-monitor.jsx';
import {safeStringify} from '../lib/tw-safe-stringify.js';

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
            'handleResizeMouseDown',
            'handleAddRow',
            'handleAddColumn'
        ]);

        this.state = {
            activeRowIndex: null,
            activeColIndex: null,
            activeValue: null,
            inputDidChange: false,
            width: props.width || 200,
            height: props.height || 200
        };
    }

    getTableValue (rowIndex, colIndex) {
        const {value} = this.props;
        if (!Array.isArray(value) || !Array.isArray(value[rowIndex])) {
            return '';
        }
        return value[rowIndex][colIndex];
    }

    cloneTableValue (tableValue) {
        if (!Array.isArray(tableValue)) {
            return [];
        }
        return tableValue.map(row => (Array.isArray(row) ? row.slice() : []));
    }

    ensureTableCell (tableValue, rowIndex, colIndex) {
        while (tableValue.length <= rowIndex) {
            tableValue.push([]);
        }
        if (!Array.isArray(tableValue[rowIndex])) {
            tableValue[rowIndex] = [];
        }
        while (tableValue[rowIndex].length <= colIndex) {
            tableValue[rowIndex].push('');
        }
    }

    handleActivate (rowIndex, colIndex) {
        // Do nothing if activating the currently active item
        if (this.state.activeRowIndex === rowIndex && this.state.activeColIndex === colIndex) {
            return;
        }

        this.setState({
            activeRowIndex: rowIndex,
            activeColIndex: colIndex,
            activeValue: safeStringify(this.getTableValue(rowIndex, colIndex)),
            inputDidChange: false
        });
    }

    handleDeactivate () {
        // Submit any in-progress value edits on blur
        if (this.state.activeRowIndex !== null && this.state.activeColIndex !== null && this.state.inputDidChange) {
            const {vm, targetId, id: variableId} = this.props;
            const newTableValue = this.cloneTableValue(getVariableValue(vm, targetId, variableId));
            this.ensureTableCell(newTableValue, this.state.activeRowIndex, this.state.activeColIndex);
            newTableValue[this.state.activeRowIndex][this.state.activeColIndex] = this.state.activeValue;
            setVariableValue(vm, targetId, variableId, newTableValue);
        }
        this.setState({
            activeRowIndex: null,
            activeColIndex: null,
            activeValue: null,
            inputDidChange: false
        });
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
        const {value} = this.props;
        if (!Array.isArray(value)) return;
        const rowCount = value.length;
        const colCount = value.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);

        if (rowCount === 0 || colCount === 0) return;

        const {activeRowIndex: row, activeColIndex: col} = this.state;
        let nextRow = row;
        let nextCol = col;
        let navigate = false;

        switch (e.key) {
        case 'Tab':
            navigate = true;
            if (e.shiftKey) {
                nextCol -= 1;
                if (nextCol < 0) {
                    nextCol = colCount - 1;
                    nextRow = this.wrapTableIndex(nextRow - 1, rowCount);
                }
            } else {
                nextCol += 1;
                if (nextCol >= colCount) {
                    nextCol = 0;
                    nextRow = this.wrapTableIndex(nextRow + 1, rowCount);
                }
            }
            break;
        case 'ArrowUp':
            navigate = true;
            nextRow = this.wrapTableIndex(nextRow - 1, rowCount);
            break;
        case 'ArrowDown':
            navigate = true;
            nextRow = this.wrapTableIndex(nextRow + 1, rowCount);
            break;
        case 'ArrowLeft':
            navigate = true;
            nextCol = this.wrapTableIndex(nextCol - 1, colCount);
            break;
        case 'ArrowRight':
            navigate = true;
            nextCol = this.wrapTableIndex(nextCol + 1, colCount);
            break;
        case 'Enter':
            navigate = true;
            nextRow = this.wrapTableIndex(nextRow + (e.shiftKey ? -1 : 1), rowCount);
            break;
        default:
            break;
        }

        if (navigate) {
            this.handleDeactivate();
            this.setState({
                activeRowIndex: nextRow,
                activeColIndex: nextCol,
                activeValue: safeStringify(this.getTableValue(nextRow, nextCol)),
                inputDidChange: false
            });
            e.preventDefault();
        }
    }

    handleInput (e) {
        this.setState({
            activeValue: e.target.value,
            inputDidChange: true
        });
    }

    handleAddRow () {
        const {vm, targetId, id: variableId} = this.props;
        const currentValue = getVariableValue(vm, targetId, variableId);
        const newTableValue = this.cloneTableValue(currentValue);
        const columnCount = newTableValue.length > 0 && Array.isArray(newTableValue[0]) ?
            newTableValue[0].length :
            1;
        const newRow = Array(columnCount).fill('');
        newTableValue.push(newRow);
        setVariableValue(vm, targetId, variableId, newTableValue);
        this.setState({
            activeRowIndex: newTableValue.length - 1,
            activeColIndex: 0,
            activeValue: '',
            inputDidChange: false
        });
    }

    handleAddColumn () {
        const {vm, targetId, id: variableId} = this.props;
        const currentValue = getVariableValue(vm, targetId, variableId);
        const newTableValue = this.cloneTableValue(currentValue);
        if (newTableValue.length === 0) {
            newTableValue.push(['']);
        } else {
            for (let i = 0; i < newTableValue.length; i++) {
                if (Array.isArray(newTableValue[i])) {
                    newTableValue[i].push('');
                }
            }
        }
        setVariableValue(vm, targetId, variableId, newTableValue);
        this.setState({
            activeRowIndex: 0,
            activeColIndex: newTableValue[0].length - 1,
            activeValue: '',
            inputDidChange: false
        });
    }

    handleRemove (e) {
        e.preventDefault(); // Default would blur input, prevent that.
        e.stopPropagation(); // Bubbling would activate, which will be handled here
        const {vm, targetId, id: variableId} = this.props;
        const newTableValue = this.cloneTableValue(getVariableValue(vm, targetId, variableId));
        this.ensureTableCell(newTableValue, this.state.activeRowIndex, this.state.activeColIndex);
        newTableValue[this.state.activeRowIndex][this.state.activeColIndex] = '';
        setVariableValue(vm, targetId, variableId, newTableValue);
        this.setState({
            activeValue: '',
            inputDidChange: false
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
            this.props.vm.runtime.requestUpdateMonitor({
                id: this.props.id,
                height: this.state.height,
                width: this.state.width
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    wrapTableIndex (index, length) {
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
                onAddColumn={this.handleAddColumn}
                onAddRow={this.handleAddRow}
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
