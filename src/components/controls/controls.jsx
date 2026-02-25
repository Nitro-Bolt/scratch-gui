import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import GreenFlag from '../green-flag/green-flag.jsx';
import StopAll from '../stop-all/stop-all.jsx';
import TurboMode from '../turbo-mode/turbo-mode.jsx';
import FramerateIndicator from '../tw-framerate-indicator/framerate-indicator.jsx';

import styles from './controls.css';
import { defaultKeyboardShortcuts, registerKeyboardShortcut } from '../../lib/nb-keyboard-shortcut.js';

const messages = defineMessages({
    goTitle: {
        id: 'gui.controls.go',
        defaultMessage: 'Go',
        description: 'Green flag button title'
    },
    stopTitle: {
        id: 'gui.controls.stop',
        defaultMessage: 'Stop',
        description: 'Stop button title'
    }
});

const Controls = function (props) {
    const {
        active,
        className,
        intl,
        onGreenFlagClick,
        onStopAllClick,
        turbo,
        framerate,
        interpolation,
        isSmall,
        prefs,
        ...componentProps
    } = props;

    registerKeyboardShortcut(
        prefs['keybind-start-project'] ?? defaultKeyboardShortcuts['start-project'],
        onGreenFlagClick
    );

    registerKeyboardShortcut(
        prefs['keybind-stop-project'] ?? defaultKeyboardShortcuts['stop-project'],
        onStopAllClick
    );

    return (
        <div
            className={classNames(styles.controlsContainer, className)}
            {...componentProps}
        >
            <GreenFlag
                active={active}
                title={intl.formatMessage(messages.goTitle)}
                onClick={onGreenFlagClick}
            />
            <StopAll
                active={active}
                title={intl.formatMessage(messages.stopTitle)}
                onClick={onStopAllClick}
            />
            {turbo ? (
                <TurboMode isSmall={isSmall} />
            ) : null}
            {!isSmall && (
                <FramerateIndicator
                    framerate={framerate}
                    interpolation={interpolation}
                />
            )}
        </div>
    );
};

Controls.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    onGreenFlagClick: PropTypes.func.isRequired,
    onStopAllClick: PropTypes.func.isRequired,
    framerate: PropTypes.number,
    interpolation: PropTypes.bool,
    isSmall: PropTypes.bool,
    turbo: PropTypes.bool,
    prefs: PropTypes.any
};

Controls.defaultProps = {
    active: false,
    turbo: false,
    isSmall: false
};

export default injectIntl(Controls);
