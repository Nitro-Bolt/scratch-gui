// This entire thing might need to be redone
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import {FormattedMessage} from 'react-intl';

import styles from './monitor.css';
import {Table} from 'react-virtualized';

class TableMonitorScroller extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'rowRenderer',
            'noRowsRenderer',
            'handleEventFactory'
        ]);
    }
    handleEventFactory (rowIndex, colIndex) {
        return () => this.props.onActivate(rowIndex, colIndex);
    }
    noRowsRenderer () {
        return (
            <div className={classNames(styles.tableRow, styles.listEmpty)}>
                <FormattedMessage
                    defaultMessage="(empty)"
                    description="Text shown on a table monitor when a table is empty"
                    id="gui.monitor.tableMonitor.empty"
                />
            </div>
        );
    }
    rowRenderer ({index, key, style}) {
        return (
            <div className={styles.tableRow} key={key} style={style}>
                <div className={styles.listIndex}>{index + 1}</div>
                {this.props.values[index].map((cellValue, columnIndex) => (
                    <div
                        className={styles.tableValue}
                        dataindex={`${index}${columnIndex}`}
                        key={`${index}${columnIndex}`}
                        style={{
                            background: this.props.categoryColor.background,
                            color: this.props.categoryColor.text
                        }}
                        onClick={this.props.draggable ? this.handleEventFactory(index, columnIndex) : null}
                    >
                        {this.props.draggable && this.props.activeRowIndex === index && this.props.activeColIndex === columnIndex ? (
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
                                    onKeyDown={this.props.onKeyPress} // key down to get ahead of blur
                                />
                                <div
                                    className={styles.removeButton}
                                    onMouseDown={this.props.onRemove} // mousedown to get ahead of blur
                                >
                                    {'✖︎'}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.valueInner}>{cellValue}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    }
    render () {
        const {height, values, width, activeRowIndex, activeColIndex, activeValue} = this.props;
        // Keep the active index in view if defined, else must be undefined for List component
        const scrollToIndex = activeRowIndex === null ? undefined : activeRowIndex; /* eslint-disable-line no-undefined */
        return (
            <Table
                activeRowIndex={activeRowIndex}
                activeColIndex={activeColIndex}
                activeValue={activeValue}
                height={(height) - 42 /* Header/footer size, approx */}
                noRowsRenderer={this.noRowsRenderer}
                rowCount={values.length}
                rowGetter={({index}) => values[index]}
                rowHeight={24 /* Row size is same for all rows */}
                rowRenderer={this.rowRenderer}
                scrollToIndex={scrollToIndex} /* eslint-disable-line no-undefined */
                values={values}
                width={width}
            />
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
    onDeactivate: PropTypes.func,
    onFocus: PropTypes.func,
    onInput: PropTypes.func,
    onKeyPress: PropTypes.func,
    onRemove: PropTypes.func,
    values: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
        ]))
    ])),
    width: PropTypes.number
};
export default TableMonitorScroller;
