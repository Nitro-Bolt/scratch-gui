/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import classNames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import Waveform from '../waveform/waveform.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';

import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import AudioSelector from '../../containers/audio-selector.jsx';
import IconButton from '../icon-button/icon-button.jsx';

import styles from './sound-editor.css';

import playIcon from './icon--play.svg';
import pauseIcon from './icon--pause.svg';
import stopIcon from './icon--stop.svg';
import redoIcon from '!../../lib/tw-recolor/build!./icon--redo.svg';
import undoIcon from '!../../lib/tw-recolor/build!./icon--undo.svg';
import fasterIcon from './icon--faster.svg';
import slowerIcon from './icon--slower.svg';
import volumeIcon from './icon--louder.svg';
import robotIcon from './icon--robot.svg';
import echoIcon from './icon--echo.svg';
import reverseIcon from './icon--reverse.svg';
import fadeOutIcon from './icon--fade-out.svg';
import fadeInIcon from './icon--fade-in.svg';
import flipIcon from './icon--flip.svg';
import bitcrushIcon from './icon--bitcrush.svg';

import deleteIcon from '!../../lib/tw-recolor/build!./icon--delete.svg';
import copyIcon from '!../../lib/tw-recolor/build!./icon--copy.svg';
import pasteIcon from '!../../lib/tw-recolor/build!./icon--paste.svg';
import copyToNewIcon from '!../../lib/tw-recolor/build!./icon--copy-to-new.svg';
import trimIcon from '!../../lib/tw-recolor/build!./icon--trim-action.svg';
import {SOUND_BYTE_LIMIT} from '../../lib/audio/audio-util.js';
import Box from '../box/box.jsx';
import Meter from '../meter/meter.jsx';
import {DefaultOpts} from '../../lib/audio/default-audio-effect-opts.js';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    sound: {
        id: 'gui.soundEditor.sound',
        description: 'Label for the name of the sound',
        defaultMessage: 'Sound'
    },
    play: {
        id: 'gui.soundEditor.play',
        description: 'Title of the button to start playing the sound',
        defaultMessage: 'Play'
    },
    pause: {
        id: 'gui.soundEditor.pause',
        description: 'Title of the button to pause the sound',
        defaultMessage: 'Pause'
    },
    stop: {
        id: 'gui.soundEditor.stop',
        description: 'Title of the button to stop the sound',
        defaultMessage: 'Stop'
    },
    copy: {
        id: 'gui.soundEditor.copy',
        description: 'Title of the button to copy the sound',
        defaultMessage: 'Copy'
    },
    paste: {
        id: 'gui.soundEditor.paste',
        description: 'Title of the button to paste the sound',
        defaultMessage: 'Paste'
    },
    copyToNew: {
        id: 'gui.soundEditor.copyToNew',
        description: 'Title of the button to copy the selection into a new sound',
        defaultMessage: 'Copy to New'
    },
    delete: {
        id: 'gui.soundEditor.delete',
        description: 'Title of the button to delete the sound',
        defaultMessage: 'Delete'
    },
    trim: {
        id: 'gui.soundEditor.trim',
        description: 'Title of the button to trim the sound',
        defaultMessage: 'Trim'
    },
    save: {
        id: 'gui.soundEditor.save',
        description: 'Title of the button to save trimmed sound',
        defaultMessage: 'Save'
    },
    undo: {
        id: 'gui.soundEditor.undo',
        description: 'Title of the button to undo',
        defaultMessage: 'Undo'
    },
    redo: {
        id: 'gui.soundEditor.redo',
        description: 'Title of the button to redo',
        defaultMessage: 'Redo'
    },
    faster: {
        id: 'gui.soundEditor.faster',
        description: 'Title of the button to apply the faster effect',
        defaultMessage: 'Faster'
    },
    slower: {
        id: 'gui.soundEditor.slower',
        description: 'Title of the button to apply the slower effect',
        defaultMessage: 'Slower'
    },
    echo: {
        id: 'gui.soundEditor.echo',
        description: 'Title of the button to apply the echo effect',
        defaultMessage: 'Echo'
    },
    robot: {
        id: 'gui.soundEditor.robot',
        description: 'Title of the button to apply the robot effect',
        defaultMessage: 'Robot'
    },
    louder: {
        id: 'gui.soundEditor.louder',
        description: 'Title of the button to apply the louder effect',
        defaultMessage: 'Louder'
    },
    softer: {
        id: 'gui.soundEditor.softer',
        description: 'Title of the button to apply thr.softer effect',
        defaultMessage: 'Softer'
    },
    reverse: {
        id: 'gui.soundEditor.reverse',
        description: 'Title of the button to apply the reverse effect',
        defaultMessage: 'Reverse'
    },
    fadeOut: {
        id: 'gui.soundEditor.fadeOut',
        description: 'Title of the button to apply the fade out effect',
        defaultMessage: 'Fade out'
    },
    fadeIn: {
        id: 'gui.soundEditor.fadeIn',
        description: 'Title of the button to apply the fade in effect',
        defaultMessage: 'Fade in'
    },
    mute: {
        id: 'gui.soundEditor.mute',
        description: 'Title of the button to apply the mute effect',
        defaultMessage: 'Mute'
    },
    flip: {
        id: 'gui.soundEditor.flip',
        description: 'Title of the button to apply the flip effect',
        defaultMessage: 'Flip L&R'
    },
    speed: {
        id: 'gui.soundEditor.speed',
        description: 'Title of the button to apply the speed effect',
        defaultMessage: 'Speed'
    },
    speedSpeed: {
        id: 'gui.soundEditor.speed.speed',
        description: 'Label for the speed',
        defaultMessage: 'Speed'
    },
    volume: {
        id: 'gui.soundEditor.volume',
        description: 'Title of the button to apply the volume effect',
        defaultMessage: 'Volume'
    },
    volumeVolume: {
        id: 'gui.soundEditor.volume.volume',
        description: 'Label for the volume',
        defaultMessage: 'Volume'
    },
    bitcrush: {
        id: 'gui.soundEditor.bitcrush',
        description: 'Title of the button to apply the bitcrush effect',
        defaultMessage: 'Bitcrush'
    },
    bitcrushSampleRate: {
        id: 'gui.soundEditor.bitcrush.sampleRate',
        description: 'Label for the sample rate',
        defaultMessage: 'Sample Rate'
    },
    bitcrushBitDepth: {
        id: 'gui.soundEditor.bitcrush.bitDepth',
        description: 'Label for the bit depth',
        defaultMessage: 'Bit Depth'
    }
});

