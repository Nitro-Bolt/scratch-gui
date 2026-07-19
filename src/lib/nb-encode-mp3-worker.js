import {Mp3Encoder} from 'lamejs';

self.onmessage = event => {
    const {channel1Samples, channel2Samples, sampleRate, bitRate} = event.data;

    const encoder = new Mp3Encoder(
        1 + !!channel2Samples,
        sampleRate,
        bitRate
    );
    const chunks = [];

    const left = new Int16Array(channel1Samples.length);
    const right = new Int16Array(channel1Samples.length);

    // Channels must be converted from Float32Arrays to Int16Arrays to prevent registering as near-silence.
    // The encoder expects values between -32768 and 32767, and our arrays have values between -1.0 and 1.0.
    for (let i = 0; i < channel1Samples.length; i++) {
        const sample1 = Math.max(-1, Math.min(channel1Samples[i], 1));
        left[i] = sample1 < 0 ? sample1 * 0x8000 : sample1 * 0x7FFF;

        if (channel2Samples) {
            const sample2 = Math.max(-1, Math.min((channel2Samples)[i], 1));
            right[i] = sample2 < 0 ? sample2 * 0x8000 : sample2 * 0x7FFF;
        }
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

    self.postMessage(buffer);
};
