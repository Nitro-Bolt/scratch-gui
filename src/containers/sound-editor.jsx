import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {Mp3Encoder} from 'lamejs';
import VM from 'scratch-vm';

import {connect} from 'react-redux';

import {
    computeChunkedRMS,
    encodeAndAddSoundToVM,
    downsampleIfNeeded,
    dropEveryOtherSample
} from '../lib/audio/audio-util.js';
import AudioEffects from '../lib/audio/audio-effects.js';
import SoundEditorComponent from '../components/sound-editor/sound-editor.jsx';
import AudioBufferPlayer from '../lib/audio/audio-buffer-player.js';
import DragRecognizer from '../lib/drag-recognizer';
import {getEventXY} from '../lib/touch-utils';
import log from '../lib/log.js';

const UNDO_STACK_SIZE = 99;

const MAX_RMS = 1.2;

class SoundEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'copy',
            'copyCurrentBuffer',
            'handleCopyToNew',
            'handleStoppedPlaying',
            'handleChangeName',
            'handlePlay',
            'handlePause',
            'handleStopPlaying',
            'handleUpdatePlayhead',
            'handleSetTrimChannel',
            'handleTimeStepMouseDown',
            'handleTimeStepMouseMove',
            'handleTimeStepMouseUp',
            'handleDelete',
            'handleDeleteInverse',
            'handleUpdateTrim',
            'handleEffect',
            'handleUndo',
            'handleRedo',
            'submitNewSamples',
            'handleCopy',
            'handlePaste',
            'paste',
            'handleKeyPress',
            'handleContainerClick',
            'setRef',
            'setTimeStepRef',
            'resampleBufferToRate',
            'setTimeSteps'
        ]);
        this.state = {
            copyBuffer: null,
            chunkLevels: computeChunkedRMS([
                this.props.channel1Samples,
                this.props.channel2Samples
            ].filter(Boolean)),
            playhead: 0, // null is not playing, [0 -> 1] is playing percent
            trimStart: null,
            trimEnd: null,
            trimChannel: [false, false],
            playing: false,
            timeStepCount: 0,
            timeStepWidth: 0,
            timeStepTime: 0
        };

        this.timeStepDragRecognizer = new DragRecognizer({
            onDrag: this.handleTimeStepMouseMove,
            onDragEnd: this.handleTimeStepMouseUp,
            touchDragAngle: 90,
            distanceThreshold: 0
        });

        this.soundResizeObserver = new ResizeObserver(() => this.setTimeSteps(this.props.duration));

        this.redoStack = [];
        this.undoStack = [];

        this.ref = null;
    }
    componentDidMount () {
        this.audioBufferPlayer = new AudioBufferPlayer(
            this.props.channel1Samples,
            this.props.channel2Samples,
            this.props.sampleRate
        );

        document.addEventListener('keydown', this.handleKeyPress);

        this.soundResizeObserver.observe(this.timeStepRef);
    }
    componentWillReceiveProps (newProps) {
        if (newProps.soundId !== this.props.soundId) { // A different sound has been selected
            this.redoStack = [];
            this.undoStack = [];
            this.resetState(newProps.channel1Samples, newProps.channel2Samples, newProps.sampleRate);
            this.setState({
                trimStart: null,
                trimEnd: null,
                playing: false,
                playhead: 0
            });
        }
        if (newProps.duration !== this.props.duration) {
            this.setTimeSteps(newProps.duration);
        }
    }
    componentWillUnmount () {
        this.audioBufferPlayer.stop();

        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress (event) {
        if (event.target instanceof HTMLInputElement) {
            // Ignore keyboard shortcuts if a text input field is focused
            return;
        }
        if (this.props.isFullScreen) {
            // Ignore keyboard shortcuts if the stage is fullscreen mode
            return;
        }
        if (event.key === ' ') {
            event.preventDefault();
            if (this.state.playing) {
                this.handlePause();
            } else {
                this.handlePlay();
            }
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            if (event.shiftKey) {
                this.handleDeleteInverse();
            } else {
                this.handleDelete();
            }
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            this.handleUpdateTrim(null, null);
        }
        if (event.metaKey || event.ctrlKey) {
            if (event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (this.redoStack.length > 0) {
                    this.handleRedo();
                }
            } else if (event.key === 'z') {
                if (this.undoStack.length > 0) {
                    event.preventDefault();
                    this.handleUndo();
                }
            } else if (event.key === 'c') {
                event.preventDefault();
                this.handleCopy();
            } else if (event.key === 'v') {
                event.preventDefault();
                this.handlePaste();
            } else if (event.key === 'a') {
                event.preventDefault();
                this.handleUpdateTrim(0, 1);
            } else if (event.key === 'x') {
                event.preventDefault();
                this.handleCopy();
                this.handleDelete();
            }
        }
    }
    resetState (channel1Samples, channel2Samples, sampleRate) {
        this.audioBufferPlayer.stop();
        this.audioBufferPlayer = new AudioBufferPlayer(channel1Samples, channel2Samples, sampleRate);
        this.setState({
            chunkLevels: computeChunkedRMS([channel1Samples, channel2Samples].filter(Boolean))
        });
    }
    submitNewSamples (channel1Samples, channel2Samples, sampleRate, skipUndo) {
        return downsampleIfNeeded({channel1Samples, channel2Samples, sampleRate}, this.resampleBufferToRate)
            .then(({
                channel1Samples: newChannel1Samples,
                channel2Samples: newChannel2Samples,
                sampleRate: newSampleRate
            }) => {
                if (!skipUndo) {
                    this.redoStack = [];
                    if (this.undoStack.length >= UNDO_STACK_SIZE) {
                        this.undoStack.shift(); // Drop the first element off the array
                    }
                    this.undoStack.push(this.getUndoItem());
                }

                const encoder = new Mp3Encoder(2, newSampleRate, this.props.preferences['encoding-bit-rate'] ?? 128);
                const chunks = [];

                const left = new Int16Array(newChannel1Samples.length);
                const right = new Int16Array(newChannel1Samples.length);

                // Channels must be converted from Float32Arrays to Int16Arrays to prevent registering as near-silence.
                // The encoder expects values between -32768 and 32767, and our arrays have values between -1.0 and 1.0.
                for (let i = 0; i < newChannel1Samples.length; i++) {
                    const sample1 = Math.max(-1, Math.min(newChannel1Samples[i], 1));
                    const sample2 = Math.max(-1, Math.min((newChannel2Samples ?? newChannel1Samples)[i], 1));

                    left[i] = sample1 < 0 ? sample1 * 0x8000 : sample1 * 0x7FFF;
                    right[i] = sample2 < 0 ? sample2 * 0x8000 : sample2 * 0x7FFF;
                }

                const sampleBlockSize = 1152;

                for (let i = 0; i < left.length; i += sampleBlockSize) {
                    const leftChunk = left.subarray(i, i + sampleBlockSize);
                    const rightChunk = right.subarray(i, i + sampleBlockSize);
                    const buffer = encoder.encodeBuffer(leftChunk, rightChunk);
                    if (buffer.length > 0) {
                        chunks.push(buffer);
                    }
                }

                const flushed = encoder.flush();
                if (flushed.length > 0) {
                    chunks.push(flushed);
                }

                const buffer = new Int8Array(chunks.reduce((acc, arr) => acc + arr.byteLength, 0));
                let offset = 0;
                for (const chunk of chunks) {
                    buffer.set(chunk, offset);
                    offset += chunk.byteLength;
                }

                this.resetState(newChannel1Samples, newChannel2Samples, newSampleRate);
                this.props.vm.updateSoundBuffer(
                    this.props.soundIndex,
                    this.audioBufferPlayer.buffer,
                    new Uint8Array(buffer)
                );

                return true;
            })
            .catch(e => {
                // Encoding failed, or the sound was too large to save so edit is rejected
                log.error(`Encountered error while trying to encode sound update: ${e.message}`);
                return false; // Edit was not applied
            });
    }
    handlePlay () {
        this.audioBufferPlayer.stop();
        this.audioBufferPlayer.play(
            this.state.playhead || this.state.trimStart || 0,
            this.state.trimEnd || 1,
            this.handleUpdatePlayhead,
            this.handleStopPlaying);
        this.setState({
            playing: true
        });
    }
    handlePause () {
        this.audioBufferPlayer.stop();
        this.setState({playing: false});
    }
    handleStopPlaying () {
        this.handleStoppedPlaying();
        this.setState({playhead: this.state.trimStart ?? 0});
    }
    handleStoppedPlaying () {
        this.audioBufferPlayer.stop();
        this.setState({playing: false});
    }
    handleUpdatePlayhead (playhead) {
        this.setState({playhead});
    }
    handleSetTrimChannel (trimChannel) {
        this.setState({trimChannel});
    }
    handleChangeName (name) {
        this.props.vm.renameSound(this.props.soundIndex, name);
    }
    handleDelete () {
        const {channel1Samples, channel2Samples, sampleRate} = this.copyCurrentBuffer();
        const sampleCount = channel1Samples.length;
        const startIndex = Math.floor(this.state.trimStart * sampleCount);
        const endIndex = Math.floor(this.state.trimEnd * sampleCount);
        const firstPart = channel1Samples.slice(0, startIndex);
        const secondPart = channel1Samples.slice(endIndex, sampleCount);
        const firstPart2 = channel2Samples.slice(0, startIndex);
        const secondPart2 = channel2Samples.slice(endIndex, sampleCount);
        const newLength = firstPart.length + secondPart.length;
        let newSamples;
        let newSamples2;
        if (newLength === 0) {
            newSamples = new Float32Array(1);
            newSamples2 = new Float32Array(1);
        } else {
            newSamples = new Float32Array(newLength);
            newSamples.set(firstPart, 0);
            newSamples.set(secondPart, firstPart.length);
            newSamples2 = new Float32Array(newLength);
            newSamples2.set(firstPart2, 0);
            newSamples2.set(secondPart2, firstPart2.length);
        }
        this.submitNewSamples(newSamples, newSamples2, sampleRate).then(() => {
            this.setState({
                trimStart: null,
                trimEnd: null
            });
        });
    }
    handleDeleteInverse () {
        // Delete everything outside of the trimmers
        const {channel1Samples, channel2Samples, sampleRate} = this.copyCurrentBuffer();
        const sampleCount = channel1Samples.length;
        const startIndex = Math.floor(this.state.trimStart * sampleCount);
        const endIndex = Math.floor(this.state.trimEnd * sampleCount);
        let clippedSamples = channel1Samples.slice(startIndex, endIndex);
        let clippedSamples2 = channel2Samples.slice(startIndex, endIndex);
        if (clippedSamples.length === 0) {
            clippedSamples = new Float32Array(1);
            clippedSamples2 = new Float32Array(1);
        }
        this.submitNewSamples(clippedSamples, clippedSamples2, sampleRate).then(success => {
            if (success) {
                this.setState({
                    trimStart: null,
                    trimEnd: null
                });
            }
        });
    }
    handleUpdateTrim (trimStart, trimEnd) {
        this.setState({trimStart, trimEnd});
        this.handleStoppedPlaying();
        if (trimStart !== null) this.handleUpdatePlayhead(trimStart);
    }
    handleTimeStepMouseDown (e) {
        this.handleStoppedPlaying();
        this.handleTimeStepMouseMove(e);
        this.timeStepDragRecognizer.start(e);
        e.preventDefault();
    }
    handleTimeStepMouseMove (e) {
        const {width, left} = this.timeStepRef.getBoundingClientRect();
        this.setState({playhead:
            Math.max(
                Math.min(
                    ((getEventXY(e).x ?? e.x) - left) / width,
                    this.state.trimEnd ?? 1
                ),
                this.state.trimStart ?? 0
            )
        });
        this.containerSize = width;
    }
    handleTimeStepMouseUp () {
        this.timeStepDragRecognizer.reset();
    }
    effectFactory (name, opts) {
        return () => this.handleEffect(name, opts);
    }
    copyCurrentBuffer () {
        // Cannot reliably use props.samples because it gets detached by Firefox
        return {
            channel1Samples: this.audioBufferPlayer.buffer.getChannelData(0),
            channel2Samples: this.audioBufferPlayer.buffer.numberOfChannels > 1 ?
                this.audioBufferPlayer.buffer.getChannelData(1) : null,
            sampleRate: this.audioBufferPlayer.buffer.sampleRate
        };
    }
    handleEffect (name, opts) {
        opts = opts ?? {};

        const trimStart = this.state.trimStart === null ? 0.0 : this.state.trimStart;
        const trimEnd = this.state.trimEnd === null ? 1.0 : this.state.trimEnd;
        const trimChannel = this.state.trimChannel;

        // Offline audio context needs at least 2 samples
        if (this.audioBufferPlayer.buffer.length < 2) {
            return;
        }

        const effects = new AudioEffects(this.audioBufferPlayer.buffer, name, trimStart, trimEnd, trimChannel, opts);
        effects.process((renderedBuffer, adjustedTrimStart, adjustedTrimEnd) => {
            const channel1Samples = renderedBuffer.getChannelData(0);
            const channel2Samples = renderedBuffer.numberOfChannels > 1 ? renderedBuffer.getChannelData(1) : null;
            const sampleRate = renderedBuffer.sampleRate;
            this.submitNewSamples(channel1Samples, channel2Samples, sampleRate).then(success => {
                if (success) {
                    if (this.state.trimStart === null) {
                        this.handlePlay();
                    } else {
                        this.setState({trimStart: adjustedTrimStart, trimEnd: adjustedTrimEnd}, this.handlePlay);
                    }
                }
            });
        });
    }
    tooLoud () {
        const numChunks = this.state.chunkLevels.length;
        const startIndex = this.state.trimStart === null ?
            0 : Math.floor(this.state.trimStart * numChunks);
        const endIndex = this.state.trimEnd === null ?
            numChunks - 1 : Math.ceil(this.state.trimEnd * numChunks);
        const trimChunks = this.state.chunkLevels.slice(startIndex, endIndex);
        let max = 0;
        for (const i of trimChunks) {
            if (i > max) {
                max = i;
            }
        }
        return max > MAX_RMS;
    }
    getUndoItem () {
        return {
            ...this.copyCurrentBuffer(),
            trimStart: this.state.trimStart,
            trimEnd: this.state.trimEnd
        };
    }
    handleUndo () {
        this.redoStack.push(this.getUndoItem());
        const {channel1Samples, channel2Samples, sampleRate, trimStart, trimEnd} = this.undoStack.pop();
        if (channel1Samples) {
            return this.submitNewSamples(
                channel1Samples,
                channel2Samples ?? channel1Samples,
                sampleRate,
                true
            ).then(success => {
                if (success) {
                    this.setState({trimStart: trimStart, trimEnd: trimEnd}, this.handlePlay);
                }
            });
        }
    }
    handleRedo () {
        const {channel1Samples, channel2Samples, sampleRate, trimStart, trimEnd} = this.redoStack.pop();
        if (channel1Samples) {
            this.undoStack.push(this.getUndoItem());
            return this.submitNewSamples(
                channel1Samples,
                channel2Samples ?? channel1Samples,
                sampleRate,
                true
            ).then(success => {
                if (success) {
                    this.setState({trimStart: trimStart, trimEnd: trimEnd}, this.handlePlay);
                }
            });
        }
    }
    handleCopy () {
        this.copy();
    }
    copy (callback) {
        const trimStart = this.state.trimStart === null ? 0.0 : this.state.trimStart;
        const trimEnd = this.state.trimEnd === null ? 1.0 : this.state.trimEnd;

        const newCopyBuffer = this.copyCurrentBuffer();
        const trimStartSamples = trimStart * newCopyBuffer.channel1Samples.length;
        const trimEndSamples = trimEnd * newCopyBuffer.channel1Samples.length;
        newCopyBuffer.channel1Samples = newCopyBuffer.channel1Samples.slice(trimStartSamples, trimEndSamples);
        newCopyBuffer.channel2Samples = newCopyBuffer.channel2Samples.slice(trimStartSamples, trimEndSamples);

        this.setState({
            copyBuffer: newCopyBuffer
        }, callback);
    }
    handleCopyToNew () {
        this.copy(() => {
            encodeAndAddSoundToVM(this.props.vm, this.props.preferences, this.state.copyBuffer.channel1Samples,
                this.state.copyBuffer.channel2Samples, this.state.copyBuffer.sampleRate, this.props.name);
        });
    }
    resampleBufferToRate (buffer, newRate) {
        return new Promise((resolve, reject) => {
            const sampleRateRatio = newRate / buffer.sampleRate;
            const newLength = sampleRateRatio * buffer.channel1Samples.length;
            /**
             * @type {OfflineAudioContext}
             */
            let offlineContext;
            // Try to use either OfflineAudioContext or webkitOfflineAudioContext to resample
            // The constructors will throw if trying to resample at an unsupported rate
            // (e.g. Safari/webkitOAC does not support lower than 44khz).
            try {
                if (window.OfflineAudioContext) {
                    offlineContext = new window.OfflineAudioContext(2, newLength, newRate);
                } else if (window.webkitOfflineAudioContext) {
                    offlineContext = new window.webkitOfflineAudioContext(2, newLength, newRate);
                }
            } catch {
                // If no OAC available and downsampling by 2, downsample by dropping every other sample.
                if (newRate === buffer.sampleRate / 2) {
                    return resolve(dropEveryOtherSample(buffer));
                }
                return reject(new Error('Could not resample'));
            }
            const source = offlineContext.createBufferSource();
            const audioBuffer = offlineContext.createBuffer(2, buffer.channel1Samples.length, buffer.sampleRate);
            audioBuffer.getChannelData(0).set(buffer.channel1Samples);
            audioBuffer.getChannelData(1).set(buffer.channel2Samples);
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start();
            offlineContext.startRendering();
            offlineContext.oncomplete = ({renderedBuffer}) => {
                resolve({
                    channel1Samples: renderedBuffer.getChannelData(0),
                    channel2Samples: renderedBuffer.getChannelData(1),
                    sampleRate: newRate
                });
            };
        });
    }
    paste () {
        // If there's no selection, paste at the end of the sound
        const {channel1Samples, channel2Samples} = this.copyCurrentBuffer();
        if (this.state.trimStart === null) {
            const newLength = channel1Samples.length + this.state.copyBuffer.channel1Samples.length;
            const newSamples = new Float32Array(newLength);
            newSamples.set(channel1Samples, 0);
            newSamples.set(this.state.copyBuffer.channel1Samples, channel1Samples.length);
            const newSamples2 = new Float32Array(newLength);
            newSamples2.set(channel2Samples, 0);
            newSamples2.set(this.state.copyBuffer.channel2Samples, channel2Samples.length);
            this.submitNewSamples(newSamples, newSamples2, this.props.sampleRate, false).then(success => {
                if (success) {
                    this.handlePlay();
                }
            });
        } else {
            // else replace the selection with the pasted sound
            const trimStartSamples = this.state.trimStart * channel1Samples.length;
            const trimEndSamples = this.state.trimEnd * channel1Samples.length;
            const firstPart = channel1Samples.slice(0, trimStartSamples);
            const lastPart = channel1Samples.slice(trimEndSamples);
            const firstPart2 = channel2Samples.slice(0, trimStartSamples);
            const lastPart2 = channel2Samples.slice(trimEndSamples);
            const newLength = firstPart.length + this.state.copyBuffer.channel1Samples.length + lastPart.length;
            const newSamples = new Float32Array(newLength);
            newSamples.set(firstPart, 0);
            newSamples.set(this.state.copyBuffer.channel1Samples, firstPart.length);
            newSamples.set(lastPart, firstPart.length + this.state.copyBuffer.channel1Samples.length);
            const newSamples2 = new Float32Array(newLength);
            newSamples2.set(firstPart2, 0);
            newSamples2.set(this.state.copyBuffer.channel2Samples, firstPart2.length);
            newSamples2.set(lastPart2, firstPart2.length + this.state.copyBuffer.channel2Samples.length);

            const trimStartSeconds = trimStartSamples / this.props.sampleRate;
            const trimEndSeconds = trimStartSeconds +
                (this.state.copyBuffer.channel1Samples.length / this.state.copyBuffer.sampleRate);
            const newDurationSeconds = newSamples.length / this.state.copyBuffer.sampleRate;
            const adjustedTrimStart = trimStartSeconds / newDurationSeconds;
            const adjustedTrimEnd = trimEndSeconds / newDurationSeconds;
            this.submitNewSamples(newSamples, newSamples2, this.props.sampleRate, false).then(success => {
                if (success) {
                    this.setState({
                        trimStart: adjustedTrimStart,
                        trimEnd: adjustedTrimEnd
                    }, this.handlePlay);
                }
            });
        }
    }
    handlePaste () {
        if (!this.state.copyBuffer) return;
        if (this.state.copyBuffer.sampleRate === this.props.sampleRate) {
            this.paste();
        } else {
            this.resampleBufferToRate(this.state.copyBuffer, this.props.sampleRate).then(buffer => {
                this.setState({
                    copyBuffer: buffer
                }, this.paste);
            });
        }

    }
    setRef (element) {
        this.ref = element;
    }
    setTimeStepRef (el) {
        this.timeStepRef = el;
    }
    handleContainerClick (e) {
        // If the click is on the sound editor's div (and not any other element), delesect
        if (e.target === this.ref && this.state.trimStart !== null) {
            this.handleUpdateTrim(null, null);
        }
    }
    setTimeSteps (duration) {
        if (!this.timeStepRef) return;
        const stepOptions = [0.125, 0.25, 0.5, 2.5, 5, 15, 30, 60];
        const {width} = this.timeStepRef.getBoundingClientRect();
        let stepOption;
        for (let i = stepOptions.length - 1; i >= 0; i--) {
            if (stepOptions[i] * width / duration > 50) stepOption = stepOptions[i];
        }
        this.setState({
            timeStepCount: Math.ceil(width / (stepOption * width / duration)),
            timeStepWidth: stepOption * width / duration,
            timeStepTime: stepOption
        });
    }
    render () {
        const {effectTypes} = AudioEffects;
        return (
            <SoundEditorComponent
                isStereo={this.props.isStereo}
                duration={this.props.duration}
                size={this.props.size}
                sampleRate={this.props.sampleRate}
                canPaste={this.state.copyBuffer !== null}
                canRedo={this.redoStack.length > 0}
                canUndo={this.undoStack.length > 0}
                chunkLevels={this.state.chunkLevels}
                name={this.props.name}
                playhead={this.state.playhead}
                playing={this.state.playing}
                setRef={this.setRef}
                setTimeStepRef={this.setTimeStepRef}
                tooLoud={this.tooLoud()}
                trimEnd={this.state.trimEnd}
                trimStart={this.state.trimStart}
                trimChannel={this.state.trimChannel}
                onSetTrimChannel={this.handleSetTrimChannel}
                onChangeName={this.handleChangeName}
                onContainerClick={this.handleContainerClick}
                onCopy={this.handleCopy}
                onCopyToNew={this.handleCopyToNew}
                onDelete={this.handleDelete}
                onDeleteInverse={this.handleDeleteInverse}
                // eslint-disable-next-line react/jsx-no-bind
                onBitcrush={(sampleRate, bitDepth) => this.handleEffect(effectTypes.BITCRUSH, {
                    sampleRate,
                    bitDepth
                })}
                onEcho={this.effectFactory(effectTypes.ECHO)}
                onFadeIn={this.effectFactory(effectTypes.FADEIN)}
                onFadeOut={this.effectFactory(effectTypes.FADEOUT)}
                onFaster={this.effectFactory(effectTypes.FASTER)}
                onFlip={this.effectFactory(effectTypes.FLIP)}
                onLouder={this.effectFactory(effectTypes.LOUDER)}
                onMute={this.effectFactory(effectTypes.MUTE)}
                onPaste={this.handlePaste}
                onPlay={this.handlePlay}
                onPause={this.handlePause}
                onRedo={this.handleRedo}
                onReverse={this.effectFactory(effectTypes.REVERSE)}
                onRobot={this.effectFactory(effectTypes.ROBOT)}
                onSetTrim={this.handleUpdateTrim}
                onSlower={this.effectFactory(effectTypes.SLOWER)}
                onSofter={this.effectFactory(effectTypes.SOFTER)}
                onStop={this.handleStopPlaying}
                onUndo={this.handleUndo}
                onUpdatePlayhead={this.handleUpdatePlayhead}
                // eslint-disable-next-line react/jsx-no-bind
                onVolume={volume => this.handleEffect(effectTypes.VOLUME, {
                    volume
                })}
                onTimeStepMouseDown={this.handleTimeStepMouseDown}
                timeStepCount={this.state.timeStepCount}
                timeStepWidth={this.state.timeStepWidth}
                timeStepTime={this.state.timeStepTime}
                preferences={this.props.preferences}
            />
        );
    }
}

