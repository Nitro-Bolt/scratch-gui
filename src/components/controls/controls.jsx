import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import GreenFlag from '../green-flag/green-flag.jsx';
import Pause from '../nb-pause/pause.jsx';
import Step from '../nb-step/step.jsx';
import StopAll from '../stop-all/stop-all.jsx';
import TurboMode from '../turbo-mode/turbo-mode.jsx';
import FramerateIndicator from '../tw-framerate-indicator/framerate-indicator.jsx';

import styles from './controls.css';
import {defaultKeybinds, keybindTooltip, registerKeybind} from '../../lib/nb-keybinds.js';

const messages = defineMessages({
    goTitle: {
        id: 'gui.controls.go',
        defaultMessage: 'Go',
        description: 'Green flag button title'
    },
    pauseTitle: {
        id: 'gui.controls.pause',
        defaultMessage: 'Pause',
        description: 'Pause button title'
    },
    stepTitle: {
        id: 'gui.controls.step',
        defaultMessage: 'Step',
        description: 'Step button title'
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
        compilerEnabled,
        intl,
        onGreenFlagClick,
        onPauseClick,
        onStepClick,
        onStopAllClick,
        turbo,
        framerate,
        interpolation,
        isSmall,
        isHidden,
        paused,
        preferences,
        ...componentProps
    } = props;

    registerKeybind(
        preferences['keybind-start-project'] ?? defaultKeybinds['start-project'],
        onGreenFlagClick
    );

    registerKeybind(
        preferences['keybind-pause-project'] ?? defaultKeybinds['pause-project'],
        onPauseClick
    );

    registerKeybind(
        preferences['keybind-step-project'] ?? defaultKeybinds['step-project'],
        onStepClick
    );

    registerKeybind(
        preferences['keybind-stop-project'] ?? defaultKeybinds['stop-project'],
        onStopAllClick
    );

    return (
        <>
            <div
                className={classNames(styles.controlsContainer, className)}
                {...componentProps}
                style={{
                    display: isHidden ? 'none' : null
                }}
            >
                <GreenFlag
                    active={active}
                    title={keybindTooltip(
                        intl.formatMessage(messages.goTitle),
                        preferences["keybind-start-project"] ?? defaultKeybinds["start-project"]
                    )}
                    onClick={onGreenFlagClick}
                />
                {preferences['hide-pause'] !== true &&
                    <>
                        <Pause
                            paused={paused}
                            title={keybindTooltip(
                                intl.formatMessage(messages.pauseTitle),
                                preferences["keybind-pause-project"] ?? defaultKeybinds["pause-project"]
                            )}
                            onClick={onPauseClick}
                        />
                        {paused && !compilerEnabled &&
                            <Step
                                title={keybindTooltip(
                                    intl.formatMessage(messages.stepTitle),
                                    preferences["keybind-step-project"] ?? defaultKeybinds["step-project"]
                                )}
                                onClick={onStepClick}
                            />
                        }
                    </>
                }
                <StopAll
                    active={active}
                    title={keybindTooltip(
                        intl.formatMessage(messages.stopTitle),
                        preferences["keybind-stop-project"] ?? defaultKeybinds["stop-project"]
                    )}
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
            {isHidden && !preferences['stage-left'] && <div />}
        </>
    );
};

Controls.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    compilerEnabled: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    onGreenFlagClick: PropTypes.func.isRequired,
    onPauseClick: PropTypes.func.isRequired,
    onStepClick: PropTypes.func.isRequired,
    onStopAllClick: PropTypes.func.isRequired,
    framerate: PropTypes.number,
    interpolation: PropTypes.bool,
    isSmall: PropTypes.bool,
    isHidden: PropTypes.bool,
    turbo: PropTypes.bool,
    paused: PropTypes.bool,
    preferences: PropTypes.object
};

Controls.defaultProps = {
    active: false,
    turbo: false,
    isSmall: false
};

export default injectIntl(Controls);
