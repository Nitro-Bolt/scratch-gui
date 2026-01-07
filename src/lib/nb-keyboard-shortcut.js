/* eslint-disable valid-jsdoc */

/**
 * @typedef {Object} KeyboardShortcut
 * @property {string} key
 * @property {boolean?} ctrl
 * @property {boolean?} alt
 * @property {boolean?} shift
 */

import {useCallback, useEffect} from 'react';

/**
 * @param {KeyboardShortcut} shortcut The shortcut required to run the callback
 * @param {((event: KeyboardEvent) => {})} callback What happens when key is pressed
 */
export const registerKeyboardShortcut = (shortcut, callback) => {
    const handleKeyboardEvent = useCallback((
        /**
         * @type {KeyboardEvent}
         */
        event
    ) => {
        const ctrl = navigator.userAgent.includes('Mac') ? event.metaKey : event.ctrlKey;

        if (
            !shortcut.ctrl &&
            !shortcut.alt &&
            event.key !== 'Escape' &&
            ['INPUT', 'TEXTAREA'].includes(event.target.tagName)
        ) return;

        if (
            (shortcut.key === event.key) &&
            (!!shortcut.ctrl === ctrl) &&
            (!!shortcut.alt === event.altKey) &&
            (!!shortcut.shift === event.shiftKey)) {

            event.preventDefault();
            callback(event);
        }
    }, [shortcut, callback]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyboardEvent);

        return (() => {
            document.removeEventListener('keydown', handleKeyboardEvent);
        });
    }, [handleKeyboardEvent]);
};
