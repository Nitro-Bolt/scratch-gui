import log from '../lib/log';
import serviceWorker from '!!file-loader?name=sw.js!./service-worker.js';

let loaded = false;
const actuallyLoadServiceWorker = () => {
    navigator.serviceWorker.register(serviceWorker)
        .catch(err => {
            log.error('sw error', err);
        });
};
const loadServiceWorker = () => {
    if (
        process.env.ENABLE_SERVICE_WORKER &&
        // there are weird browser extensions / configuration people can apply that leave:
        // `'serviceWorker' in navigator` as true, but register() is not a function. so we should guard
        // against those weird scenarios. Example is Windscribe's "Worker Block" option.
        navigator.serviceWorker &&
        typeof navigator.serviceWorker.register === 'function' &&
        !loaded
    ) {
        loaded = true;
        if (document.readyState === 'complete') {
            actuallyLoadServiceWorker();
        } else {
            window.addEventListener('load', actuallyLoadServiceWorker);
        }
    }
};

export {
    loadServiceWorker
};
