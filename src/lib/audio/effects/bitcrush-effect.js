// eslint-disable-next-line require-jsdoc
const resampleBufferToRate = (buffer, newRate) => new Promise((resolve, reject) => {
    console.log(buffer);
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

class BitcrushEffect {
    constructor (audioContext, buffer, startSeconds, endSeconds, done) {
        console.log(':]');
        this.audioContext = audioContext;

        const originalBufferData = buffer.getChannelData(0);
        const originalBufferData2 = buffer.getChannelData(1);
        const newBuffer = this.audioContext.createBuffer(2, buffer.length, buffer.sampleRate);
        const newBufferData = newBuffer.getChannelData(0);
        const newBufferData2 = newBuffer.getChannelData(1);
        const bufferLength = buffer.length;

        const bitDepth = 3;
        const steps = Math.pow(2, bitDepth) - 1;

        const startSamples = Math.floor(startSeconds * buffer.sampleRate);
        const endSamples = Math.floor(endSeconds * buffer.sampleRate);
        for (let i = 0; i < bufferLength; i++) {
            if (i >= startSamples && i < endSamples) {
                newBufferData[i] = Math.round(originalBufferData[i] * steps) / steps;
                newBufferData2[i] = Math.round(originalBufferData2[i] * steps) / steps;
            } else {
                newBufferData[i] = originalBufferData[i];
                newBufferData2[i] = originalBufferData2[i];
            }
        }
        this.buffer = newBuffer;
        resampleBufferToRate({
            channel1Samples: newBufferData,
            channel2Samples: newBufferData2,
            sampleRate: buffer.sampleRate
        }, 11025).then(resampledBuffer => {
            console.log('done!', resampledBuffer);
            done(this.audioContext, resampledBuffer);
        });
    }
}

export default BitcrushEffect;
