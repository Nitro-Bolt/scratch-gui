class PitchEffect {
    constructor (audioContext, faster, startSeconds, endSeconds) {
        this.audioContext = audioContext;

        this.input = this.audioContext.createGain();
        this.output = this.audioContext.createGain();
        
        this.gain = this.audioContext.createGain();
        
        if (faster) {

        } else {

        }
    }
}

export default PitchEffect;