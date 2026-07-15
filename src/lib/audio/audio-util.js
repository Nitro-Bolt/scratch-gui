import {Mp3Encoder} from 'lamejs';

export const SOUND_BYTE_LIMIT = 100 * 1000 * 1000; // 100mb

const _computeRMS = function (samples, start, end, scaling = 0.55) {
    const length = end - start;
    if (length === 0) return 0;
    // Calculate RMS, adapted from https://github.com/Tonejs/Tone.js/blob/master/Tone/component/Meter.js#L88
    let sum = 0;
    for (let i = start; i < end; i++) {
        const sample = samples[i];
        sum += sample ** 2;
    }
    const rms = Math.sqrt(sum / length);
    const val = rms / scaling;
    return Math.sqrt(val);
};

const computeRMS = (samples, scaling) => _computeRMS(samples, 0, samples.length, scaling);

const computeChunkedRMS = function (channels, chunkSize = 1024) {
    const channelChunkLevels = [];
    for (const channel of channels) {
        const sampleCount = channel.length;
        const chunkLevels = [];
        for (let i = 0; i < sampleCount; i += chunkSize) {
            const maxIndex = Math.min(sampleCount, i + chunkSize);
            // Take the average of the two audio channels
            chunkLevels.push(_computeRMS(channel, i, maxIndex));
        }
        channelChunkLevels.push(chunkLevels);
    }
    return channelChunkLevels;
};

const encodeAndAddSoundToVM = function (vm, channel1Samples, channel2Samples, sampleRate, name, callback) {
    const encoder = new Mp3Encoder(2, sampleRate, 256);
    const chunks = [];

    const left = new Int16Array(channel1Samples.length);
    const right = new Int16Array(channel1Samples.length);

    // Channels must be converted from Float32Arrays to Int16Arrays to prevent registering as near-silence.
    // The encoder expects values between -32768 and 32767, and our arrays have values between -1.0 and 1.0.
    for (let i = 0; i < channel1Samples.length; i++) {
        const sample1 = Math.max(-1, Math.min(channel1Samples[i], 1));
        const sample2 = Math.max(-1, Math.min((channel2Samples ?? channel1Samples)[i], 1));

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

    const vmSound = {
        format: '',
        dataFormat: 'mp3',
        rate: sampleRate,
        sampleCount: channel1Samples.length
    };

    // Create an asset from the encoded .wav and get resulting md5
    const storage = vm.runtime.storage;
    vmSound.asset = storage.createAsset(
        storage.AssetType.Sound,
        storage.DataFormat.MP3,
        new Uint8Array(buffer),
        null,
        true // generate md5
    );
    vmSound.assetId = vmSound.asset.assetId;

    // update vmSound object with md5 property
    vmSound.md5 = `${vmSound.assetId}.${vmSound.dataFormat}`;
    // The VM will update the sound name to a fresh name
    vmSound.name = name;

    vm.addSound(vmSound).then(() => {
        if (callback) callback();
    });
};

/**
 @typedef SoundBuffer
 @type {Object}
 @property {Float32Array} samples Array of audio samples
 @property {number} sampleRate Audio sample rate
 */

/**
 * Downsample the given buffer to try to reduce file size below SOUND_BYTE_LIMIT
 * @param {SoundBuffer} buffer - Buffer to resample
 * @param {function(SoundBuffer):Promise<SoundBuffer>} resampler - resampler function
 * @returns {SoundBuffer} Downsampled buffer with half the sample rate
 */
const downsampleIfNeeded = (buffer, resampler) => {
    const {channel1Samples, channel2Samples, sampleRate} = buffer;
    const encodedByteLength = channel1Samples.length * 2; /* bitDepth 16 bit */
    // Resolve immediately if already within byte limit
    if (encodedByteLength < SOUND_BYTE_LIMIT) {
        return Promise.resolve({channel1Samples, channel2Samples, sampleRate});
    }
    // TW: Don't check if the sound will still fit at this reduced sample rate.
    // Instead the GUI will show a warning if it's too large.
    return resampler({channel1Samples, channel2Samples, sampleRate}, 22050);
};

/**
 * Drop every other sample of an audio buffer as a last-resort way of downsampling.
 * @param {SoundBuffer} buffer - Buffer to resample
 * @returns {SoundBuffer} Downsampled buffer with half the sample rate
 */
const dropEveryOtherSample = buffer => {
    const newLength = Math.floor(buffer.channel1Samples.length / 2);
    const newSamples = new Float32Array(newLength);
    let newSamples2 = null;
    if (buffer.channel2Samples) newSamples2 = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
        newSamples[i] = buffer.channel1Samples[i * 2];
        if (buffer.channel2Samples) newSamples2[i] = buffer.channel2Samples[i * 2];
    }
    return {
        channel1Samples: newSamples,
        channel2Samples: newSamples2,
        sampleRate: buffer.sampleRate / 2
    };
};

export {
    computeRMS,
    computeChunkedRMS,
    encodeAndAddSoundToVM,
    downsampleIfNeeded,
    dropEveryOtherSample
};
