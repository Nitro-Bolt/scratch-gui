class MegaphoneEffect {
    constructor (audioContext, startSeconds, endSeconds) {
        this.audioContext = audioContext;

        this.input = this.audioContext.createGain();
        this.output = this.audioContext.createGain();

        this.effect = this.audioContext.createBiquadFilter();
        this.effect.type = "bandpass";
        this.effect.frequency.value = 1000;
        this.effect.Q.value = 0.7;

        this.effect.frequency.setValueAtTime(1000, startSeconds);
        this.effect.frequency.setValueAtTime(1000, endSeconds);

        this.input.connect(this.effect);
        this.effect.connect(this.output);
    }
}

export default MegaphoneEffect;