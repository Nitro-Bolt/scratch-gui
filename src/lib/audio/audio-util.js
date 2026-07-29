// eslint-disable-next-line import/default
import EncoderWorker from 'worker-loader!../nb-encode-mp3-worker.js';

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

const encodeAndAddSoundToVM = function (
    vm,
    preferences,
    channel1Samples,
    channel2Samples,
    sampleRate,
    name,
    callback,
    targetId
) {
    return new Promise((resolve, reject) => {
        const encoderWorker = new EncoderWorker();
        encoderWorker.onerror = event => {
            reject(event);
        };
        encoderWorker.onmessage = ({data}) => {
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
                new Uint8Array(data),
                null,
                true // generate md5
            );
            vmSound.assetId = vmSound.asset.assetId;

            // update vmSound object with md5 property
            vmSound.md5 = `${vmSound.assetId}.${vmSound.dataFormat}`;
            // The VM will update the sound name to a fresh name
            vmSound.name = name;

            vm.addSound(vmSound, targetId).then(
                () => resolve(callback ? callback() : null),
                reject
            );
        };
        encoderWorker.postMessage({
            channel1Samples,
            channel2Samples,
            sampleRate,
            bitRate: preferences['encoding-bit-rate'] ?? 128
        });
    });
};

/**
 @typedef SoundBuffer
 @type {Object}
 @property {Float32Array} samples Array of audio samples
 @property {number} sampleRate Audio sample rate
 */

/**
 * NB: The only limit is the user's computer. This function immediately resolves the buffer.
 * @param {SoundBuffer} buffer - Buffer to resample
 * @param {function(SoundBuffer):Promise<SoundBuffer>} resampler - resampler function
 * @returns {SoundBuffer} Downsampled buffer with half the sample rate
 */
// eslint-disable-next-line no-unused-vars
const downsampleIfNeeded = (buffer, resampler) => {
    const {channel1Samples, channel2Samples, sampleRate} = buffer;
    return Promise.resolve({channel1Samples, channel2Samples, sampleRate});
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
