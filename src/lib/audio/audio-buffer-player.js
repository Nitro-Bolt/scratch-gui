import SharedAudioContext from './shared-audio-context.js';

class AudioBufferPlayer {
    constructor (channel1Samples, channel2Samples, sampleRate) {
        /**
         * @type {AudioContext}
         */
        this.audioContext = new SharedAudioContext();
        this.buffer = this.audioContext.createBuffer(1 + !!channel2Samples, channel1Samples.length, sampleRate);
        this.buffer.getChannelData(0).set(channel1Samples);
        if (channel2Samples) this.buffer.getChannelData(1).set(channel2Samples);
        this.source = null;

        this.startTime = null;
        this.updateCallback = null;
        this.trimStart = null;
        this.trimEnd = null;
    }

    play (trimStart, trimEnd, onUpdate, onEnded) {
        this.updateCallback = onUpdate;
        this.trimStart = Math.min(trimStart, trimEnd);
        this.trimEnd = Math.max(trimStart, trimEnd);
        this.startTime = Date.now();

        const trimStartTime = this.buffer.duration * Math.min(trimStart, trimEnd);
        const trimmedDuration = (this.buffer.duration * Math.max(trimStart, trimEnd)) - trimStartTime;

        this.source = this.audioContext.createBufferSource();
        this.source.onended = onEnded;
        this.source.buffer = this.buffer;
        this.source.connect(this.audioContext.destination);
        this.source.start(0, trimStartTime, trimmedDuration);

        this.update();
    }

    update () {
        const timeSinceStart = (Date.now() - this.startTime) / 1000;
        const percentage = timeSinceStart / this.buffer.duration;
        if (percentage + this.trimStart < this.trimEnd && this.source.onended) {
            requestAnimationFrame(this.update.bind(this));
            this.updateCallback(percentage + this.trimStart);
        } else {
            this.updateCallback = null;
        }
    }

    stop () {
        if (this.source) {
            this.source.onended = null; // Do not call onEnded callback if manually stopped
            try {
                this.source.stop();
            } catch (e) {
                // This is probably Safari, which dies when you call stop more than once
                // which the spec says is allowed: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
                console.log('Caught error while stopping buffer source node.'); // eslint-disable-line no-console
            }
        }
    }
}

export default AudioBufferPlayer;
