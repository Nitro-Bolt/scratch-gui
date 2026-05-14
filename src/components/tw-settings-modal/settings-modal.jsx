import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import DocumentationLink from '../tw-documentation-link/documentation-link.jsx';
import styles from './settings-modal.css';

/* eslint-disable react/no-multi-comp */

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    title: {
        defaultMessage: 'Advanced Settings',
        description: 'Title of settings modal',
        id: 'tw.settingsModal.title'
    },
    help: {
        defaultMessage: 'Click for help',
        description: 'Hover text of help icon in settings',
        id: 'tw.settingsModal.help'
    }
});

const LearnMore = props => (
    <React.Fragment>
        {' '}
        <DocumentationLink {...props}>
            <FormattedMessage
                defaultMessage="Learn more."
                id="gui.alerts.cloudInfoLearnMore"
            />
        </DocumentationLink>
    </React.Fragment>
);

class UnwrappedSetting extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, [
            'handleClickHelp'
        ]);
        this.state = {
            helpVisible: false
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.active && !prevProps.active) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                helpVisible: true
            });
        }
    }
    handleClickHelp() {
        this.setState(prevState => ({
            helpVisible: !prevState.helpVisible
        }));
    }
    render() {
        return (
            <div
                className={classNames(styles.setting, {
                    [styles.active]: this.props.active
                })}
            >
                <div className={classNames(styles.label, {
                    [styles.labelUnsetHeight]: this.props.unsetHeight === true
                })}>
                    {this.props.primary}
                    <button
                        className={styles.helpIcon}
                        onClick={this.handleClickHelp}
                        title={this.props.intl.formatMessage(messages.help)}
                    />
                </div>
                {this.state.helpVisible && (
                    <div className={styles.detail}>
                        {this.props.help}
                        {this.props.slug && <LearnMore slug={this.props.slug} />}
                    </div>
                )}
                {this.props.secondary}
            </div>
        );
    }
}
UnwrappedSetting.propTypes = {
    intl: intlShape,
    active: PropTypes.bool,
    help: PropTypes.node,
    primary: PropTypes.node,
    secondary: PropTypes.node,
    slug: PropTypes.string
};
const Setting = injectIntl(UnwrappedSetting);

const BooleanSetting = ({ value, onChange, label, ...props }) => (
    <Setting
        {...props}
        active={value}
        primary={
            <label className={styles.label}>
                <FancyCheckbox
                    className={styles.checkbox}
                    checked={value}
                    onChange={onChange}
                />
                {label}
            </label>
        }
    />
);
BooleanSetting.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.bool.isRequired,
    label: PropTypes.node.isRequired
};


const HighQualityPen = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="High Quality Pen"
                description="High quality pen setting"
                id="tw.settingsModal.highQualityPen"
            />
        }
        help={
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="Allows pen projects to render at higher resolutions and disables some coordinate rounding in the editor. Not all projects benefit from this setting and it may impact performance."
                description="High quality pen setting help"
                id="tw.settingsModal.highQualityPenHelp"
            />
        }
        slug="high-quality-pen"
    />
);

const CustomFPS = props => (
    <BooleanSetting
        value={props.framerate !== 30}
        onChange={props.onChange}
        label={
            <FormattedMessage
                defaultMessage="60 FPS (Custom FPS)"
                description="FPS setting"
                id="tw.settingsModal.fps"
            />
        }
        help={
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="Runs scripts 60 times per second instead of 30. Most projects will not work properly with this enabled. You should try Interpolation with 60 FPS mode disabled if that is the case. {customFramerate}."
                description="FPS setting help"
                id="tw.settingsModal.fpsHelp"
                values={{
                    customFramerate: (
                        <a
                            onClick={props.onCustomizeFramerate}
                            tabIndex="0"
                        >
                            <FormattedMessage
                                defaultMessage="Click to use a framerate other than 30 or 60"
                                description="FPS settings help"
                                id="tw.settingsModal.fpsHelp.customFramerate"
                            />
                        </a>
                    )
                }}
            />
        }
        slug="custom-fps"
    />
);
CustomFPS.propTypes = {
    framerate: PropTypes.number,
    onChange: PropTypes.func,
    onCustomizeFramerate: PropTypes.func
};

