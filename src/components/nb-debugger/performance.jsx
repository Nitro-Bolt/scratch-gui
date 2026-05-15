import React from 'react';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
import {Sparklines, SparklinesLine} from 'react-sparklines';

import styles from './performance.css';

const formatBytes = bytes => {
    console.log(bytes);
    if (!bytes || bytes < 0) return "0B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1).replace(/\.0$/, "")}${units[i]}`;
};

const ChartButton = props => (
    <button
        onClick={props.onClick}
        className={props.active ? classNames(styles.chartButton, styles.selected) : styles.chartButton}
    >
        <span>{props.label}</span>
    </button>
);

const PerformanceTab = React.memo(props => {
    const maxClones = props.vm.runtime.runtimeOptions.maxClones;
    const data = props.chartIndex === 0 ?
        props.fpsData : props.chartIndex === 1 ?
        props.cloneData : props.chartIndex === 2 ?
        props.memoryData : [];

    const max = props.chartIndex === 0 ?
        props.vm.runtime.frameLoop.framerate : props.chartIndex === 1 && maxClones !== Infinity ?
        maxClones : Math.max(...data, 1);

    const label = props.chartIndex === 0 ?
        'FPS' : props.chartIndex === 1 ?
        'Clones' : null

    const segmentWidth = data.length > 1 ? 100 / (data.length - 1) : 100;

    const chartQuantities = (amount = 5) => {
        const labels = Array.from({length: amount}, (_, i) => {
            const fraction = (amount - 1 - i) / (amount - 1);
            const value = Math.round(max * fraction);
            return props.chartIndex === 2 ? formatBytes(value) : value;
        });
    
        return (
            <div className={styles.chartQuantities}>
                {labels.map((val, i) => <p key={i}>{val}</p>)}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.buttons}>
                <ChartButton
                    onClick={() => props.onSelectChartIndex(0)}
                    active={props.chartIndex === 0}
                    label="FPS"
                />
                <ChartButton
                    onClick={() => props.onSelectChartIndex(1)}
                    active={props.chartIndex === 1}
                    label="Clones"
                />
                <ChartButton
                    onClick={() => props.onSelectChartIndex(2)}
                    active={props.chartIndex === 2}
                    label="Memory"
                />
            </div>
            <div className={styles.chart}>
                {chartQuantities()}
                <Sparklines
                    data={data}
                    max={max}
                    min={0}
                    height={115}
                >
                    <SparklinesLine color="var(--looks-secondary)" />
                </Sparklines>
                <div className={styles.hitArea}>
                    {data.map((value, i) => (
                        <div
                            key={i}
                            className={styles.hitSlice}
                            data-tip={props.chartIndex === 2 ? formatBytes(value) : `${value} ${label}`}
                            data-for="perf-chart-tooltip"
                            style={{
                                left: `${(i - 0.5) * segmentWidth}%`,
                                width: `${segmentWidth}%`,
                                top: `${(1 - value / max) * 100}%`
                            }}
                        />
                    ))}
                </div>
            </div>
            <ReactTooltip
                id="perf-chart-tooltip"
                effect="solid"
                place="top"
            />
        </div>
    );
});

export default PerformanceTab;