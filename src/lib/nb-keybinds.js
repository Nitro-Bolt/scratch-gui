/* eslint-disable valid-jsdoc */

/**
 * @typedef {Object} Keybind
 * @property {string} key
 * @property {boolean?} ctrl
 * @property {boolean?} alt
 * @property {boolean?} shift
 */

import {useCallback, useEffect} from 'react';

/**
 * @type {{[key: string]: Keybind}}
 */
export const defaultKeybinds = {
    'block-zoom-in': {ctrl: true, key: '='},
    'block-zoom-out': {ctrl: true, key: '-'},
    'change-sprite-name': {key: 'F2'},
    'create-comment': {ctrl: true, key: '/'},
    'create-group': {ctrl: true, key: 'g'},
    'hide-stage': {ctrl: true, key: 'b'},
    'open-backpack': {ctrl: true, shift: true, key: 'b'},
    'open-debugger': {ctrl: true, shift: true, key: 'd'},
    'open-editor-settings': {ctrl: true, key: ','},
    'open-extensions': {ctrl: true, shift: true, key: 'e'},
    'open-project': {ctrl: true, key: 'o'},
    'new-project': {ctrl: true, shift: true, key: 'n'},
    'new-window': {ctrl: true, alt: true, key: 'n'},
    'package-project': {ctrl: true, key: 'Enter'},
    'pause-project': {ctrl: true, shift: true, key: ' '},
    'project-full-screen': {alt: true, key: 'Enter'},
    'save': {ctrl: true, key: 's'},
    'start-project': {ctrl: true, key: ' '},
    'step-project': {ctrl: true, shift: true, alt: true, key: ' '},
    'stop-project': {ctrl: true, alt: true, key: ' '},
    'toggle-sprite-visibility': {ctrl: true, key: 'h'}
};

/**
 * @param {Keybind} shortcut The shortcut required to run the callback
 * @param {((event: KeyboardEvent) => {})} callback What happens when key is pressed
 */
export const registerKeybind = (shortcut, callback) => {
    const handleKeyboardEvent = useCallback((
        /**
         * @type {KeyboardEvent}
         */
        event
    ) => {
        // eslint-disable-next-line no-undefined
        if ([null, undefined].includes(shortcut)) return;
        if (shortcut.disabled) return;

        const ctrl = navigator.userAgent.includes('Mac') ? event.metaKey : event.ctrlKey;

        if (
            !shortcut.ctrl &&
            !shortcut.alt &&
            event.key !== 'Escape' &&
            ['INPUT', 'TEXTAREA'].includes(event.target.tagName)
        ) return;

        if (
            (shortcut.key.toString().toLowerCase() === event.key.toString().toLowerCase()) &&
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