const Interpolation = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Interpolation"
                description="Interpolation setting"
                id="tw.settingsModal.interpolation"
            />
        }
        help={
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="Makes projects appear smoother by interpolating sprite motion. Interpolation should not be used on 3D projects, raytracers, pen projects, and laggy projects as interpolation will make them run slower without making them appear smoother."
                description="Interpolation setting help"
                id="tw.settingsModal.interpolationHelp"
            />
        }
        slug="interpolation"
    />
);

const InfiniteClones = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Infinite Clones"
                description="Infinite Clones setting"
                id="tw.settingsModal.infiniteClones"
            />
        }
        help={
            <FormattedMessage
                defaultMessage="Disables Scratch's 300 clone limit."
                description="Infinite Clones setting help"
                id="tw.settingsModal.infiniteClonesHelp"
            />
        }
        slug="infinite-clones"
    />
);

const RemoveFencing = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Remove Fencing"
                description="Remove Fencing setting"
                id="tw.settingsModal.removeFencing"
            />
        }
        help={
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="Allows sprites to move offscreen, become as large or as small as they want, and makes touching blocks work offscreen."
                description="Remove Fencing setting help"
                id="tw.settingsModal.removeFencingHelp"
            />
        }
        slug="remove-fencing"
    />
);

const RemoveMiscLimits = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Remove Miscellaneous Limits"
                description="Remove Miscellaneous Limits setting"
                id="tw.settingsModal.removeMiscLimits"
            />
        }
        help={
            <FormattedMessage
                defaultMessage="Removes sound effect limits and pen size limits."
                description="Remove Miscellaneous Limits setting help"
                id="tw.settingsModal.removeMiscLimitsHelp"
            />
        }
        slug="remove-misc-limits"
    />
);

const EnableDangerousOptimizations = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Enable Dangerous Optimizations"
                description="Enable Dangerous Optimizations setting"
                id="pm.settingsModal.dangerousOptimizations"
            />
        }
        help={
            <FormattedMessage
                defaultMessage="Precomputes certain numbers & uses faster methods for certain operations, at the cost of losing tiny features like typing special text in certain number inputs. Not all projects will be compatible with this setting."
                description="Dangerous Optimizations setting help"
                id="pm.settingsModal.dangerousOptimizationsHelp"
            />
        }
        // slug="enable-dangerous-optimizations"
    />
);

const DisableOffscreenRendering = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Disable Out of Bounds Rendering"
                description="Disable Out of Bounds Rendering setting"
                id="pm.settingsModal.disableOffscreenRendering"
            />
        }
        help={
            <FormattedMessage
                defaultMessage="When enabled all sprites that are off screen will not be rendered."
                description="Out of Bounds Rendering setting help"
                id="pm.settingsModal.disableOffscreenRenderingHelp"
            />
        }
        // slug="out-of-bounds-rendering"
    />
);

const WarpTimer = props => (
    <BooleanSetting
        {...props}
        label={
            <FormattedMessage
                defaultMessage="Warp Timer"
                description="Warp Timer setting"
                id="tw.settingsModal.warpTimer"
            />
        }
        help={
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="Makes scripts check if they are stuck in a long or infinite loop and run at a low framerate instead of getting stuck until the loop finishes. This fixes most crashes but has a significant performance impact, so it's only enabled by default in the editor."
                description="Warp Timer help"
                id="tw.settingsModal.warpTimerHelp"
            />
        }
        slug="warp-timer"
    />
);