SoundEditor.propTypes = {
    isStereo: PropTypes.bool,
    duration: PropTypes.number,
    size: PropTypes.number,
    isFullScreen: PropTypes.bool,
    name: PropTypes.string.isRequired,
    sampleRate: PropTypes.number,
    channel1Samples: PropTypes.instanceOf(Float32Array),
    channel2Samples: PropTypes.instanceOf(Float32Array),
    soundId: PropTypes.string,
    soundIndex: PropTypes.number,
    preferences: PropTypes.object,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state, {soundIndex}) => {
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    // Make sure the sound index doesn't go out of range.
    const index = soundIndex < sprite.sounds.length ? soundIndex : sprite.sounds.length - 1;
    const sound = state.scratchGui.vm.editingTarget.sprite.sounds[index];
    const audioBuffer = state.scratchGui.vm.getSoundBuffer(index);
    return {
        isStereo: audioBuffer.numberOfChannels !== 1,
        duration: sound.sampleCount / sound.rate,
        size: sound.asset ? sound.asset.data.byteLength : 0,
        soundId: sound.soundId,
        sampleRate: audioBuffer.sampleRate,
        channel1Samples: audioBuffer.getChannelData(0),
        channel2Samples: audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null,
        isFullScreen: state.scratchGui.mode.isFullScreen,
        name: sound.name,
        vm: state.scratchGui.vm
    };
};

export default connect(
    mapStateToProps
)(SoundEditor);