const formatTime = timeSeconds => {
    const minutes = (Math.floor(timeSeconds / 60))
        .toString()
        .padStart(2, '0');
    const seconds = (timeSeconds % 60)
        .toFixed(2)
        .padStart(5, '0');
    return `${minutes}:${seconds}`;
};

const formatDuration = (playheadPercent, trimStartPercent, trimEndPercent, durationSeconds) => {
    // If no selection, the trim is the entire sound.
    trimStartPercent = trimStartPercent === null ? 0 : trimStartPercent;
    trimEndPercent = trimEndPercent === null ? 1 : trimEndPercent;

    // If the playhead doesn't exist, assume it's at the start of the selection.
    playheadPercent = playheadPercent === null ? trimStartPercent : playheadPercent;

    // If selection has zero length, treat it as the entire sound being selected.
    // This happens when the user first clicks to start making a selection.
    const trimSize = (trimEndPercent - trimStartPercent) || 1;
    const trimDuration = trimSize * durationSeconds;

    const progressInTrim = (playheadPercent - trimStartPercent) / trimSize;
    const currentTime = progressInTrim * trimDuration;

    return `${formatTime(currentTime)} / ${formatTime(trimDuration)}`;
};

const formatSampleRate = sampleRate => `${(sampleRate / 1000).toFixed(0)}kHz`;

const formatSoundSize = bytes => {
    if (bytes > 1000 * 1000) {
        return `${(bytes / 1000 / 1000).toFixed(2)}MB`;
    }
    return `${(bytes / 1000).toFixed(2)}KB`;
};

