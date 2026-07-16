import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Box from '../box/box.jsx';
import styles from './audio-trimmer.css';
import SelectionHandle from './selection-handle.jsx';
import Playhead from './playhead.jsx';

const AudioSelector = props => (
    <div
        className={classNames(styles.absolute, styles.selector)}
        ref={props.containerRef}
        onMouseDown={props.onNewSelectionMouseDown}
        onTouchStart={props.onNewSelectionMouseDown}
    >
        {props.trimStart === null ? null : (
            <Box
                className={classNames(styles.absolute)}
                style={{
                    top: `${Math.max(0, (props.trimChannel[1] - props.trimChannel[0])) * 50}%`,
                    left: `${props.trimStart * 100}%`,
                    width: `${100 * (props.trimEnd - props.trimStart)}%`,
                    height: `${(1 + (props.trimChannel[0] === props.trimChannel[1])) * 50}%`
                }}
            >
                <Box className={classNames(styles.absolute, styles.selectionBackground)} />
                <SelectionHandle
                    handleStyle={styles.leftHandle}
                    onMouseDown={props.onTrimStartMouseDown}
                />
                <SelectionHandle
                    handleStyle={styles.rightHandle}
                    onMouseDown={props.onTrimEndMouseDown}
                />
            </Box>
        )}
        {props.playhead !== null && (
            <Playhead
                playbackPosition={props.playhead}
            />
        )}
    </div>
);

AudioSelector.propTypes = {
    containerRef: PropTypes.func,
    onNewSelectionMouseDown: PropTypes.func.isRequired,
    onTrimEndMouseDown: PropTypes.func.isRequired,
    onTrimStartMouseDown: PropTypes.func.isRequired,
    playhead: PropTypes.number,
    trimEnd: PropTypes.number,
    trimStart: PropTypes.number,
    trimChannel: PropTypes.arrayOf(PropTypes.number),
    channelCount: PropTypes.number
};

export default AudioSelector;
