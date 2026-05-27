import {FFmpeg as _FFMpeg} from '@ffmpeg/ffmpeg';
import {toBlobURL} from '@ffmpeg/util';

const FFmpeg = {
    ..._FFMpeg,
    async load () {
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
        _FFMpeg.on('log', ({message}) => {
            console.log(message);
        });
        await _FFMpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        });
    }
};

export default FFmpeg;