const SoundEditor = props => {
    const [speedSpeed, setSpeedSpeed] = useState(DefaultOpts.speed);
    const [volumeVolume, setVolumeVolume] = useState(DefaultOpts.volume);
    const [bitcrushSampleRate, setBitcrushSampleRate] = useState(DefaultOpts.sampleRate);
    const [bitcrushBitDepth, setBitcrushBitDepth] = useState(DefaultOpts.bitDepth);
    return (
        <div
            className={styles.editorContainer}
            ref={props.setRef}
            onMouseDown={props.onContainerClick}
        >
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <Label text={props.intl.formatMessage(messages.sound)}>
                        <BufferedInput
                            tabIndex="1"
                            type="text"
                            value={props.name}
                            onSubmit={props.onChangeName}
                            className={styles.nameInput}
                        />
                    </Label>
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.button}
                            disabled={!props.canUndo}
                            title={props.intl.formatMessage(messages.undo)}
                            onClick={props.onUndo}
                        >
                            <TWRenderRecoloredImage
                                className={styles.undoIcon}
                                draggable={false}
                                src={undoIcon}
                            />
                        </button>
                        <button
                            className={styles.button}
                            disabled={!props.canRedo}
                            title={props.intl.formatMessage(messages.redo)}
                            onClick={props.onRedo}
                        >
                            <TWRenderRecoloredImage
                                className={styles.redoIcon}
                                draggable={false}
                                src={redoIcon}
                            />
                        </button>
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <IconButton
                        className={styles.toolButton}
                        img={copyIcon}
                        title={props.intl.formatMessage(messages.copy)}
                        onClick={props.onCopy}
                    />
                    <IconButton
                        className={styles.toolButton}
                        disabled={props.canPaste === false}
                        img={pasteIcon}
                        title={props.intl.formatMessage(messages.paste)}
                        onClick={props.onPaste}
                    />
                    <IconButton
                        className={classNames(styles.toolButton, styles.flipInRtl)}
                        img={copyToNewIcon}
                        title={props.intl.formatMessage(messages.copyToNew)}
                        onClick={props.onCopyToNew}
                    />
                </div>
                <IconButton
                    className={styles.toolButton}
                    disabled={props.trimStart === null}
                    img={deleteIcon}
                    title={props.intl.formatMessage(messages.delete)}
                    onClick={props.onDelete}
                />
                <IconButton
                    className={styles.toolButton}
                    disabled={props.trimStart === null}
                    img={trimIcon}
                    title={props.intl.formatMessage(messages.trim)}
                    onClick={props.onDeleteInverse}
                />
            </div>
            <div
                className={styles.row}
                style={{
                    alignItems: 'stretch'
                }}
            >
                <Box className={styles.meterContainer}>
                    <Meter
                        height={172}
                        level={props.playing * Math.max(
                            props.chunkLevels[0][Math.floor(props.playhead * props.chunkLevels[0].length)],
                            props.chunkLevels[props.chunkLevels.length - 1][
                                Math.floor(props.playhead * props.chunkLevels[props.chunkLevels.length - 1].length)
                            ]
                        )}
                        width={20}
                    />
                </Box>
                <div className={classNames(styles.audioContainer)}>
                    <div
                        className={styles.timeSteps}
                        ref={props.setTimeStepRef}
                        onMouseDown={props.onTimeStepMouseDown}
                    >
                        {Array.from({length: props.timeStepCount}).map((_, i) => (
                            <div
                                key={i}
                                className={styles.timeStep}
                                style={{
                                    translate: `${props.timeStepWidth * i}px 0`
                                }}
                            >
                                {(i % 2 === 0 || props.timeStepWidth > 65) && (
                                    <span>{formatTime(props.timeStepTime * i)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={styles.waveformContainer}>
                        <div className={styles.waveformInsideContainer}>
                            <div
                                className={styles.waveformShadow}
                                style={{
                                    // This logic makes my brain hurt but if it's not broken don't fix it
                                    // eslint-disable-next-line max-len
                                    background: `linear-gradient(90deg, ${Math.min(props.playhead, props.trimEnd ?? props.playhead) > 0 ? `var(--page-background) 0%, var(--page-background) ${Math.min(props.playhead, props.trimEnd ?? props.playhead) * 100}%, transparent ${Math.min(props.playhead, props.trimEnd ?? props.playhead) * 100}%` : 'transparent'}${props.trimStart || props.trimEnd ? `, transparent ${Math.max(props.playhead, props.trimStart, props.trimEnd) * 100}%, var(--page-background) ${Math.max(props.playhead, props.trimStart, props.trimEnd) * 100}%` : ''})`
                                }}
                            />
                            {props.chunkLevels.map((data, i) => (
                                <div
                                    className={styles.waveform}
                                    key={i}
                                >
                                    <Waveform
                                        data={data}
                                        height={(140 / props.chunkLevels.length) + (props.chunkLevels.length * 20)}
                                        width={600}
                                        preferences={props.preferences}
                                    />
                                    {props.chunkLevels.length > 1 && (
                                        <>
                                            <div className={styles.waveformLabel}>
                                                {[
                                                    <FormattedMessage
                                                        defaultMessage="Left Channel"
                                                        description="Label for left waveform"
                                                        id="nb.leftChannel"
                                                        key="0"
                                                    />,
                                                    <FormattedMessage
                                                        defaultMessage="Right Channel"
                                                        description="Label for right waveform"
                                                        id="nb.rightChannel"
                                                        key="1"
                                                    />
                                                ][i]}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <AudioSelector
                            playhead={props.playhead}
                            onUpdatePlayhead={props.onUpdatePlayhead}
                            trimEnd={props.trimEnd}
                            trimStart={props.trimStart}
                            trimChannel={props.trimChannel}
                            onSetTrimChannel={props.onSetTrimChannel}
                            channelCount={props.chunkLevels.length}
                            onPlay={props.onPlay}
                            onSetTrim={props.onSetTrim}
                            onStop={props.onStop}
                        />
                    </div>
                </div>
            </div>
            <div className={classNames(styles.row, styles.rowReverse)}>
                <div className={classNames(styles.roundButtonOuter, styles.inputGroup)}>
                    {props.playing ? (
                        <button
                            className={classNames(styles.roundButton, styles.playButton)}
                            title={props.intl.formatMessage(messages.pause)}
                            onClick={props.onPause}
                        >
                            <img
                                draggable={false}
                                src={pauseIcon}
                            />
                        </button>
                    ) : (
                        <button
                            className={classNames(styles.roundButton, styles.playButton)}
                            title={props.intl.formatMessage(messages.play)}
                            onClick={props.onPlay}
                        >
                            <img
                                draggable={false}
                                src={playIcon}
                            />
                        </button>
                    )}
                    <button
                        className={classNames(styles.roundButton, styles.stopButton)}
                        title={props.intl.formatMessage(messages.stop)}
                        onClick={props.onStop}
                    >
                        <img
                            draggable={false}
                            src={stopIcon}
                        />
                    </button>
                </div>
                <div className={styles.effects}>
                    <IconButton
                        className={styles.effectButton}
                        img={fasterIcon}
                        title={<FormattedMessage {...messages.speed} />}
                        onClick={props.onFaster}
                        dropdown={(
                            <div className={styles.dropdown}>
                                <div className={styles.inputGroup}>
                                    <Label text={props.intl.formatMessage(messages.speedSpeed)}>
                                        <BufferedInput
                                            type="number"
                                            className={styles.dropdownInput}
                                            value={speedSpeed}
                                            onInput={event => setSpeedSpeed(event.currentTarget.value)}
                                        />
                                    </Label>
                                </div>
                                <button
                                    className={styles.dropdownSubmit}
                                    onClick={() => props.onSpeed(speedSpeed)}
                                >
                                    <FormattedMessage
                                        id="gui.soundEditor.applyEffect"
                                        description="Title of the button to apply the effect"
                                        defaultMessage="Apply"
                                    />
                                </button>
                            </div>
                        )}
                    />
                    <IconButton
                        className={classNames(styles.effectButton, styles.flipInRtl)}
                        img={volumeIcon}
                        title={<FormattedMessage {...messages.volume} />}
                        onClick={props.onLouder}
                        dropdown={(
                            <div className={styles.dropdown}>
                                <div className={styles.inputGroup}>
                                    <Label text={props.intl.formatMessage(messages.volumeVolume)}>
                                        <BufferedInput
                                            type="number"
                                            className={styles.dropdownInput}
                                            value={volumeVolume}
                                            onInput={event => setVolumeVolume(event.currentTarget.value)}
                                        />
                                    </Label>
                                </div>
                                <button
                                    className={styles.dropdownSubmit}
                                    onClick={() => props.onVolume(volumeVolume)}
                                >
                                    <FormattedMessage
                                        id="gui.soundEditor.applyEffect"
                                        description="Title of the button to apply the effect"
                                        defaultMessage="Apply"
                                    />
                                </button>
                            </div>
                        )}
                    />
                    <IconButton
                        className={styles.effectButton}
                        img={fadeInIcon}
                        title={<FormattedMessage {...messages.fadeIn} />}
                        onClick={props.onFadeIn}
                    />
                    <IconButton
                        className={styles.effectButton}
                        img={fadeOutIcon}
                        title={<FormattedMessage {...messages.fadeOut} />}
                        onClick={props.onFadeOut}
                    />
                    <IconButton
                        className={styles.effectButton}
                        img={reverseIcon}
                        title={<FormattedMessage {...messages.reverse} />}
                        onClick={props.onReverse}
                    />
                    <IconButton
                        className={styles.effectButton}
                        img={robotIcon}
                        title={<FormattedMessage {...messages.robot} />}
                        onClick={props.onRobot}
                    />
                    <IconButton
                        className={styles.effectButton}
                        img={echoIcon}
                        title={<FormattedMessage {...messages.echo} />}
                        onClick={props.onEcho}
                    />
                    <IconButton
                        className={styles.effectButton}
                        img={flipIcon}
                        title={<FormattedMessage {...messages.flip} />}
                        onClick={props.onFlip}
                    />
                    <IconButton
                        className={classNames(styles.effectButton, styles.flipInRtl)}
                        img={bitcrushIcon}
                        title={<FormattedMessage {...messages.bitcrush} />}
                        onClick={() => props.onBitcrush(DefaultOpts.sampleRate, DefaultOpts.bitDepth)}
                        dropdown={(
                            <div className={styles.dropdown}>
                                <div className={styles.inputGroup}>
                                    <Label text={props.intl.formatMessage(messages.bitcrushSampleRate)}>
                                        <BufferedInput
                                            type="number"
                                            className={styles.dropdownInput}
                                            value={bitcrushSampleRate}
                                            onInput={event => setBitcrushSampleRate(event.currentTarget.value)}
                                        />
                                    </Label>
                                    <Label text={props.intl.formatMessage(messages.bitcrushBitDepth)}>
                                        <BufferedInput
                                            type="number"
                                            className={styles.dropdownInput}
                                            value={bitcrushBitDepth}
                                            onInput={event => setBitcrushBitDepth(event.currentTarget.value)}
                                        />
                                    </Label>
                                </div>
                                <button
                                    className={styles.dropdownSubmit}
                                    onClick={() => props.onBitcrush(bitcrushSampleRate, bitcrushBitDepth)}
                                >
                                    <FormattedMessage
                                        id="gui.soundEditor.applyEffect"
                                        description="Title of the button to apply the effect"
                                        defaultMessage="Apply"
                                    />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
            <div className={styles.infoRow}>
                <div className={styles.duration}>
                    {formatDuration(props.playhead, props.trimStart, props.trimEnd, props.duration)}
                </div>
                <div className={styles.advancedInfo}>
                    {props.size > SOUND_BYTE_LIMIT &&
                        <div className={classNames(styles.alert, styles.stereo)}>
                            <FormattedMessage
                                defaultMessage="Editing this sound will irreversibly lower its quality."
                                description="Message that appears when editing a large sound."
                                id="nb.sizeAlert"
                            />
                        </div>
                    }
                    <span>
                        {`${formatSampleRate(props.sampleRate)} `}
                        {props.isStereo ? (
                            <FormattedMessage
                                defaultMessage="Stereo"
                                description="Refers to a 'Stereo Sound' (2 channels)"
                                id="tw.stereo"
                            />
                        ) : (
                            <FormattedMessage
                                defaultMessage="Mono"
                                description="Refers to a 'Mono Sound' (1 channel)"
                                id="tw.mono"
                            />
                        )}
                        {` (${formatSoundSize(props.size)})`}
                    </span>
                </div>
            </div>
        </div>
    );
};

SoundEditor.propTypes = {
    isStereo: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    sampleRate: PropTypes.number.isRequired,
    canPaste: PropTypes.bool.isRequired,
    canRedo: PropTypes.bool.isRequired,
    canUndo: PropTypes.bool.isRequired,
    chunkLevels: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    intl: intlShape,
    name: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired,
    onContainerClick: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onCopyToNew: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onDeleteInverse: PropTypes.func,
    onBitcrush: PropTypes.func.isRequired,
    onEcho: PropTypes.func.isRequired,
    onFadeIn: PropTypes.func.isRequired,
    onFadeOut: PropTypes.func.isRequired,
    onFaster: PropTypes.func.isRequired,
    onFlip: PropTypes.func.isRequired,
    onLouder: PropTypes.func.isRequired,
    onMute: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onReverse: PropTypes.func.isRequired,
    onRobot: PropTypes.func.isRequired,
    onSetTrim: PropTypes.func,
    onSlower: PropTypes.func.isRequired,
    onSofter: PropTypes.func.isRequired,
    onSpeed: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onUpdatePlayhead: PropTypes.func.isRequired,
    onVolume: PropTypes.func.isRequired,
    onTimeStepMouseDown: PropTypes.func,
    playhead: PropTypes.number,
    playing: PropTypes.bool.isRequired,
    setRef: PropTypes.func,
    setTimeStepRef: PropTypes.func.isRequired,
    timeStepCount: PropTypes.number,
    timeStepWidth: PropTypes.number,
    timeStepTime: PropTypes.number,
    tooLoud: PropTypes.bool.isRequired,
    trimEnd: PropTypes.number,
    trimStart: PropTypes.number,
    onSetTrimChannel: PropTypes.func,
    trimChannel: PropTypes.arrayOf(PropTypes.bool),
    preferences: PropTypes.object
};

export default injectIntl(SoundEditor);
