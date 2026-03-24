import React from 'react';
import Draggable from 'react-draggable';

import TabButton from './tab-button.jsx';

import closeIcon from './icon--close.svg';
import darkCloseIcon from './icon--close-dark.svg';
import threadsIcon from './icon--threads.svg';
import logsIcon from './icon--logs.svg';
import performanceIcon from './icon--performance.svg';

import styles from './debugger.css';

const DebuggerComponent = props => {
    let {x, y} = props;
    const cardHorizontalDragOffset = 400; // ~80% of card width
    const cardVerticalDragOffset = 257;// ~80% of card height, if expanded
    const menuBarHeight = 48; // TODO: get pre-calculated from elsewhere?

    if (x === 0 && y === 0) {
        // initialize positions
        x = 292;
        x += cardHorizontalDragOffset;
        // The tallest cards are about 320px high, and the default position is pinned
        // to near the bottom of the blocks palette to allow room to work above.
        const tallCardHeight = 320;
        const bottomMargin = 60; // To avoid overlapping the backpack region
        y = window.innerHeight - tallCardHeight - bottomMargin - menuBarHeight;
    }
   return (
    <div
        className={styles.debuggerContainerOverlay}
        style={{
            width: `${window.innerWidth + (2 * cardHorizontalDragOffset)}px`,
            height: `${window.innerHeight - menuBarHeight + cardVerticalDragOffset}px`,
            top: `${menuBarHeight}px`,
            left: `${-cardHorizontalDragOffset}px`
        }}
    >
        <Draggable
            bounds="parent"
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
                        src={props.darkMode ? closeIcon : darkCloseIcon}
                        onClick={props.onCloseCompilerWarning}
                        width={16}
                        height={16}
                    />
                </div>
            </div>
        </Draggable>
    </div>
   )
};

export default DebuggerComponent;