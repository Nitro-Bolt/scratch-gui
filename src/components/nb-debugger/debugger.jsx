import React from 'react';
import Draggable from 'react-draggable';

import closeIcon from './icon--close.svg';

import styles from './debugger.css';

const DebuggerComponent = (props) => {
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
                    <img
                        className={styles.closeButton}
                        src={closeIcon}
                        onClick={props.onClose}
                        width={20}
                        height={20}
                    />
                </div>
                
            </div>
        </Draggable>
    </div>
   )
};

export default DebuggerComponent;