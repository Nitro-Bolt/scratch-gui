import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Box from '../box/box.jsx';
import Meter from '../meter/meter.jsx';
import Waveform from '../waveform/waveform.jsx';

import styles from './record-modal.css';
import stopIcon from './icon--stop-recording.svg';
import pauseIcon from './icon--pause-recording.svg';
import playIcon from './icon--play.svg';

const messages = defineMessages({
    beginRecord: {
        defaultMessage: 'Begin recording by clicking the button below',
        description: 'Message for recording sound modal',
        id: 'gui.recordingStep.beginRecord'
    },
    permission: {
        defaultMessage: '{arrow}We need your permission to use your microphone',
        description: 'Permission required notice in recording sound modal. Do not translate {arrow}',
        id: 'gui.recordingStep.permission'
    },
    stop: {
        defaultMessage: 'Stop recording',
        description: 'Stop recording button label',
        id: 'gui.recordingStep.stop'
    },
    pause: {
        defaultMessage: 'Pause recording',
        description: 'Pause recording button label',
        id: 'gui.recordingStep.pause'
    },
    resume: {
        defaultMessage: 'Resume recording',
        description: 'Resume recording button label',
        id: 'gui.recordingStep.resume'
    },
    record: {
        defaultMessage: 'Record',
        description: 'Record button label',
        id: 'gui.recordingStep.record'
    }
});

const RecordingStep = props => (
    <Box>
        <Box className={styles.visualizationContainer}>
            <Box className={styles.meterContainer}>
                <Meter
                    height={172}
                    level={props.level}
                    width={20}
                />
            </Box>
            <Box className={styles.waveformContainer}>
                {props.levels ? (
                    <Waveform
                        data={props.levels}
                        height={150}
                        level={0}
                        width={440}
                        preferences={props.preferences}
                    />
                ) : (
                    <span className={styles.helpText}>
                        {props.listening ? props.intl.formatMessage(messages.beginRecord) :
                            props.intl.formatMessage(messages.permission,
                                {arrow: props.isRtl ? '↗️ \u00A0' : '↖️ \u00A0'}
                            )
                        }
                    </span>
                )}
            </Box>
        </Box>
        <Box className={styles.mainButtonRow}>
            {(props.recording || props.paused) && (
                <button
                    onClick={props.paused ? props.onResumeRecording : props.onPauseRecording}
                >
                    <img
                        draggable={false}
                        src={props.paused ? playIcon : pauseIcon}
                    />
                    <div className={styles.helpText}>
                        <span className={styles.recordingText}>
                            {props.intl.formatMessage(props.paused ? messages.resume : messages.pause)}
                        </span>
                    </div>
                </button>
            )}
            <button
                className={styles.mainButton}
                disabled={!props.listening}
                onClick={props.recording || props.paused ? props.onStopRecording : props.onRecord}
            >
                {props.recording || props.paused ? (
                    <img
                        draggable={false}
                        src={stopIcon}
                    />
                ) : (
                    <svg
                        className={styles.recordButton}
                        height="52"
                        width="52"
                    >
                        <circle
                            className={styles.recordButtonCircle}
                            cx="26"
                            cy="26"
                            r="25"
                        />
                        <circle
                            className={styles.recordButtonCircleOutline}
                            cx="26"
                            cy="26"
                            r={27 + (props.level * 5)}
                        />
                    </svg>
                )}
                <div className={styles.helpText}>
                    <span className={styles.recordingText}>
                        {
                            props.recording || props.paused ?
                                props.intl.formatMessage(messages.stop) :
                                props.intl.formatMessage(messages.record)
                        }
                    </span>
                </div>
            </button>
        </Box>
    </Box>
);

RecordingStep.propTypes = {
    intl: intlShape.isRequired,
    isRtl: PropTypes.bool,
    level: PropTypes.number,
    levels: PropTypes.arrayOf(PropTypes.number),
    listening: PropTypes.bool,
    onRecord: PropTypes.func.isRequired,
    onStopRecording: PropTypes.func.isRequired,
    onPauseRecording: PropTypes.func.isRequired,
    onResumeRecording: PropTypes.func.isRequired,
    recording: PropTypes.bool,
    paused: PropTypes.bool,
    preferences: PropTypes.object
};

export default injectIntl(RecordingStep);