const CustomStageSize = ({
    customStageSizeEnabled,
    stageWidth,
    onStageWidthChange,
    stageHeight,
    onStageHeightChange,
    onStagePresetUsed,
    onStageSwapChange
}) => (
    <Setting
        active={customStageSizeEnabled}
        unsetHeight={true}
        primary={(
            <div className={classNames(styles.label, styles.customStageSize)}>
                <FormattedMessage
                    defaultMessage="Stage Size:"
                    description="Stage Size option"
                    id="pm.settingsModal.stageSize"
                />
                <div>
                    <button
                        className={styles.customStageSizeButton}
                        data-selected={stageWidth === 360 && stageHeight === 360}
                        data-square={true}
                        onClick={() => onStagePresetUsed(2)}
                    >
                        1:1
                    </button>
                    <button
                        className={styles.customStageSizeButton}
                        data-selected={stageWidth === 480 && stageHeight === 360}
                        onClick={() => onStagePresetUsed(0)}
                    >
                        4:3
                    </button>
                    <button
                        className={styles.customStageSizeButton}
                        data-selected={stageWidth === 576 && stageHeight === 360}
                        data-widescreen={true}
                        onClick={() => onStagePresetUsed(3)}
                    >
                        8:5
                    </button>
                    <button
                        className={styles.customStageSizeButton}
                        data-selected={stageWidth === 640 && stageHeight === 360}
                        data-widescreen={true}
                        onClick={() => onStagePresetUsed(1)}
                    >
                        16:9
                    </button>
                </div>
                <div className={styles.customStageSizeContainer}>
                    <FormattedMessage
                        defaultMessage="Custom Stage Size:"
                        description="Custom Stage Size option"
                        id="tw.settingsModal.customStageSize"
                    />
                    <BufferedInput
                        value={stageWidth}
                        onSubmit={onStageWidthChange}
                        className={styles.customStageSizeInput}
                        type="number"
                        min="0"
                        max="1024"
                        step="1"
                    />
                    <span>{'×'}</span>
                    <BufferedInput
                        value={stageHeight}
                        onSubmit={onStageHeightChange}
                        className={styles.customStageSizeInput}
                        type="number"
                        min="0"
                        max="1024"
                        step="1"
                    />
                    <button
                        onClick={onStageSwapChange}
                        className={styles.customStageSizeInput}
                        style={{
                            "width": "50px",
                            "borderRadius": "8px",
                            "cursor": "pointer"
                        }}
                        step="1"
                    >
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="19.46414" height="19.46414" viewBox="0,0,19.46414,19.46414">
                            <g transform="translate(-230.26793,-169.26793)">
                                <g stroke="none" stroke-miterlimit="10">
                                    <path d="M230.26793,189.73207v-19.46414h19.46414v19.46414z" fill-opacity="0.00392" fill="#ffffff" fill-rule="nonzero" stroke-width="0"></path>
                                    <path d="M247.25064,171.82593l0.00445,5.26217c-0.00445,0.39054 -0.16285,0.76673 -0.44054,1.04442c-0.2767,0.2767 -0.65288,0.43509 -1.04442,0.44054l-5.26118,-0.00544c-0.60388,0 -1.14341,-0.36134 -1.3711,-0.91572c-0.22769,-0.55438 -0.10395,-1.18301 0.32174,-1.6087l0.94542,-0.94542c-0.25244,-0.20294 -0.57418,-0.39599 -0.95532,-0.55933c-0.11335,-0.04504 -0.22769,-0.0891 -0.34649,-0.1287c-0.14355,-0.03465 -0.16285,-0.06484 -0.34649,-0.099c-0.29699,-0.0594 -0.53953,-0.08415 -0.82217,-0.1084c-0.54399,-0.02029 -1.10332,0.05395 -1.6181,0.21235c-0.51973,0.16334 -0.98502,0.41084 -1.3612,0.66823c-0.36629,0.25739 -0.65833,0.53953 -0.82662,0.70783c-0.0891,0.0792 -0.17819,0.20789 -0.22769,0.26729c-0.05445,0.06435 -0.08415,0.10395 -0.08415,0.10395c-0.31679,0.38609 -0.89097,0.44549 -1.27706,0.1287c-0.32669,-0.26729 -0.42074,-0.70783 -0.25739,-1.06916c0,0 0.0198,-0.0495 0.05445,-0.12375c0.04455,-0.08415 0.0693,-0.17819 0.16829,-0.35639c0.19304,-0.36134 0.45538,-0.80187 0.87117,-1.30676c0.41579,-0.49498 0.97512,-1.03452 1.67354,-1.49535c0.70238,-0.45489 1.54385,-0.83108 2.44472,-1.05877c0.44054,-0.09405 0.93057,-0.17819 1.35131,-0.20294c0.17324,-0.02475 0.50983,-0.02475 0.71278,-0.0198c0.23264,0.00495 0.45538,0.0198 0.68357,0.0391c0.89543,0.09454 1.727,0.33213 2.40513,0.62417c0.39104,0.16334 0.73258,0.34649 1.01967,0.51478l1.05926,-1.05926c0.42569,-0.42569 1.05431,-0.54943 1.6087,-0.32174c0.55438,0.22769 0.91572,0.76722 0.91572,1.3711" fill="#76fa02" fill-rule="evenodd" stroke-width="1"></path>
                                    <path d="M232.74936,188.17407l-0.00445,-5.26217c0.00446,-0.39054 0.16285,-0.76673 0.44053,-1.04441c0.27669,-0.27669 0.65289,-0.43509 1.04442,-0.44054l5.26118,0.00545c0.60388,0 1.14342,0.36134 1.37111,0.91572c0.22769,0.55438 0.10394,1.18301 -0.32174,1.6087l-0.94541,0.94542c0.25244,0.20294 0.57418,0.39599 0.95531,0.55933c0.11335,0.04504 0.2277,0.08909 0.34649,0.12869c0.14354,0.03465 0.16285,0.06484 0.34649,0.099c0.29699,0.0594 0.53953,0.08415 0.82217,0.1084c0.54398,0.0203 1.10332,-0.05396 1.6181,-0.21235c0.51973,-0.16334 0.98502,-0.41084 1.36121,-0.66823c0.36629,-0.25739 0.65832,-0.53953 0.82662,-0.70782c0.08909,-0.07919 0.1782,-0.2079 0.2277,-0.2673c0.05445,-0.06435 0.08415,-0.10394 0.08415,-0.10394c0.31679,-0.38609 0.89097,-0.44548 1.27706,-0.12869c0.32669,0.26729 0.42074,0.70782 0.25739,1.06916c0,0 -0.0198,0.04949 -0.05445,0.12374c-0.04455,0.08415 -0.0693,0.1782 -0.1683,0.35639c-0.19305,0.36134 -0.45539,0.80187 -0.87117,1.30676c-0.41578,0.49499 -0.97512,1.03451 -1.67354,1.49534c-0.70238,0.45489 -1.54386,0.83108 -2.44473,1.05877c-0.44054,0.09404 -0.93057,0.17819 -1.3513,0.20294c-0.17325,0.02475 -0.50983,0.02475 -0.71277,0.0198c-0.23264,-0.00495 -0.45539,-0.0198 -0.68357,-0.03911c-0.89542,-0.09454 -1.72699,-0.33214 -2.40512,-0.62418c-0.39103,-0.16334 -0.73258,-0.34649 -1.01967,-0.51478l-1.05927,1.05926c-0.42568,0.42568 -1.05431,0.54943 -1.60869,0.32174c-0.55438,-0.22769 -0.91572,-0.76722 -0.91572,-1.3711" fill="#76fa02" fill-rule="evenodd" stroke-width="1"></path>
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        )}
        secondary={
            (stageWidth >= 1000 || stageHeight >= 1000) && (
                <div className={styles.warning}>
                    <FormattedMessage
                        // eslint-disable-next-line max-len
                        defaultMessage="Using a custom stage size this large is not recommended! Instead, use a lower size with the same aspect ratio and let fullscreen mode upscale it to match the user's display."
                        description="Warning about using stages that are too large in settings modal"
                        id="tw.settingsModal.largeStageWarning"
                    />
                    <LearnMore slug="custom-stage-size" />
                </div>
            )
        }
        help={(
            <FormattedMessage
                // eslint-disable-next-line max-len
                defaultMessage="Changes the size of the Scratch stage from 480x360 to something else. Try 640x360 to make the stage widescreen. Very few projects will handle this properly."
                description="Custom Stage Size option"
                id="tw.settingsModal.customStageSizeHelp"
            />
        )}
        slug="custom-stage-size"
    />
);
CustomStageSize.propTypes = {
    customStageSizeEnabled: PropTypes.bool,
    stageWidth: PropTypes.number,
    onStageWidthChange: PropTypes.func,
    stageHeight: PropTypes.number,
    onStageHeightChange: PropTypes.func,
    onStagePresetUsed: PropTypes.func,
    onStageSwapChange: PropTypes.func
};

