import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {FormattedMessage} from 'react-intl';

import styles from './monitor.css';
import {MultiGrid} from 'react-virtualized';
import {safeStringify} from '../../lib/tw-safe-stringify.js';

class TableMonitorScroller extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'cellRenderer',
            'noRowsRenderer',
            'handleEventFactory'
        ]);
    }
    getColumnCount () {
        if (!Array.isArray(this.props.values)) return 0;
        return this.props.values.reduce((maxColumns, row) => {
            if (Array.isArray(row)) {
                return Math.max(maxColumns, row.length);
            }
            return maxColumns;
        }, 0);
    }

    getCellValue (rowIndex, columnIndex) {
        if (!this.props.values[rowIndex] || !Array.isArray(this.props.values[rowIndex])) {
            return '';
        }
        return this.props.values[rowIndex][columnIndex];
    }

    handleEventFactory (rowIndex, colIndex) {
        return () => this.props.onActivate(rowIndex, colIndex);
    }
    noRowsRenderer () {
        return (
            <div className={classNames(styles.listRow, styles.listEmpty)}>
                <FormattedMessage
                    defaultMessage="(empty)"
                    description="Text shown on a table monitor when a table is empty"
                    id="gui.monitor.tableMonitor.empty"
                />
            </div>
        );
    }
    cellRenderer ({columnIndex, key, rowIndex, style}) {
        if (rowIndex === 0 && columnIndex === 0) {
            return (<div
                className={styles.tableColumnTag}
                key={key}
                style={style}
            />);
        }

        if (rowIndex === 0) {
            const isLastColumn = columnIndex === this.getColumnCount() + 1;
            if (isLastColumn) {
                return (
                    <div
                        className={styles.tableColumnTag}
                        key={key}
                        style={{
                            ...style,
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div
                            className={classNames(this.props.draggable ? styles.addButton : null, 'no-drag')}
                            style={{
                                cursor: this.props.draggable ? 'pointer' : 'default',
                                padding: '2px 6px',
                                display: 'inline-block'
                            }}
                            onClick={this.props.draggable ? this.props.onAddColumn : null}
                        >
                            {'+' /* TODO waiting on asset */}
                        </div>
                    </div>
                );
            }
            return (
                <div
                    className={styles.tableColumnTag}
                    key={key}
                    style={{
                        ...style,
                        textAlign: 'center'
                    }}
                >
                    {columnIndex}
                </div>
            );
        }

        if (columnIndex === 0) {
            return (
                <div
                    className={styles.listIndex}
                    key={key}
                    style={{
                        ...style,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {rowIndex}
                </div>
            );
        }

        // Skip rendering data for the + button column
        if (columnIndex === this.getColumnCount() + 1) {
            return (
                <div
                    key={key}
                    style={style}
                />
            );
        }

        const dataRowIndex = rowIndex - 1;
        const dataColumnIndex = columnIndex - 1;
        const cellValue = this.getCellValue(dataRowIndex, dataColumnIndex);
        const isActive = this.props.draggable &&
            this.props.activeRowIndex === dataRowIndex &&
            this.props.activeColIndex === dataColumnIndex;

        return (
            <div
                key={key}
                style={style}
            >
                <div
                    className={styles.tableValue}
                    dataindex={`${dataRowIndex}${dataColumnIndex}`}
                    style={{
                        background: this.props.categoryColor.background,
                        color: this.props.categoryColor.text
                    }}
                    onClick={this.props.draggable ? this.handleEventFactory(dataRowIndex, dataColumnIndex) : null}
                >
                    {isActive ? (
                        <div className={styles.inputWrapper}>
                            <input
                                autoFocus
                                autoComplete="false"
                                className={classNames(styles.listInput, 'no-drag')}
                                spellCheck="false"
                                style={{color: this.props.categoryColor.text}}
                                type="text"
                                value={this.props.activeValue}
                                onBlur={this.props.onDeactivate}
                                onChange={this.props.onInput}
                                onFocus={this.props.onFocus}
                                onKeyDown={this.props.onKeyPress}
                            />
                            <div
                                className={styles.removeButton}
                                onMouseDown={this.props.onRemove}
                            >
                                {'✖︎'}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.valueInner}>{safeStringify(cellValue)}</div>
                    )}
                </div>
            </div>
        );
    }
    render () {
        const {height, values, width, activeRowIndex, activeColIndex} = this.props;
        const rowCount = values.length;
        const columnCount = this.getColumnCount();

        // Always show the grid to enable the + buttons
        const bodyHeight = Math.max(0, height - 42);
        const scrollToRow = activeRowIndex === null ? -1 : activeRowIndex + 1;
        const scrollToColumn = activeColIndex === null ? -1 : activeColIndex + 1;
        const isEmpty = rowCount === 0 || columnCount === 0;

        return (
            <div style={{position: 'relative', width: '100%', height: bodyHeight}}>
                <MultiGrid
                    cellRenderer={this.cellRenderer}
                    columnCount={columnCount + 2}
                    columnWidth={({index}) => (index === 0 ? 32 : 78)}
                    fixedColumnCount={1}
                    fixedRowCount={1}
                    height={bodyHeight}
                    rowCount={rowCount + 1}
                    rowHeight={({index}) => (index === 0 ? 20 : 24)}
                    scrollToColumn={scrollToColumn}
                    scrollToRow={scrollToRow}
                    width={width}
                />
                {isEmpty && (
                    <div
                        className={classNames(styles.listRow, styles.listEmpty)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingTop: '4px'
                        }}
                    >
                        <FormattedMessage
                            defaultMessage="(empty)"
                            description="Text shown on a table monitor when a table is empty"
                            id="gui.monitor.tableMonitor.empty"
                        />
                    </div>
                )}
            </div>
        );
    }
}

TableMonitorScroller.propTypes = {
    activeRowIndex: PropTypes.number,
    activeColIndex: PropTypes.number,
    activeValue: PropTypes.string,
    categoryColor: PropTypes.shape({
        background: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    }).isRequired,
    draggable: PropTypes.bool,
    height: PropTypes.number,
    onActivate: PropTypes.func,
    onAddColumn: PropTypes.func,
    onDeactivate: PropTypes.func,
    onFocus: PropTypes.func,
    onInput: PropTypes.func,
    onKeyPress: PropTypes.func,
    onRemove: PropTypes.func,
    values: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        )
    ),
    width: PropTypes.number
};

TableMonitorScroller.defaultProps = {
    values: []
};

export default TableMonitorScroller;
