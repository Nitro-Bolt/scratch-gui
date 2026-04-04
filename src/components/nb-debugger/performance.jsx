import React from 'react';
import classNames from 'classnames';
import {Sparklines, SparklinesLine, SparklinesCurve} from 'react-sparklines';

import styles from './performance.css';

const ChartButton = props => (
    <button
        onClick={props.onClick}
        className={props.active ? classNames(styles.chartButton, styles.selected) : styles.chartButton}
    >
        <span>{props.label}</span>
    </button>
);

const PerformanceTab = React.memo(props => {
    const data = props.chartIndex === 0 ?
        props.fpsData : props.chartIndex === 1 ?
        props.cloneData : props.chartIndex === 2 ?
        props.memoryData : [];

    const max = props.chartIndex === 0 ?
        props.vm.runtime.frameLoop.framerate : props.chartIndex === 1 ?
        props.vm.runtime.runtimeOptions.maxClones : undefined;

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
                <Sparklines
                    data={data}
                    max={max}
                    min={0}
                >
                    <SparklinesCurve color="var(--looks-secondary)" />
                </Sparklines>
            </div>
        </div>
    );
});

export default PerformanceTab;