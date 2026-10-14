export default class EncoderWorker extends Worker {
    constructor () {
        super(new URL('./nb-encode-mp3-worker.js', import.meta.url));
    }
}
