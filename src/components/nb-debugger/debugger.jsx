import React from 'react';
import Draggable from 'react-draggable';

import TabButton from './tab-button.jsx';

import LogsTab from './logs.jsx';
import ThreadsTab from './threads.jsx';
import PerformanceTab from './performance.jsx';
import TimersTab from './timers.jsx';

import closeIcon from './icons/icon--close.svg';
import threadsIcon from './icons/icon--threads.svg';
import logsIcon from './icons/icon--logs.svg';
import performanceIcon from './icons/icon--performance.svg';
import timersIcon from './icons/icon--timers.svg';

import styles from './debugger.css';

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
                        label='Logs'
                        icon={logsIcon}
                        selected={props.tab === 0}
                        onClick={() => props.onTabClick(0)}
                    />
                    <TabButton
                        label='Threads'
                        icon={threadsIcon}
                        selected={props.tab === 1}
                        onClick={() => props.onTabClick(1)}
                    />
                    <TabButton
                        label='Performance'
                        icon={performanceIcon}
                        selected={props.tab === 2}
                        onClick={() => props.onTabClick(2)}
                    />
                    <TabButton
                        label='Timers'
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
                    <span>Warning: The debugger works best when the compiler is disabled.</span>
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
                    <TimersTab timers={props.timers} />
                ) : null}
            </div>
        </Draggable>
    </div>
   );
});

export default DebuggerComponent;
