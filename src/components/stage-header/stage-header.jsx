import classNames from 'classnames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import ToggleButtons from '../toggle-buttons/toggle-buttons.jsx';
import Controls from '../../containers/controls.jsx';
import {getStageDimensions} from '../../lib/screen-utils';
import {STAGE_SIZE_MODES} from '../../lib/layout-constants';

import fullScreenIcon from './icon--fullscreen.svg';
import unFullScreenIcon from './icon--unfullscreen.svg';
import largeStageIcon from '!../../lib/tw-recolor/build!./icon--large-stage.svg';
import smallStageIcon from '!../../lib/tw-recolor/build!./icon--small-stage.svg';
import hiddenStageIcon from '!../../lib/tw-recolor/build!./icon--hidden-stage.svg';
import fullStageIcon from '!../../lib/tw-recolor/build!./icon--full-stage.svg';
import settingsIcon from './icon--settings.svg';

import styles from './stage-header.css';

import FullscreenAPI from '../../lib/tw-fullscreen-api';
import {defaultKeyboardShortcuts, registerKeyboardShortcut} from '../../lib/nb-keyboard-shortcut.js';

const messages = defineMessages({
    largeStageSizeMessage: {
        defaultMessage: 'Switch to large stage',
        description: 'Button to change stage size to large',
        id: 'gui.stageHeader.stageSizeLarge'
    },
    smallStageSizeMessage: {
        defaultMessage: 'Switch to small stage',
        description: 'Button to change stage size to small',
        id: 'gui.stageHeader.stageSizeSmall'
    },
    hiddenStageSizeMessage: {
        defaultMessage: 'Hide stage',
        description: 'Button to hide the stage and sprite pane',
        id: 'gui.stageHeader.stageSizeHidden'
    },
    fullStageSizeMessage: {
        defaultMessage: 'Switch to full stage',
        description: 'Button to change stage size to its full size',
        id: 'tw.stageHeader.full'
    },
    fullScreenMessage: {
        defaultMessage: 'Enter full screen mode',
        description: 'Button to change stage size to full screen',
        id: 'gui.stageHeader.stageSizeFull'
    },
    unFullScreenMessage: {
        defaultMessage: 'Exit full screen mode',
        description: 'Button to get out of full screen mode',
        id: 'gui.stageHeader.stageSizeUnFull'
    },
    fullscreenControl: {
        defaultMessage: 'Full Screen Control',
        description: 'Button to enter/exit full screen mode',
        id: 'gui.stageHeader.fullscreenControl'
    },
    openSettingsMessage: {
        defaultMessage: 'Open advanced settings',
        description: 'Button to open advanced settings in embeds',
        id: 'tw.openAdvanced'
    }
});

const enableSettingsButton = new URLSearchParams(location.search).has('settings-button');

