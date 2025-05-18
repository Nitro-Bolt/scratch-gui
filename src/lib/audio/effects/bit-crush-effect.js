class BitCrushEffect {
    constructor(audioContext, startTime, endTime, bitCrush = 0.5, freqCrush = 0.5) {
        this.audioContext = audioContext;
        this.input = this.audioContext.createGain();
        this.output = this.audioContext.createGain();

        const bufferSize = 4096;
        const processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
        this.processor = processor;

        bitCrush = Math.max(0, Math.min(1, bitCrush));
        freqCrush = Math.max(0, Math.min(1, freqCrush));

        const bitCrushStrength = Math.abs(bitCrush - 0.5) * 2;
        const freqCrushStrength = Math.abs(freqCrush - 0.5) * 2;

        const maxBitDepth = 16;
        const minBitDepth = 1;
        const bitDepth = bitCrushStrength === 0
            ? 16
            : Math.max(minBitDepth, 16 - Math.floor(bitCrushStrength * (maxBitDepth - minBitDepth)));

        const maxHold = 100;
        const sampleHold = freqCrushStrength === 0
            ? 1
            : Math.floor(1 + freqCrushStrength * maxHold);

        const step = 1 / Math.pow(2, bitDepth);
        let holdCounter = 0;
        let lastSample = 0;

        processor.onaudioprocess = function (event) {
            const input = event.inputBuffer.getChannelData(0);
            const output = event.outputBuffer.getChannelData(0);

            for (let i = 0; i < input.length; i++) {
                if (holdCounter <= 0) {
                    holdCounter = sampleHold;
                    lastSample = step * Math.floor(input[i] / step + 0.5);
                } else {
                    holdCounter--;
                }
                output[i] = lastSample;
            }
        };

        this.effectGain = this.audioContext.createGain();
        this.effectGain.gain.setValueAtTime(0, startTime);
        this.effectGain.gain.linearRampToValueAtTime(1, startTime + 0.01);
        this.effectGain.gain.setValueAtTime(1, endTime - 0.01);
        this.effectGain.gain.linearRampToValueAtTime(0, endTime);

        this.dryGain = this.audioContext.createGain();
        this.wetGain = this.audioContext.createGain();

        this.input.connect(this.dryGain);
        this.input.connect(this.effectGain);
        this.effectGain.connect(processor);
        processor.connect(this.wetGain);

        this.dryGain.connect(this.output);
        this.wetGain.connect(this.output);
    }
}

export default BitCrushEffect;
