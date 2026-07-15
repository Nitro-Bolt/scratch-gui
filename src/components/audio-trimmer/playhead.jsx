import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import styles from './audio-trimmer.css';
import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';
import playheadCaret from '!../../lib/tw-recolor/build!./icon--playhead-caret.svg';

const Playhead = props => (
    <>
        <div className={styles.playheadContainer}>
            <div
                className={classNames(styles.playhead)}
                style={{
                    transform: `translateX(${100 * props.playbackPosition}%)`
                }}
            />
        </div>
        <div
            className={styles.playheadCaretContainer}
            style={{
                transform: `translateX(${100 * props.playbackPosition}%)`
            }}
        >
            <TWRenderRecoloredImage
                id="playhead-caret"
                src={playheadCaret}
            />
        </div>
    </>
);

Playhead.propTypes = {
    playbackPosition: PropTypes.number
};

export default Playhead;
