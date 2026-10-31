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
    'open-extension-manager': {ctrl: true, alt: true, key: 'e'},
    'open-extensions': {ctrl: true, shift: true, key: 'e'},
    'open-project': {ctrl: true, key: 'o'},
    'open-project-settings': {disabled: true},
    'open-source-control': {ctrl: true, shift: true, key: 'g'},
    'new-project': {ctrl: true, shift: true, key: 'n'},
    'new-window': {ctrl: true, alt: true, key: 'n'},
    'package-project': {ctrl: true, key: 'Enter'},
    'paint-select': {key: 's'},
    'paint-reshape': {key: 'a'},
    'paint-brush': {key: 'b'},
    'paint-pen': {key: 'p'},
    'paint-eraser': {key: 'e'},
    'paint-eyedropper': {key: 'i'},
    'paint-eyedropper-hold': {alt: true},
    'paint-fill': {key: 'f'},
    'paint-text': {key: 't'},
    'paint-line': {key: 'l'},
    'paint-oval': {key: 'c'},
    'paint-effect': {key: 'z'},
    'paint-polygon': {key: 'r'},
    'pause-project': {disabled: true},
    'project-full-screen': {key: 'F11'},
    'redo': {ctrl: true, shift: true, key: 'z'},
    'save': {ctrl: true, key: 's'},
    'start-project': {ctrl: true, key: ' '},
    'step-project': {disabled: true},
    'stop-project': {disabled: true},
    'tab-code': {ctrl: true, key: '1'},
    'tab-costumes': {ctrl: true, key: '2'},
    'tab-sounds': {ctrl: true, key: '3'},
    'tab-assets': {ctrl: true, key: '4'},
    'tab-variables': {ctrl: true, key: '5'},
    'toggle-sprite-visibility': {ctrl: true, key: 'h'},
    'undo': {ctrl: true, key: 'z'}
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
