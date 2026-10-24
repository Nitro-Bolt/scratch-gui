import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

import TabButton from './tab-button.jsx';

import LogsTab from './logs.jsx';
import ThreadsTab from './threads.jsx';
import PerformanceTab from './performance.jsx';
import TimingTab from './timing.jsx';

import closeIcon from './icons/icon--close.svg';
import threadsIcon from './icons/icon--threads.svg';
import logsIcon from './icons/icon--logs.svg';
import performanceIcon from './icons/icon--performance.svg';
import timersIcon from './icons/icon--timers.svg';

import styles from './debugger.css';

/* eslint-disable react/jsx-no-bind */

const DebuggerComponent = React.memo(props => {
    let {x, y} = props;
    const width = 576;
    const height = 400;
    const menuBarHeight = 48;

    if (x === 0 && y === 0) {
        // initialize positions
        x = window.innerWidth - width;
        y = (window.innerHeight - height) / 2;
    }
    return (
        <div
            className={styles.debuggerContainerOverlay}
            style={{
                width: `${window.innerWidth + (2 * width)}px`,
                height: `${window.innerHeight - menuBarHeight + height}px`,
                top: `${menuBarHeight}px`,
                left: `${-width}px`
            }}
        >
            <Draggable
                bounds={{
                    left: width,
                    right: window.innerWidth,
                    top: -menuBarHeight,
                    bottom: window.innerHeight - height - menuBarHeight
                }}
                handle={`.${styles.debuggerHeader}`}
                position={{x, y}}
                onDrag={props.onDrag}
                onStart={props.onStartDrag}
                onStop={props.onEndDrag}
            >
                <div className={styles.debuggerContainer}>
                    <div
                        style={{
                            cursor: props.dragging ? 'grabbing' : 'grab'
                        }}
                        className={styles.debuggerHeader}
                    >
                        <TabButton
                            label="Logs"
                            icon={logsIcon}
                            selected={props.tab === 0}
                            onClick={() => props.onTabClick(0)}
                        />
                        <TabButton
                            label="Threads"
                            icon={threadsIcon}
                            selected={props.tab === 1}
                            onClick={() => props.onTabClick(1)}
                        />
                        <TabButton
                            label="Performance"
                            icon={performanceIcon}
                            selected={props.tab === 2}
                            onClick={() => props.onTabClick(2)}
                        />
                        <TabButton
                            label="Timing"
                            icon={timersIcon}
                            selected={props.tab === 3}
                            onClick={() => props.onTabClick(3)}
                        />
                        <img
                            className={styles.closeButton}
                            src={closeIcon}
                            onClick={props.onClose}
                            width={20}
                            height={20}
                        />
                    </div>
                    <div
                        className={styles.compilerWarning}
                        hidden={!props.showCompilerWarning}
                    >
                        <span>{'Warning: The debugger works best when the compiler is disabled.'}</span>
                        <img
                            src={closeIcon}
                            onClick={props.onCloseCompilerWarning}
                            width={16}
                            height={16}
                        />
                    </div>
                    {props.tab === 0 ? (
                        <LogsTab
                            onClearLogs={props.onClearLogs}
                            onSelectTarget={props.onSelectTarget}
                            onSelectTargetBlock={props.onSelectTargetBlock}
                            logs={props.logs}
                            sprites={props.sprites}
                            projectTitle={props.projectTitle}
                        />
                    ) : props.tab === 1 ? (
                        <ThreadsTab
                            vm={props.vm}
                            onSelectTarget={props.onSelectTarget}
                            onSelectTargetBlock={props.onSelectTargetBlock}
                            onInspectThread={props.onInspectThread}
                            threads={props.threads}
                        />
                    ) : props.tab === 2 ? (
                        <PerformanceTab
                            chartIndex={props.performanceChart}
                            onSelectChartIndex={props.onSelectPerformanceChart}
                            fpsData={props.fpsData}
                            cloneData={props.cloneData}
                            memoryData={props.memoryData}
                            vm={props.vm}
                        />
                    ) : props.tab === 3 ? (
                        <TimingTab
                            rows={props.timingRows}
                            profiling={props.profiling}
                            profilingAvailable={props.profilingAvailable}
                            profilingError={props.profilingError}
                            compilerEnabled={props.compilerEnabled}
                            restartRequired={props.restartRequired}
                            autoStopTimers={props.autoStopTimers}
                            heatmap={props.heatmap}
                            heatmapScale={props.heatmapScale}
                            sampleInterval={props.sampleInterval}
                            onSetProfiling={props.onSetProfiling}
                            onSetAutoStopTimers={props.onSetAutoStopTimers}
                            onDisableCompiler={props.onDisableCompiler}
                            onSetSampleInterval={props.onSetSampleInterval}
                            onSetHeatmap={props.onSetHeatmap}
                            onSetHeatmapScale={props.onSetHeatmapScale}
                            onClear={props.onClearTiming}
                            onSelectRow={props.onSelectTimingRow}
                        />
                    ) : null}
                </div>
            </Draggable>
        </div>
    );
});

DebuggerComponent.displayName = 'DebuggerComponent';

DebuggerComponent.propTypes = {
    cloneData: PropTypes.array.isRequired,
    autoStopTimers: PropTypes.bool.isRequired,
    compilerEnabled: PropTypes.bool.isRequired,
    dragging: PropTypes.bool.isRequired,
    fpsData: PropTypes.array.isRequired,
    heatmap: PropTypes.bool.isRequired,
    heatmapScale: PropTypes.number.isRequired,
    logs: PropTypes.array.isRequired,
    memoryData: PropTypes.array.isRequired,
    onClearLogs: PropTypes.func.isRequired,
    onClearTiming: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onCloseCompilerWarning: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDisableCompiler: PropTypes.func.isRequired,
    onEndDrag: PropTypes.func.isRequired,
    onInspectThread: PropTypes.func.isRequired,
    onSelectPerformanceChart: PropTypes.func.isRequired,
    onSelectTarget: PropTypes.func.isRequired,
    onSelectTargetBlock: PropTypes.func.isRequired,
    onSelectTimingRow: PropTypes.func.isRequired,
    onSetHeatmap: PropTypes.func.isRequired,
    onSetAutoStopTimers: PropTypes.func.isRequired,
    onSetHeatmapScale: PropTypes.func.isRequired,
    onSetProfiling: PropTypes.func.isRequired,
    onSetSampleInterval: PropTypes.func.isRequired,
    onStartDrag: PropTypes.func.isRequired,
    onTabClick: PropTypes.func.isRequired,
    performanceChart: PropTypes.number.isRequired,
    profiling: PropTypes.bool.isRequired,
    profilingAvailable: PropTypes.bool.isRequired,
    profilingError: PropTypes.string.isRequired,
    projectTitle: PropTypes.string.isRequired,
    restartRequired: PropTypes.bool.isRequired,
    sampleInterval: PropTypes.number.isRequired,
    showCompilerWarning: PropTypes.bool.isRequired,
    sprites: PropTypes.object.isRequired,
    tab: PropTypes.number.isRequired,
    threads: PropTypes.array.isRequired,
    timingRows: PropTypes.array.isRequired,
    vm: PropTypes.object.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
};

export default DebuggerComponent;
