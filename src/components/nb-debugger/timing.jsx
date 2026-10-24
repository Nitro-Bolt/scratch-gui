import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import downloadBlob from '../../lib/download-blob';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import FancySlider from '../tw-fancy-slider/slider.jsx';
import styles from './timing.css';

/* eslint-disable react/jsx-no-bind */

const formatTime = value => {
    if (!Number.isFinite(value)) return '-';
    if (value < 1) return `${(value * 1000).toFixed(1)}μs`;
    if (value < 1000) return `${value.toFixed(2)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
};

const escapeCsv = value => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const TimingTab = React.memo(props => {
    const [sortColumn, setSortColumn] = useState('totalTime');
    const [ascending, setAscending] = useState(false);
    const [showRatio, setShowRatio] = useState(false);
    const profileRows = props.rows.filter(row => row.type === 'profile');
    const totalTime = profileRows.reduce((sum, row) => sum + row.totalTime, 0);
    const positiveTimes = profileRows.map(row => row.totalTime).filter(time => time > 0);
    const minimumTime = positiveTimes.length ? Math.min(...positiveTimes) : 0;
    const timerRows = props.rows.filter(row => row.type === 'timer');
    const totalTimerTime = timerRows.reduce((sum, row) => sum + row.totalTime, 0);
    const positiveTimerTimes = timerRows.map(row => row.totalTime).filter(time => time > 0);
    const minimumTimerTime = positiveTimerTimes.length ? Math.min(...positiveTimerTimes) : 0;
    const getShare = row => {
        const isProfile = row.type === 'profile';
        const minimum = isProfile ? minimumTime : minimumTimerTime;
        const total = isProfile ? totalTime : totalTimerTime;
        return showRatio ? (minimum ? row.totalTime / minimum : 0) :
            (total ? (row.totalTime / total) * 100 : 0);
    };
    const sortedRows = useMemo(() => props.rows.slice().sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        const result = typeof aValue === 'string' ? aValue.localeCompare(bValue) : aValue - bValue;
        return ascending ? result : -result;
    }), [props.rows, sortColumn, ascending]);

    const selectSort = column => {
        if (sortColumn === column) setAscending(!ascending);
        else {
            setSortColumn(column);
            setAscending(column === 'label');
        }
    };

    const exportRows = () => {
        const header = ['Type', 'Label', 'Target', 'Target ID', 'Block ID', 'Opcode', 'Source Resolved',
            'Total Time (ms)', 'Average Time (ms)', 'Minimum Time (ms)', 'Maximum Time (ms)', 'Call Count',
            showRatio ? 'Ratio Time' : 'Percent Time'];
        const body = sortedRows.map(row => {
            const share = getShare(row);
            return [row.type, row.label, row.targetName, row.targetId, row.blockId, row.opcode,
                row.sourceResolved, row.totalTime, row.callCount ? row.averageTime : '', row.minTime,
                row.maxTime, row.callCount || '', share].map(value => escapeCsv(value === null ? '' : value)).join(',');
        });
        downloadBlob('debugger-timing.csv', new Blob([[header.join(','), ...body].join('\n')], {type: 'text/csv'}));
    };

    const header = (column, label) => (
        <th aria-sort={sortColumn === column ? (ascending ? 'ascending' : 'descending') : 'none'}>
            <button
                type="button"
                className={styles.sortButton}
                onClick={() => selectSort(column)}
            >
                {label}{sortColumn === column ? (ascending ? ' ↑' : ' ↓') : ''}
            </button>
        </th>
    );

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <label>
                    <FancyCheckbox
                        checked={props.profiling}
                        disabled={!props.profilingAvailable}
                        onChange={event => props.onSetProfiling(event.target.checked)}
                    />
                    {'Profile blocks'}
                </label>
                <label>
                    <FancyCheckbox
                        checked={props.heatmap}
                        onChange={event => props.onSetHeatmap(event.target.checked)}
                    />
                    {'Heatmap'}
                </label>
                {props.heatmap &&
                    <label>
                        {'Scale'}
                        <FancySlider
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={props.heatmapScale}
                            onChange={event => props.onSetHeatmapScale(Number(event.target.value))}
                        />
                        <output>{`${Math.round(props.heatmapScale * 100)}%`}</output>
                    </label>
                }
                {props.compilerEnabled &&
                    <label title="Lower values are more accurate but use more CPU">
                        {'Sample interval'}
                        <FancySlider
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={props.sampleInterval}
                            onChange={event => props.onSetSampleInterval(Number(event.target.value))}
                        />
                        <output>{`${props.sampleInterval.toFixed(1)}ms`}</output>
                    </label>
                }
                <label>
                    <FancyCheckbox
                        checked={showRatio}
                        onChange={event => setShowRatio(event.target.checked)}
                    />
                    {'Ratio time'}
                </label>
                <label title="Automatically end the last running timer when another timer starts">
                    <FancyCheckbox
                        checked={props.autoStopTimers}
                        onChange={event => props.onSetAutoStopTimers(event.target.checked)}
                    />
                    {'Auto-stop timers'}
                </label>
                <button onClick={props.onClear}>{'Clear'}</button>
                <button
                    onClick={exportRows}
                    disabled={!props.rows.length}
                >
                    {'Export CSV'}
                </button>
            </div>
            {!props.profilingAvailable && props.compilerEnabled &&
                <div className={styles.notice}>
                    {'Compiled profiling requires SharedArrayBuffer support. '}
                    <button
                        type="button"
                        onClick={props.onDisableCompiler}
                    >
                        {'Disable compiler'}
                    </button>
                </div>
            }
            {props.profilingError &&
                <div className={styles.notice}>{props.profilingError}</div>
            }
            {props.restartRequired &&
                <div className={styles.notice}>{'Restart the project to profile already compiled scripts.'}</div>
            }
            {sortedRows.length ? (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead><tr>
                            {header('label', 'Block or timer')}
                            {header('totalTime', 'Total')}
                            {header('averageTime', 'Average')}
                            <th>{'Min'}</th>
                            <th>{'Max'}</th>
                            {header('callCount', 'Calls')}
                            <th>{showRatio ? 'Ratio' : 'Time'}</th>
                        </tr></thead>
                        <tbody>{sortedRows.map(row => {
                            const share = getShare(row);
                            return (
                                <tr key={row.key}>
                                    <td className={styles.label}>
                                        {row.navigable ? (
                                            <button
                                                type="button"
                                                className={styles.sourceButton}
                                                onClick={() => props.onSelectRow(row)}
                                            >
                                                {row.label}
                                            </button>
                                        ) : row.label}
                                    </td>
                                    <td>{formatTime(row.totalTime)}</td>
                                    <td>{row.callCount ? formatTime(row.averageTime) : '-'}</td>
                                    <td>{formatTime(row.minTime)}</td>
                                    <td>{formatTime(row.maxTime)}</td>
                                    <td>{row.callCount || '-'}</td>
                                    <td>{showRatio ? `${share.toFixed(2)}×` : `${share.toFixed(1)}%`}</td>
                                </tr>
                            );
                        })}</tbody>
                    </table>
                </div>
            ) : <span className={styles.empty}>{'No timing data'}</span>}
        </div>
    );
});

TimingTab.propTypes = {
    rows: PropTypes.array.isRequired,
    autoStopTimers: PropTypes.bool.isRequired,
    profiling: PropTypes.bool.isRequired,
    profilingAvailable: PropTypes.bool.isRequired,
    profilingError: PropTypes.string.isRequired,
    compilerEnabled: PropTypes.bool.isRequired,
    restartRequired: PropTypes.bool.isRequired,
    heatmap: PropTypes.bool.isRequired,
    heatmapScale: PropTypes.number.isRequired,
    sampleInterval: PropTypes.number.isRequired,
    onSetProfiling: PropTypes.func.isRequired,
    onSetAutoStopTimers: PropTypes.func.isRequired,
    onSetSampleInterval: PropTypes.func.isRequired,
    onSetHeatmap: PropTypes.func.isRequired,
    onSetHeatmapScale: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onDisableCompiler: PropTypes.func.isRequired,
    onSelectRow: PropTypes.func.isRequired
};

TimingTab.displayName = 'TimingTab';

export default TimingTab;
