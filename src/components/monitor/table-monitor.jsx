import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';
import styles from './monitor.css';
import TableMonitorScroller from './table-monitor-scroller.jsx';

const TableMonitor = ({draggable, label, width, height, value, onAddRow, onAddColumn, onResizeMouseDown, ...rowProps}) => (
    <div
        className={styles.listMonitor}
        style={{
            width: `${width}px`,
            height: `${height}px`
        }}
    >
        <div className={styles.listHeader}>
            {label}
        </div>
        <div className={styles.listBody}>
            <TableMonitorScroller
                draggable={draggable}
                height={height}
                values={value}
                width={width}
                onAddColumn={onAddColumn}
                {...rowProps}
            />
        </div>
        <div className={styles.listFooter}>
            <div
                className={classNames(draggable ? styles.addButton : null, 'no-drag')}
                onClick={draggable ? onAddRow : null}
            >
                {'+' /* TODO waiting on asset */}
            </div>
            <div className={styles.footerLength}>
                <FormattedMessage
                    defaultMessage="cells {cell}"
                    description="Cells label on table monitors. DO NOT translate {cell} (with brackets)."
                    id="gui.monitor.tableMonitor.tableItem"
                    values={{
                        cell: Array.isArray(value) ? value.reduce((acc, row) => acc + row.length, 0) : 0
                    }}
                />
            </div>
            <div
                className={classNames(draggable ? styles.resizeHandle : null, 'no-drag')}
                onMouseDown={draggable ? onResizeMouseDown : null}
            >
                {'=' /* TODO waiting on asset */}
            </div>
        </div>
    </div>
);

TableMonitor.propTypes = {
    activeRowIndex: PropTypes.number,
    activeColIndex: PropTypes.number,
    categoryColor: PropTypes.shape({
        background: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    }).isRequired,
    draggable: PropTypes.bool.isRequired,
    height: PropTypes.number,
    label: PropTypes.string.isRequired,
    onActivate: PropTypes.func,
    onAddColumn: PropTypes.func,
    onAddRow: PropTypes.func,
    onResizeMouseDown: PropTypes.func,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ])),
        PropTypes.arrayOf(
            PropTypes.arrayOf(
                PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string
        ])))
    ]),
    width: PropTypes.number
};

TableMonitor.defaultProps = {
    width: 200,
    height: 200,
    value: []
};

export default TableMonitor;