const StoreProjectOptions = ({ onStoreProjectOptions }) => (
    <div className={styles.setting}>
        <div>
            <button
                onClick={onStoreProjectOptions}
                className={styles.button}
            >
                <FormattedMessage
                    defaultMessage="Store settings in project"
                    description="Button in settings modal"
                    id="tw.settingsModal.storeProjectOptions"
                />
            </button>
            <p>
                <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage="Stores the selected settings in the project so they will be automatically applied when PenguinMod loads this project. Warp timer will not be saved."
                    description="Help text for the store settings in project button"
                    id="tw.settingsModal.storeProjectOptionsHelp"
                />
            </p>
        </div>
    </div>
);
StoreProjectOptions.propTypes = {
    onStoreProjectOptions: PropTypes.func
};

const Header = props => (
    <div className={styles.header}>
        {props.children}
        <div className={styles.divider} />
    </div>
);
Header.propTypes = {
    children: PropTypes.node
};

const SettingsModalComponent = props => (
    <Modal
        className={styles.modalContent}
        onRequestClose={(...args) => {
            if (!props.isEmbedded) {
                props.onStoreProjectOptions();
            }
            props.onClose(...args)
        }}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="settingsModal"
    >
        <Box className={styles.body}>
            <Header>
                <FormattedMessage
                    defaultMessage="Gameplay"
                    description="Settings modal section"
                    id="tw.settingsModal.featured"
                />
            </Header>
            <CustomFPS
                framerate={props.framerate}
                onChange={props.onFramerateChange}
                onCustomizeFramerate={props.onCustomizeFramerate}
            />
            <HighQualityPen
                value={props.highQualityPen}
                onChange={props.onHighQualityPenChange}
            />
            <WarpTimer
                value={props.warpTimer}
                onChange={props.onWarpTimerChange}
            />
            <Header>
                <FormattedMessage
                    defaultMessage="Remove Limits"
                    description="Settings modal section"
                    id="tw.settingsModal.removeLimits"
                />
            </Header>
            <InfiniteClones
                value={props.infiniteClones}
                onChange={props.onInfiniteClonesChange}
            />
            <RemoveFencing
                value={props.removeFencing}
                onChange={props.onRemoveFencingChange}
            />
            <RemoveMiscLimits
                value={props.removeLimits}
                onChange={props.onRemoveLimitsChange}
            />
            <Header>
                <FormattedMessage
                    defaultMessage="Optimizations"
                    description="Settings modal section"
                    id="pm.settingsModal.optimizations"
                />
            </Header>
            <DisableOffscreenRendering
                value={props.disableOffscreenRendering}
                onChange={props.onDisableOffscreenRenderingChange}
            />
            <EnableDangerousOptimizations
                value={props.dangerousOptimizations}
                onChange={props.onEnableDangerousOptimizationsChange}
            />
            <Header>
                <FormattedMessage
                    defaultMessage="Screen Resolution"
                    description="Settings modal section"
                    id="pm.settingsModal.screenResolution"
                />
            </Header>
            {!props.isEmbedded && (
                <CustomStageSize
                    {...props}
                />
            )}
            {!props.isEmbedded && (
                <StoreProjectOptions
                    {...props}
                />
            )}
            <details>
                <summary className={styles.summary}>
                    <Header>
                        <span className={styles.dropdown}>⯈</span>
                        <FormattedMessage
                            defaultMessage="Unsupported"
                            description="Old unsupported settings section"
                            id="pm.settingsModal.unsupported"
                        />
                    </Header>
                </summary>
                <div className={styles.warning}>
                    <FormattedMessage
                        // eslint-disable-next-line max-len
                        defaultMessage="The settings here are unsupported and can break at any time. These settings are here as they either have better methods to create their effects with better results, or break often when used with other extensions."
                        description="Warning about old unsupported settings in settings menu"
                        id="pm.settingsModal.unsupportedWarning"
                    />
                </div>
                <Interpolation
                    value={props.interpolation}
                    onChange={props.onInterpolationChange}
                />
            </details>
        </Box>
    </Modal>
);

SettingsModalComponent.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
    isEmbedded: PropTypes.bool,
    framerate: PropTypes.number,
    onFramerateChange: PropTypes.func,
    onCustomizeFramerate: PropTypes.func,
    highQualityPen: PropTypes.bool,
    onHighQualityPenChange: PropTypes.func,
    interpolation: PropTypes.bool,
    onInterpolationChange: PropTypes.func,
    infiniteClones: PropTypes.bool,
    onInfiniteClonesChange: PropTypes.func,
    removeFencing: PropTypes.bool,
    onRemoveFencingChange: PropTypes.func,
    removeLimits: PropTypes.bool,
    onRemoveLimitsChange: PropTypes.func,
    warpTimer: PropTypes.bool,
    onWarpTimerChange: PropTypes.func,
    disableCompiler: PropTypes.bool,
    dangerousOptimizations: PropTypes.bool,
    onDisableCompilerChange: PropTypes.func,
    onEnableDangerousOptimizationsChange: PropTypes.func,
    disableOffscreenRendering: PropTypes.bool,
    onDisableOffscreenRenderingChange: PropTypes.func
};

export default injectIntl(SettingsModalComponent);
