class TrembleEffect {
    constructor (audioContext, startSeconds, endSeconds) {
        this.audioContext = audioContext;

        this.input = this.audioContext.createGain();
        this.output = this.audioContext.createGain();

        const trembleGain = this.audioContext.createGain();
        trembleGain.gain.value = 0.5;

        const lfo = audioContext.createOscillator();
        lfo.type = 'sine';

        lfo.frequency.setValueAtTime(8, startSeconds);
        lfo.frequency.setValueAtTime(8, endSeconds);

        const lfoGain = audioContext.createGain();
        lfoGain.gain.value = 0.5;

        lfo.connect(lfoGain);
        lfoGain.connect(trembleGain.gain);

        lfo.start(startSeconds);
        lfo.stop(endSeconds);

        this.input.connect(trembleGain);
        trembleGain.connect(this.output);
    }
}

export default TrembleEffect;