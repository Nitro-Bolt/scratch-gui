/* eslint-disable valid-jsdoc */
import EchoEffect from './effects/echo-effect.js';
import RobotEffect from './effects/robot-effect.js';
import VolumeEffect from './effects/volume-effect.js';
import FadeEffect from './effects/fade-effect.js';
import MuteEffect from './effects/mute-effect.js';

import {DefaultOpts} from './default-audio-effect-opts.js';

const effectTypes = {
    VOLUME: 'volume',
    FLIP: 'flip',
    BITCRUSH: 'bitcrush',
    ROBOT: 'robot',
    REVERSE: 'reverse',
    LOUDER: 'higher',
    SOFTER: 'lower',
    FASTER: 'faster',
    SLOWER: 'slower',
    ECHO: 'echo',
    FADEIN: 'fade in',
    FADEOUT: 'fade out',
    MUTE: 'mute'
};

class AudioEffects {
    static get effectTypes () {
        return effectTypes;
    }
    /**
     * @param {AudioBuffer} buffer
     */
    constructor (buffer, name, trimStart, trimEnd, trimChannel, opts) {
        const targetSampleRate = name === effectTypes.BITCRUSH ?
            (opts.sampleRate ?? DefaultOpts.sampleRate) :
            buffer.sampleRate;
        const conversionRatio = targetSampleRate / buffer.sampleRate;
        let sampleCount = Math.round(buffer.length / conversionRatio);

        this.trimStartSeconds = (trimStart * sampleCount) / targetSampleRate;
        this.trimEndSeconds = (trimEnd * sampleCount) / targetSampleRate;
        this.adjustedTrimStartSeconds = this.trimStartSeconds;
        this.adjustedTrimEndSeconds = this.trimEndSeconds;

        // Some effects will modify the playback rate and/or number of samples.
        // Need to precompute those values to create the offline audio context.
        const pitchRatio = Math.pow(2, 4 / 12); // A major third
        const affectedSampleCount = Math.floor((this.trimEndSeconds - this.trimStartSeconds) *
            targetSampleRate);
        let adjustedAffectedSampleCount = affectedSampleCount;
        const unaffectedSampleCount = sampleCount - affectedSampleCount;

        this.playbackRate = 1;
        switch (name) {
        case effectTypes.ECHO:
            sampleCount = Math.max(sampleCount,
                Math.floor((this.trimEndSeconds + (opts.tailSeconds ?? EchoEffect.TAIL_SECONDS)) * targetSampleRate));
            break;
        case effectTypes.FASTER:
            this.playbackRate = pitchRatio;
            adjustedAffectedSampleCount = Math.floor(affectedSampleCount / this.playbackRate);
            sampleCount = unaffectedSampleCount + adjustedAffectedSampleCount;

            break;
        case effectTypes.SLOWER:
            this.playbackRate = 1 / pitchRatio;
            adjustedAffectedSampleCount = Math.floor(affectedSampleCount / this.playbackRate);
            sampleCount = unaffectedSampleCount + adjustedAffectedSampleCount;
            break;
        }

        const durationSeconds = sampleCount / targetSampleRate;
        this.adjustedTrimEndSeconds = this.trimStartSeconds +
            (adjustedAffectedSampleCount / targetSampleRate);
        this.adjustedTrimStart = this.adjustedTrimStartSeconds / durationSeconds;
        this.adjustedTrimEnd = this.adjustedTrimEndSeconds / durationSeconds;

        if (window.OfflineAudioContext) {
            /**
             * @type {OfflineAudioContext}
             */
            this.audioContext = new window.OfflineAudioContext(
                2,
                sampleCount * (targetSampleRate / buffer.sampleRate),
                targetSampleRate
            );
        } else {
            // Need to use webkitOfflineAudioContext, which doesn't support all sample rates.
            // Resample by adjusting sample count to make room and set offline context to desired sample rate.
            const sampleScale = 44100 / targetSampleRate;
            this.audioContext = new window.webkitOfflineAudioContext(2, sampleScale * sampleCount, 44100);
        }

        // For the reverse effect we need to manually reverse the data into a new audio buffer
        // to prevent overwriting the original, so that the undo stack works correctly.
        // Doing buffer.reverse() would mutate the original data.
        if (name === effectTypes.REVERSE) {
            const originalBufferData = buffer.getChannelData(0);
            const originalBufferData2 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : null;
            const newBuffer = this.audioContext.createBuffer(2, buffer.length, buffer.sampleRate);
            const newBufferData = newBuffer.getChannelData(0);
            const newBufferData2 = newBuffer.getChannelData(1);
            const bufferLength = buffer.length;

            const startSamples = Math.floor(this.trimStartSeconds * buffer.sampleRate);
            const endSamples = Math.floor(this.trimEndSeconds * buffer.sampleRate);
            let counter = 0;
            for (let i = 0; i < bufferLength; i++) {
                if (i >= startSamples && i < endSamples) {
                    newBufferData[i] = originalBufferData[endSamples - counter - 1];
                    if (originalBufferData2) newBufferData2[i] = originalBufferData2[endSamples - counter - 1];
                    counter++;
                } else {
                    newBufferData[i] = originalBufferData[i];
                    if (originalBufferData2) newBufferData2[i] = originalBufferData2[i];
                }
            }
            this.buffer = newBuffer;
        } if (name === effectTypes.FLIP) {
            const originalBufferData = buffer.getChannelData(0);
            const originalBufferData2 = buffer.getChannelData(buffer.numberOfChannels - 1);
            const newBuffer = this.audioContext.createBuffer(2, buffer.length, buffer.sampleRate);
            const newBufferData = newBuffer.getChannelData(0);
            const newBufferData2 = newBuffer.getChannelData(1);
            const bufferLength = buffer.length;

            for (let i = 0; i < bufferLength; i++) {
                newBufferData[i] = originalBufferData2[i];
                newBufferData2[i] = originalBufferData[i];
            }

            this.buffer = newBuffer;
        } if (name === effectTypes.BITCRUSH) {
            const originalBufferData = buffer.getChannelData(0);
            const originalBufferData2 = buffer.getChannelData(buffer.numberOfChannels - 1);
            const newBuffer = this.audioContext.createBuffer(2, buffer.length, buffer.sampleRate);
            const newBufferData = newBuffer.getChannelData(0);
            const newBufferData2 = newBuffer.getChannelData(1);

            const bitDepth = opts.bitDepth ?? DefaultOpts.bitDepth;
            const steps = Math.pow(2, bitDepth) - 1;

            const startSamples = Math.floor(this.trimStartSeconds * buffer.sampleRate);
            const endSamples = Math.floor(this.trimEndSeconds * buffer.sampleRate);
            for (let i = 0; i < sampleCount; i++) {
                if (i >= startSamples && i < endSamples) {
                    newBufferData[i] = Math.round(originalBufferData[i] * steps) / steps;
                    newBufferData2[i] = Math.round(originalBufferData2[i] * steps) / steps;
                } else {
                    newBufferData[i] = originalBufferData[i];
                    newBufferData2[i] = originalBufferData2[i];
                }
            }
            this.buffer = newBuffer;
        } else {
            // All other effects use the original buffer because it is not modified.
            this.buffer = buffer;
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;
        this.name = name;
        this.opts = opts;

        // Matches [false, true] and [true, false]. We only need to split the channels if just one channel is modified.
        if (trimChannel[0] !== trimChannel[1]) {
            this.splitter = this.audioContext.createChannelSplitter(2);
            this.merger = this.audioContext.createChannelMerger(2);
            this.selectedChannel = 0 + trimChannel[1];
        }
    }
    process (done) {
        // Some effects need to use more nodes and must expose an input and output
        let input;
        let output;
        switch (this.name) {
        case effectTypes.FASTER:
        case effectTypes.SLOWER:
            this.source.playbackRate.setValueAtTime(this.playbackRate, this.adjustedTrimStartSeconds);
            this.source.playbackRate.setValueAtTime(1.0, this.adjustedTrimEndSeconds);
            break;
        case effectTypes.LOUDER:
            ({input, output} = new VolumeEffect(this.audioContext, 1.25,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        case effectTypes.SOFTER:
            ({input, output} = new VolumeEffect(this.audioContext, 0.75,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        case effectTypes.VOLUME:
            console.log(this.opts.volume);
            ({input, output} = this.opts.volume < 1 ? new MuteEffect(
                this.audioContext,
                this.adjustedTrimStartSeconds,
                this.adjustedTrimEndSeconds
            ) : new VolumeEffect(
                this.audioContext,
                (this.opts.volume ?? DefaultOpts.volume) / 100,
                this.adjustedTrimStartSeconds,
                this.adjustedTrimEndSeconds
            ));
            break;
        case effectTypes.ECHO:
            ({input, output} = new EchoEffect(this.audioContext,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        case effectTypes.ROBOT:
            ({input, output} = new RobotEffect(this.audioContext,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        case effectTypes.FADEIN:
            ({input, output} = new FadeEffect(this.audioContext, true,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        case effectTypes.FADEOUT:
            ({input, output} = new FadeEffect(this.audioContext, false,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        case effectTypes.MUTE:
            ({input, output} = new MuteEffect(this.audioContext,
                this.adjustedTrimStartSeconds, this.adjustedTrimEndSeconds));
            break;
        }

        if (input && output) {
            if (this.splitter) {
                this.source.connect(this.splitter);
                this.splitter.connect(input, this.selectedChannel);
                output.connect(this.merger, 0, this.selectedChannel);
                this.splitter.connect(this.merger, 1 - this.selectedChannel, 1 - this.selectedChannel);
                this.merger.connect(this.audioContext.destination);
            } else {
                this.source.connect(input);
                output.connect(this.audioContext.destination);
            }
        } else {
            // No effects nodes are needed, wire directly to the output
            this.source.connect(this.audioContext.destination);
        }

        this.source.start();

        this.audioContext.startRendering();
        this.audioContext.oncomplete = ({renderedBuffer}) => {
            done(renderedBuffer, this.adjustedTrimStart, this.adjustedTrimEnd);
        };

    }
}

export default AudioEffects;