const StageHeaderComponent = function (props) {
    const {
        customStageSize,
        showFixedLargeSize,
        isFullScreen,
        isPlayerOnly,
        onKeyPress,
        onSetStageFullScreen,
        onSetStageUnFullScreen,
        onOpenSettings,
        isEmbedded,
        preferences,
        stageSize,
        setStageSize,
        vm
    } = props;

    let header = null;

    const stageDimensions = getStageDimensions(stageSize, customStageSize, isFullScreen || isEmbedded, isPlayerOnly);

    registerKeyboardShortcut(
        preferences['keybind-project-full-screen'] ?? defaultKeyboardShortcuts['project-full-screen'],
        () => (isFullScreen ? onSetStageUnFullScreen() : onSetStageFullScreen())
    );

    if (isFullScreen || isEmbedded) {
        const settingsButton = isEmbedded && enableSettingsButton ? (
            <div className={classNames(styles.settingsButton, styles.unselectWrapper)}>
                <Button
                    className={styles.stageButton}
                    onClick={onOpenSettings}
                >
                    <img
                        alt={props.intl.formatMessage(messages.openSettingsMessage)}
                        className={styles.stageButtonIcon}
                        draggable={false}
                        src={settingsIcon}
                        title={props.intl.formatMessage(messages.openSettingsMessage)}
                    />
                </Button>
            </div>
        ) : null;
        const fullscreenButton = isFullScreen ? (
            <div className={styles.unselectWrapper}>
                <Button
                    className={styles.stageButton}
                    onClick={onSetStageUnFullScreen}
                    onKeyPress={onKeyPress}
                >
                    <img
                        alt={props.intl.formatMessage(messages.unFullScreenMessage)}
                        className={styles.stageButtonIcon}
                        draggable={false}
                        src={unFullScreenIcon}
                        title={props.intl.formatMessage(messages.fullscreenControl)}
                    />
                </Button>
            </div>
        ) : FullscreenAPI.available() ? (
            <div className={styles.unselectWrapper}>
                <Button
                    className={styles.stageButton}
                    onClick={onSetStageFullScreen}
                >
                    <img
                        alt={props.intl.formatMessage(messages.fullScreenMessage)}
                        className={styles.stageButtonIcon}
                        draggable={false}
                        src={fullScreenIcon}
                        title={props.intl.formatMessage(messages.fullscreenControl)}
                    />
                </Button>
            </div>
        ) : null;
        header = (
            <Box
                className={classNames(styles.stageHeaderWrapperOverlay, {
                    [styles.embedded]: isEmbedded
                })}
            >
                <Box
                    className={classNames(styles.stageMenuWrapper, stageSize === 0 ? styles.stageHidden : null)}
                    style={{width: stageDimensions.width}}
                >
                    <Controls vm={vm} />
                    <div
                        className={styles.fullscreenButtonsRow}
                        key="fullscreen" // addons require the HTML element to be not be re-used by in-editor buttons
                    >
                        {settingsButton}
                        {fullscreenButton}
                    </div>
                </Box>
            </Box>
        );
    } else {
        const stageControls =
            isPlayerOnly ? (
                []
            ) : (
                <div className={styles.stageSizeToggleGroup}>
                    <ToggleButtons
                        buttons={[
                            {
                                handleClick: () => setStageSize(0),
                                icon: hiddenStageIcon,
                                iconClassName: styles.stageButtonIcon,
                                isSelected: stageSize === 0,
                                title: props.intl.formatMessage(messages.hiddenStageSizeMessage)
                            },
                            {
                                handleClick: () => setStageSize(270),
                                icon: smallStageIcon,
                                iconClassName: styles.stageButtonIcon,
                                isSelected: stageSize <= 430 && stageSize !== 0,
                                title: props.intl.formatMessage(messages.smallStageSizeMessage)
                            },
                            {
                                handleClick: () => setStageSize(480),
                                icon: showFixedLargeSize ? fullStageIcon : largeStageIcon,
                                iconClassName: styles.stageButtonIcon,
                                isSelected: stageSize > 430,
                                title: props.intl.formatMessage(messages.fullStageSizeMessage)
                            }
                        ]}
                    />
                </div>
            );
        header = (
            <Box
                className={styles.stageHeaderWrapper}
                // + 2 px because the stage will have 2 pixels of border around it
                style={{minWidth: `${stageDimensions.width + 2}px`}}
            >
                <Box className={classNames(styles.stageMenuWrapper, stageSize === 0 ? styles.stageHidden : null)}>
                    <Controls
                        vm={vm}
                        isSmall={stageSize < 430}
                        isHidden={stageSize === 0}
                    />
                    <div
                        className={styles.stageSizeRow}
                        key="editor" // addons require the HTML element to be not be re-used by in-editor buttons
                    >
                        {stageControls}
                        <div>
                            <Button
                                className={styles.stageButton}
                                onClick={onSetStageFullScreen}
                            >
                                <img
                                    alt={props.intl.formatMessage(messages.fullStageSizeMessage)}
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={fullScreenIcon}
                                    title={props.intl.formatMessage(messages.fullscreenControl)}
                                />
                            </Button>
                        </div>
                    </div>
                </Box>
            </Box>
        );
    }

    return header;
};

const mapStateToProps = state => ({
    // This is the button's mode, as opposed to the actual current state
    stageSizeMode: state.scratchGui.stageSize.stageSize
});

StageHeaderComponent.propTypes = {
    intl: intlShape,
    customStageSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    showFixedLargeSize: PropTypes.bool,
    isFullScreen: PropTypes.bool.isRequired,
    isPlayerOnly: PropTypes.bool.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onSetStageFullScreen: PropTypes.func.isRequired,
    onSetStageUnFullScreen: PropTypes.func.isRequired,
    onOpenSettings: PropTypes.func.isRequired,
    isEmbedded: PropTypes.bool.isRequired,
    preferences: PropTypes.object.isRequired,
    stageSize: PropTypes.number.isRequired,
    setStageSize: PropTypes.func.isRequired,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired
};

StageHeaderComponent.defaultProps = {
    stageSizeMode: STAGE_SIZE_MODES.large
};

export default injectIntl(connect(
    mapStateToProps
)(StageHeaderComponent));
