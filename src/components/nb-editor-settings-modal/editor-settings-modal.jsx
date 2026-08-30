/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState, useRef, useEffect} from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './editor-settings-modal.css';
import Box from '../box/box.jsx';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import AddonSettingsComponent from '../../addons/settings/settings.jsx';
import DocumentationLink from '../tw-documentation-link/documentation-link.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import {onExportSettings} from '../../playground/addon-settings.jsx';
import {closeEditorSettingsModal, openCustomAccentModal} from '../../reducers/modals.js';
import {setPreference} from '../../reducers/preferences.js';
import {connect} from 'react-redux';
import helpIcon from './help-icon.svg';
import {APP_NAME} from '../../lib/brand.js';
import {setUsername, setUsernameInvalid} from '../../reducers/tw.js';
import isScratchDesktop from '../../lib/isScratchDesktop.js';
import {generateRandomUsername} from '../../lib/tw-username.js';
import KeyInput from './key-input.jsx';
import {defaultKeyboardShortcuts} from '../../lib/nb-keyboard-shortcut.js';
import {setTheme} from '../../reducers/theme.js';
import {persistTheme, detectTheme} from '../../lib/themes/themePersistance.js';
import {GUI_DARK, GUI_LIGHT, Theme, BLOCKS_CUSTOM} from '../../lib/themes/index.js';
import {
    BLOCK_COLOR_CATEGORIES,
    applyBlockColors,
    loadBlockColors,
    saveBlockColors
} from '../../lib/block-color-persistence.js';
import {setHiddenCategories} from '../../reducers/hidden-categories';
import dropdownCaret from '../menu-bar/dropdown-caret.svg';
import ColorPicker from '../nb-fancy-color-picker/color-picker.jsx';
import DeleteButton from '../delete-button/delete-button.jsx';
import {BLOCK_SHAPE_PRESETS, getBlockShape} from '../../lib/nb-custom-block-shape';

const messages = defineMessages({
    title: {
        defaultMessage: 'Editor Settings',
        description: 'Title of editor settings modal',
        id: 'nb.editorSettings.title'
    },
    help: {
        defaultMessage: 'Click for help',
        description: 'Hover text of help icon in settings',
        id: 'nb.editorSettings.help'
    },
    general: {
        id: 'nb.editorSettings.generalSection',
        defaultMessage: 'General'
    },
    security: {
        id: 'nb.editorSettings.securitySection',
        defaultMessage: 'Security'
    },
    addons: {
        id: 'nb.editorSettings.addonsSection',
        defaultMessage: 'Addons'
    },
    display: {
        id: 'nb.editorSettings.displaySection',
        defaultMessage: 'Display'
    },
    sound: {
        id: 'nb.editorSettings.soundSection',
        defaultMessage: 'Sound'
    },
    paint: {
        id: 'nb.editorSettings.paintSection',
        defaultMessage: 'Paint'
    },
    versionControl: {
        id: 'nb.editorSettings.versionControlSection',
        defaultMessage: 'Version Control'
    },
    canvasSizeMultiplier: {
        id: 'nb.editorSettings.canvasSizeMultiplier',
        defaultMessage: 'Canvas size multiplier:'
    },
    canvasSizeMultiplierHelp: {
        id: 'nb.editorSettings.canvasSizeMultiplierHelp',
        defaultMessage: 'How large the canvas is in the paint editor relative to the stage.'
    },
    keymap: {
        id: 'nb.editorSettings.keymapSection',
        defaultMessage: 'Keymap'
    },
    visibleTabs: {
        id: 'nb.editorSettings.visibleTabs',
        defaultMessage: 'Visible tabs'
    },
    visibleTabsHelp: {
        id: 'nb.editorSettings.visibleTabsHelp',
        defaultMessage: 'Choose which tabs to show in the editor. Hidden tabs can still be accessed via keyboard shortcuts.'
    },
    resetTabsVisibility: {
        id: 'nb.editorSettings.resetTabsVisibility',
        defaultMessage: 'Reset to defaults'
    },
    customBlockShape: {
        id: 'nb.editorSettings.customBlockShape',
        defaultMessage: 'Customizable block shape'
    },
    customBlockShapeHelp: {
        id: 'nb.editorSettings.customBlockShapeHelp',
        defaultMessage: 'Adjust the padding, corner radius, notch height, and field height of blocks.'
    },
    paddingSize: {
        id: 'nb.editorSettings.paddingSize',
        defaultMessage: 'Padding size (50-200%):'
    },
    paddingSizeHelp: {
        id: 'nb.editorSettings.paddingSizeHelp',
        defaultMessage: 'Controls the overall size and spacing of blocks.'
    },
    cornerSize: {
        id: 'nb.editorSettings.cornerSize',
        defaultMessage: 'Corner size (0-300%):'
    },
    cornerSizeHelp: {
        id: 'nb.editorSettings.cornerSizeHelp',
        defaultMessage: 'Controls how rounded the corners of blocks are.'
    },
    maxCornerRadius: {
        id: 'nb.editorSettings.maxCornerRadius',
        defaultMessage: 'Max corner radius (1x-12x):'
    },
    maxCornerRadiusHelp: {
        id: 'nb.editorSettings.maxCornerRadiusHelp',
        defaultMessage: 'Sets an upper limit on the corner radius as a multiple of the base corner size, used by round output blocks.'
    },
    notchSize: {
        id: 'nb.editorSettings.notchSize',
        defaultMessage: 'Notch height (0-150%):'
    },
    notchSizeHelp: {
        id: 'nb.editorSettings.notchSizeHelp',
        defaultMessage: 'Controls how tall the notches and bumps that let blocks snap together are.'
    },
    fieldHeight: {
        id: 'nb.editorSettings.fieldHeight',
        defaultMessage: 'Field height (75-150%):'
    },
    fieldHeightHelp: {
        id: 'nb.editorSettings.fieldHeightHelp',
        defaultMessage: 'Controls the height of text inputs and dropdowns inside blocks, independent of overall padding.'
    },
    presets: {
        id: 'nb.editorSettings.blockShapePresets',
        defaultMessage: 'Presets'
    }
});

const editorTabs = [
    {index: 0, id: 'code', label: 'Code'},
    {index: 1, id: 'costumes', label: 'Costumes'},
    {index: 2, id: 'sounds', label: 'Sounds'},
    {index: 3, id: 'assets', label: 'Assets'},
    {index: 4, id: 'variables', label: 'Variables'}
];

const toolboxCategories = [
    {id: 'motion', label: 'Motion'},
    {id: 'looks', label: 'Looks'},
    {id: 'sound', label: 'Sound'},
    {id: 'assets', label: 'Assets'},
    {id: 'event', label: 'Events'},
    {id: 'control', label: 'Control'},
    {id: 'sensing', label: 'Sensing'},
    {id: 'operators', label: 'Operators'},
    {id: 'data', label: 'Variables'},
    {id: 'json', label: 'JSON'},
    {id: 'procedures', label: 'My Blocks'}
];

const BufferedInput = BufferedInputHOC(Input);

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
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickHelp'
        ]);
        this.state = {
            helpVisible: false
        };
    }
    componentDidUpdate (prevProps) {
        if (this.props.active && !prevProps.active) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                helpVisible: true
            });
        }
    }
    handleClickHelp () {
        this.setState(prevState => ({
            helpVisible: !prevState.helpVisible
        }));
    }
    render () {
        return (
            <div
                className={classNames(styles.setting, {
                    [styles.active]: this.props.active
                })}
            >
                <div className={styles.label}>
                    {this.props.primary}
                    <button
                        className={styles.helpIcon}
                        onClick={this.handleClickHelp}
                        title={this.props.intl.formatMessage(messages.help)}
                    >
                        <img
                            src={helpIcon}
                            draggable={false}
                        />
                    </button>
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

const BooleanSetting = ({value, onChange, label, ...props}) => (
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

const Section = ({title, children}) => {
    const [expanded, setExpanded] = useState(true);
    return (
        <div className={styles.section}>
            <div
                className={styles.sectionTitle}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => setExpanded(e => !e)}
            >
                <span>{title}</span>
                <button className={styles.sectionDropdownCaret}>
                    <img
                        className={classNames(styles.collapseArrow, {
                            [styles.collapseArrowExpanded]: expanded
                        })}
                        src={dropdownCaret}
                        draggable={false}
                    />
                </button>
                <div className={styles.sectionDivider} />
            </div>
            {expanded && (
                <div className={styles.sectionBody}>
                    {children}
                </div>
            )}
        </div>
    );
};
Section.propTypes = {
    title: PropTypes.node.isRequired,
    children: PropTypes.node
};

const CollapsibleSetting = ({label, help, children}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <Setting
            help={help}
            primary={
                <button
                    className={classNames(styles.label, styles.collapseButton)}
                    onClick={() => setExpanded(e => !e)}
                >
                    {label}
                    <img
                        className={classNames(styles.collapseArrow, {
                            [styles.collapseArrowExpanded]: expanded
                        })}
                        src={dropdownCaret}
                    />
                </button>
            }
            secondary={
                expanded && children
            }
        />
    );
};
CollapsibleSetting.propTypes = {
    label: PropTypes.node.isRequired,
    help: PropTypes.node,
    children: PropTypes.node
};

const EditorSettingsModal = props => {
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(props.activeTab ?? 0);
    const [windchimeOptOut, setWindchimeOptOut] = useState(localStorage.getItem('tw:windchime_opt_out') === 'true');
    const [dirty, setDirty] = useState(false);
    const [blockColors, setBlockColors] = useState(loadBlockColors);

    const latestBlockColors = useRef(blockColors);
    latestBlockColors.current = blockColors;
    const pendingBlockColors = useRef(null);

    useEffect(() => {
        if (props.theme.blocks !== BLOCKS_CUSTOM) {
            setBlockColors({});
            saveBlockColors({});
            applyBlockColors({});
            pendingBlockColors.current = null;
        }
    }, [props.theme.blocks]);

    const commitBlockColors = next => {
        saveBlockColors(next);
        props.onChangeTheme(props.theme.set('blocks', BLOCKS_CUSTOM));
    };

    useEffect(() => () => {
        if (pendingBlockColors.current) {
            commitBlockColors(pendingBlockColors.current);
            pendingBlockColors.current = null;
        }
    }, []);

    const handleBlockColorPreview = (colorId, value) => {
        const next = {...latestBlockColors.current, [colorId]: value};
        setBlockColors(next);
        applyBlockColors(next);
        pendingBlockColors.current = next;
    };

    const handleBlockColorCommit = colorId => e => {
        const next = {...latestBlockColors.current, [colorId]: e.target.value};
        setBlockColors(next);
        pendingBlockColors.current = null;
        commitBlockColors(next);
    };

    const handleDeleteBlockColor = colorId => () => {
        const next = {...latestBlockColors.current};
        delete next[colorId];
        setBlockColors(next);
        applyBlockColors(next);
        pendingBlockColors.current = null;
        commitBlockColors(next);
    };

    const handleResetBlockColors = () => {
        setBlockColors({});
        saveBlockColors({});
        applyBlockColors({});
        const defaultBlocks = detectTheme().blocks === BLOCKS_CUSTOM ?
            'three' :
            detectTheme().blocks;
        props.onChangeTheme(props.theme.set('blocks', defaultBlocks));
    };

    const handleResetCategoriesVisibility = () => {
        props.onSetPreference('hidden-categories', []);
    };

    const hiddenCategories = props.preferences['hidden-categories'] || [];
    const hiddenTabs = props.preferences['hidden-tabs'] || [];

    const handleResetTabsVisibility = () => {
        props.onSetPreference('hidden-tabs', []);
    };

    const blockShape = getBlockShape(props.preferences);

    const handleSetBlockShape = (key, value) => {
        props.onSetPreference('block-shape', {
            ...blockShape,
            [key]: value
        });
    };

    const handleApplyBlockShapePreset = preset => {
        props.onSetPreference('block-shape', preset.values);
    };

    const sections = [
        {
            title: messages.general,
            content: <Box>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.personal"
                        defaultMessage="Personal"
                    />}
                >
                    {props.usernameInvalid && <p className={classNames(styles.helpText, styles.mustChange)}>
                        <FormattedMessage
                        // eslint-disable-next-line max-len
                            defaultMessage="Sorry, the cloud variable server thinks your username may be unsafe. Please change it to something else or {resetIt}."
                            id="tw.usernameModal.mustChange"
                            values={{
                                resetIt: (
                                    <a
                                        className={styles.resetLink}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onClick={() => props.onSetUsername(isScratchDesktop() ? 'player' : generateRandomUsername())}
                                    >
                                        <FormattedMessage
                                            defaultMessage="reset it (recommended)"
                                            description="link to reset username"
                                            id="tw.usernameModal.mustChange.resetIt"
                                        />
                                    </a>
                                )
                            }}
                        />
                    </p>}
                    <Setting
                        primary={(
                            <div className={classNames(styles.label, styles.customStageSize)}>
                                <FormattedMessage
                                    defaultMessage="Username:"
                                    id="nb.editorSettings.username"
                                />
                                <BufferedInput
                                    value={props.username}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onSubmit={value => {
                                        props.onSetUsername(value);
                                    }}
                                    type="text"
                                    pattern="[a-zA-Z0-9_\-]*"
                                    maxLength="20"
                                    spellCheck="false"
                                />
                            </div>
                        )}
                        help={<>
                            <p>
                                <FormattedMessage
                                    id="nb.editorSettings.usernameHelp"
                                    defaultMessage="This value will be stored in your browser's storage. It may be logged when you interact with projects that contain cloud variables. It will also be used for Live Collaboration."
                                />
                            </p>
                            <p>
                                <FormattedMessage
                                    id="nb.editorSettings.usernameHelp2"
                                    defaultMessage="Values that do not correspond to a valid Scratch account will typically be rejected by the cloud variable server. We recommend leaving it as-is or changing it to your Scratch username."
                                />
                            </p>
                        </>}
                    />
                    <Box>
                        <BooleanSetting
                            value={!windchimeOptOut}
                            label={<FormattedMessage
                                id="nb.editorSettings.viewCounter"
                                defaultMessage="Allow counting my views"
                            />}
                            help={<>
                                <FormattedMessage
                                    id="nb.editorSettings.viewCounterHelp"
                                    defaultMessage="When you start a project that is loaded from Scratch, this may be logged so that a view counter can be incremented over time. Views are anonymous and can not be tied back to any user."
                                /> <a
                                    href="/privacy.html"
                                    target="_blank"
                                >
                                    <FormattedMessage
                                        id="nb.editorSettings.viewCounterPrivacyLink"
                                        defaultMessage="Privacy policy"
                                    />
                                </a>
                            </>}
                            // eslint-disable-next-line react/jsx-no-bind
                            onChange={e => {
                                localStorage.setItem('tw:windchime_opt_out', !e.target.checked);
                                setWindchimeOptOut(!e.target.checked);
                            }}
                        />
                    </Box>
                    <BooleanSetting
                        value={!!props.preferences['enable-debugger']}
                        label={<FormattedMessage
                            id="nb.editorSettings.enableDebugger"
                            defaultMessage="Enable debugger"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.enableDebuggerHelp"
                            defaultMessage="Enables a debugger panel and extension that allows you to inspect logs and performance."
                        />}
                        onChange={e => {
                            props.onSetPreference('enable-debugger', e.target.checked);
                            // Load debugger extension if it's enabled and not already loaded
                            if (
                                e.target.checked &&
                                !props.vm.extensionManager.isExtensionLoaded('debugger')
                            ) {
                                props.vm.extensionManager.loadExtensionIdSync('debugger');
                            }
                        }}
                    />
                </Section>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.dangerZone"
                        defaultMessage="Danger Zone"
                    />}
                >
                    <BooleanSetting
                        value={!!props.preferences['disable-compiler']}
                        label={<FormattedMessage
                            id="nb.editorSettings.disableCompiler"
                            defaultMessage="Always disable compiler"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.disableCompilerHelp"
                            defaultMessage="Disables the {APP_NAME} compiler by default. It can still be manually enabled per-project through Edit > Advanced Settings."
                            values={{
                                APP_NAME
                            }}
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={e => props.onSetPreference('disable-compiler', e.target.checked)}
                    />
                    <BooleanSetting
                        value={!!props.preferences['disable-inspect-block']}
                        label={<FormattedMessage
                            id="nb.editorSettings.disableInspectBlock"
                            defaultMessage="Disable block inspector"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.disableInspectBlockHelp"
                            defaultMessage="Removes the Inspect Block item from the right-click context menu on blocks."
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={e => props.onSetPreference('disable-inspect-block', e.target.checked)}
                    />
                </Section>
            </Box>
        },
        {
            title: messages.security,
            content: <Box>
                <BooleanSetting
                    value={!!props.preferences['unrestrict-sandbox']}
                    label={<FormattedMessage
                        id="nb.editorSettings.unrestrictUnsandboxed"
                        defaultMessage="Allow all extensions to load unsandboxed"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.unrestrictUnsandboxedHelp"
                        // eslint-disable-next-line max-len
                        defaultMessage="Disables extension security prompts and runs all extensions without the sandbox, including extension imports, URL parameter extensions, and project-loaded extensions. This is dangerous and should only be enabled if you fully trust all loaded extensions."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => props.onSetPreference('unrestrict-sandbox', e.target.checked)}
                />
            </Box>
        },
        {
            title: messages.addons,
            content: <AddonSettingsComponent
                // eslint-disable-next-line react/jsx-no-bind
                onDirty={d => setDirty(d)}
                onExportSettings={onExportSettings}
            />,
            escaped: true
        },
        {
            title: messages.display,
            content: <Box>
                <BooleanSetting
                    value={!!props.preferences['compact-tabs']}
                    label={<FormattedMessage
                        id="nb.editorSettings.compactTabs"
                        defaultMessage="Compact tabs"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.compactTabsHelp"
                        defaultMessage="Removes the text from tabs, leaving just the icon."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.onSetPreference('compact-tabs', e.target.checked);
                    }}
                />
                <BooleanSetting
                    value={!!props.preferences['stage-left']}
                    label={<FormattedMessage
                        id="nb.editorSettings.stageLeft"
                        defaultMessage="Stage on left"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.stageLeftHelp"
                        defaultMessage="Swaps the stage and the block palette."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.onSetPreference('stage-left', e.target.checked);
                    }}
                />
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.theme"
                        defaultMessage="Theme"
                    />}
                >
                    <p>
                        <button
                            className={styles.button}
                            onClick={props.onOpenAccentManager}
                        >
                            <FormattedMessage
                                id="nb.editorSettings.openAccentManager"
                                defaultMessage="Open Accent Manager"
                            />
                        </button>
                    </p>
                    <BooleanSetting
                        value={props.theme.gui === GUI_DARK}
                        label={<FormattedMessage
                            id="nb.editorSettings.darkMode"
                            defaultMessage="Dark mode"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.darkModeHelp"
                            defaultMessage="Turns the website dark to make it easier on the eyes."
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={() => props.onChangeTheme(props.theme.set('gui', props.theme.gui === GUI_DARK ? GUI_LIGHT : GUI_DARK))}
                    />
                </Section>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.toolbox"
                        defaultMessage="Toolbox"
                    />}
                >
                    <BooleanSetting
                        value={!!props.preferences['hide-nb-blocks']}
                        label={<FormattedMessage
                            id="nb.editorSettings.vanillaPalette"
                            defaultMessage="Vanilla palette"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.vanillaPaletteHelp"
                            defaultMessage="Hides NitroBolt-exclusive blocks (e.g. extended operators, switch, for-each-in-range, etc.) and hides the JSON and assets categories."
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={e => props.onSetPreference('hide-nb-blocks', e.target.checked)}
                    />
                    <CollapsibleSetting
                        label={<FormattedMessage
                            id="nb.editorSettings.hiddenCategories"
                            defaultMessage="Visible categories"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.hiddenCategoriesHelp"
                            defaultMessage="Choose which default categories to show or hide in the block toolbox."
                        />}
                    >
                        <div><div className={styles.categoryGrid}>
                            {toolboxCategories.map(category => {
                                const isNB = category.id === 'json' || category.id === 'assets';
                                const hideNB = !!props.preferences['hide-nb-blocks'] && isNB;
                                const isVisible = !hideNB && !hiddenCategories.includes(category.id);
                                const visibleCount = toolboxCategories.filter(c =>
                                    !(!!props.preferences['hide-nb-blocks'] && (c.id === 'json' || c.id === 'assets')) &&
                                !hiddenCategories.includes(c.id)
                                ).length;

                                return (
                                    <label
                                        key={category.id}
                                        className={styles.label}
                                    >
                                        <FancyCheckbox
                                            className={styles.checkbox}
                                            checked={isVisible}
                                            disabled={hideNB || (isVisible && visibleCount === 1)}
                                            onChange={() => {
                                                const next = hiddenCategories.includes(category.id) ?
                                                    hiddenCategories.filter(id => id !== category.id) :
                                                    [...hiddenCategories, category.id];
                                                props.onSetPreference('hidden-categories', next);
                                            }}
                                        />
                                        {category.label}
                                    </label>
                                );
                            })}
                        </div>
                        <button
                            className={styles.button}
                            onClick={handleResetCategoriesVisibility}
                            style={{marginTop: '8px'}}
                        >
                            <FormattedMessage
                                id="nb.editorSettings.resetCategoriesVisibility"
                                defaultMessage="Reset to defaults"
                            />
                        </button>
                        </div>
                    </CollapsibleSetting>
                    <CollapsibleSetting
                        label={<FormattedMessage
                            id="nb.editorSettings.blockColors"
                            defaultMessage="Block colors"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.blockColorsHelp"
                            defaultMessage="Customize the primary color of each block category."
                        />}
                    >
                        <div>
                            <div className={styles.categoryGrid}>
                                {BLOCK_COLOR_CATEGORIES.map(cat => {
                                    const value = blockColors[cat.colorId] || cat.default;
                                    return (
                                        <div
                                            key={cat.colorId}
                                            className={classNames(styles.label, styles.categoryColorLabel)}
                                        >
                                            <ColorPicker
                                                value={value}
                                                onChange={v => handleBlockColorPreview(cat.colorId, v)}
                                                onCommit={handleBlockColorCommit(cat.colorId)}
                                                className={styles.colorInput}
                                                showIcon={false}
                                                label={false}
                                                size={'1.8rem'}
                                            />
                                            <span>{cat.label}</span>
                                            <DeleteButton
                                                onClick={handleDeleteBlockColor(cat.colorId)}
                                                className={styles.deleteButton}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                className={styles.button}
                                onClick={handleResetBlockColors}
                                style={{marginTop: '8px'}}
                            >
                                <FormattedMessage
                                    id="nb.editorSettings.resetBlockColors"
                                    defaultMessage="Reset to defaults"
                                />
                            </button>
                        </div>
                    </CollapsibleSetting>
                    <CollapsibleSetting
                        label={<FormattedMessage
                            id="nb.editorSettings.customBlockShape"
                            defaultMessage="Customizable block shape"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.customBlockShapeHelp"
                            defaultMessage="Adjust the padding, corner radius, notch height, and field height of blocks."
                        />}
                    >
                        <div>
                            <div>
                                <Setting
                                    help={<FormattedMessage
                                        id="nb.editorSettings.paddingSizeHelp"
                                        defaultMessage="Controls the overall size and spacing of blocks."
                                    />}
                                    primary={(
                                        <div className={classNames(styles.label, styles.customStageSize)}>
                                            <FormattedMessage
                                                defaultMessage="Padding size (50-200%):"
                                                id="nb.editorSettings.paddingSize"
                                            />
                                            <BufferedInput
                                                value={String(blockShape.paddingSize)}
                                                onSubmit={value => {
                                                    const num = Number(value);
                                                    if (Number.isFinite(num) && num >= 50 && num <= 200) {
                                                        handleSetBlockShape('paddingSize', num);
                                                    }
                                                }}
                                                type="number"
                                                min="50"
                                                max="200"
                                                spellCheck="false"
                                            />
                                        </div>
                                    )}
                                />
                                <Setting
                                    help={<FormattedMessage
                                        id="nb.editorSettings.cornerSizeHelp"
                                        defaultMessage="Controls how rounded the corners of blocks are."
                                    />}
                                    primary={(
                                        <div className={classNames(styles.label, styles.customStageSize)}>
                                            <FormattedMessage
                                                defaultMessage="Corner size (0-300%):"
                                                id="nb.editorSettings.cornerSize"
                                            />
                                            <BufferedInput
                                                value={String(blockShape.cornerSize)}
                                                onSubmit={value => {
                                                    const num = Number(value);
                                                    if (Number.isFinite(num) && num >= 0 && num <= 300) {
                                                        handleSetBlockShape('cornerSize', num);
                                                    }
                                                }}
                                                type="number"
                                                min="0"
                                                max="300"
                                                spellCheck="false"
                                            />
                                        </div>
                                    )}
                                />
                                <Setting
                                    help={<FormattedMessage
                                        id="nb.editorSettings.maxCornerRadiusHelp"
                                        defaultMessage="Sets an upper limit on the corner radius as a multiple of the base corner size, used by round output blocks."
                                    />}
                                    primary={(
                                        <div className={classNames(styles.label, styles.customStageSize)}>
                                            <FormattedMessage
                                                defaultMessage="Max corner radius (1x-12x):"
                                                id="nb.editorSettings.maxCornerRadius"
                                            />
                                            <BufferedInput
                                                value={String(blockShape.maxCornerRadius)}
                                                onSubmit={value => {
                                                    const num = Number(value);
                                                    if (Number.isFinite(num) && num >= 1 && num <= 12) {
                                                        handleSetBlockShape('maxCornerRadius', num);
                                                    }
                                                }}
                                                type="number"
                                                min="1"
                                                max="12"
                                                spellCheck="false"
                                            />
                                        </div>
                                    )}
                                />
                                <Setting
                                    help={<FormattedMessage
                                        id="nb.editorSettings.notchSizeHelp"
                                        defaultMessage="Controls how tall the notches and bumps that let blocks snap together are."
                                    />}
                                    primary={(
                                        <div className={classNames(styles.label, styles.customStageSize)}>
                                            <FormattedMessage
                                                defaultMessage="Notch height (0-150%):"
                                                id="nb.editorSettings.notchSize"
                                            />
                                            <BufferedInput
                                                value={String(blockShape.notchSize)}
                                                onSubmit={value => {
                                                    const num = Number(value);
                                                    if (Number.isFinite(num) && num >= 0 && num <= 150) {
                                                        handleSetBlockShape('notchSize', num);
                                                    }
                                                }}
                                                type="number"
                                                min="0"
                                                max="150"
                                                spellCheck="false"
                                            />
                                        </div>
                                    )}
                                />
                                <Setting
                                    help={<FormattedMessage
                                        id="nb.editorSettings.fieldHeightHelp"
                                        defaultMessage="Controls the height of text inputs and dropdowns inside blocks, independent of overall padding."
                                    />}
                                    primary={(
                                        <div className={classNames(styles.label, styles.customStageSize)}>
                                            <FormattedMessage
                                                defaultMessage="Field height (75-150%):"
                                                id="nb.editorSettings.fieldHeight"
                                            />
                                            <BufferedInput
                                                value={String(blockShape.fieldHeight)}
                                                onSubmit={value => {
                                                    const num = Number(value);
                                                    if (Number.isFinite(num) && num >= 75 && num <= 150) {
                                                        handleSetBlockShape('fieldHeight', num);
                                                    }
                                                }}
                                                type="number"
                                                min="75"
                                                max="150"
                                                spellCheck="false"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                            <p className={styles.info}>
                                <FormattedMessage
                                    id="nb.editorSettings.presets"
                                    defaultMessage="Presets"
                                />
                            </p>
                            <div className={styles.presetRow}>
                                {BLOCK_SHAPE_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        className={styles.button}
                                        onClick={() => handleApplyBlockShapePreset(preset)}
                                        title={preset.description}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSetting>
                </Section>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.dangerZone"
                        defaultMessage="Danger Zone"
                    />}
                >
                    <BooleanSetting
                        value={!!props.preferences['hide-backpack']}
                        label={<FormattedMessage
                            id="nb.editorSettings.hideBackpack"
                            defaultMessage="Hide backpack"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.hideBackpackHelp"
                            defaultMessage="Removes the backpack from the bottom of the screen."
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={e => {
                            props.onSetPreference('hide-backpack', e.target.checked);
                            // resizes block palette and stuff
                            requestAnimationFrame(() => dispatchEvent(new Event('resize')));
                        }}
                    />
                    <BooleanSetting
                        value={!!props.preferences['hide-pause']}
                        label={<FormattedMessage
                            id="nb.editorSettings.hidePause"
                            defaultMessage="Hide pause button"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.hidePauseHelp"
                            defaultMessage="Removes the pause button from the project controls."
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={e => props.onSetPreference('hide-pause', e.target.checked)}
                    />
                    <BooleanSetting
                        value={!!props.preferences['hide-feedback']}
                        label={<FormattedMessage
                            id="nb.editorSettings.hideFeedback"
                            defaultMessage="Hide feedback button"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.hideFeedbackHelp"
                            defaultMessage="Removes the feedback button from the top of the screen."
                        />}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChange={e => props.onSetPreference('hide-feedback', e.target.checked)}
                    />
                    <CollapsibleSetting
                        label={<FormattedMessage
                            id="nb.editorSettings.visibleTabs"
                            defaultMessage="Visible tabs"
                        />}
                        help={<FormattedMessage
                            id="nb.editorSettings.visibleTabsHelp"
                            defaultMessage="Choose which tabs to show in the editor. Hidden tabs can still be accessed via keyboard shortcuts."
                        />}
                    >
                        <div><div className={styles.categoryGrid}>
                            {editorTabs.map(tab => {
                                const isHidden = hiddenTabs.includes(tab.index);
                                const visibleCount = editorTabs.filter(t =>
                                    !hiddenTabs.includes(t.index)
                                ).length;

                                return (
                                    <label
                                        key={tab.index}
                                        className={styles.label}
                                    >
                                        <FancyCheckbox
                                            className={styles.checkbox}
                                            checked={!isHidden}
                                            disabled={!isHidden && visibleCount < 3}
                                            // eslint-disable-next-line react/jsx-no-bind
                                            onChange={() => {
                                                const next = hiddenTabs.includes(tab.index) ?
                                                    hiddenTabs.filter(i => i !== tab.index) :
                                                    [...hiddenTabs, tab.index];
                                                props.onSetPreference('hidden-tabs', next);
                                            }}
                                        />
                                        {tab.label}
                                    </label>
                                );
                            })}
                        </div>
                        <button
                            className={styles.button}
                            onClick={handleResetTabsVisibility}
                            style={{marginTop: '8px'}}
                        >
                            <FormattedMessage
                                id="nb.editorSettings.resetTabsVisibility"
                                defaultMessage="Reset to defaults"
                            />
                        </button>
                        </div>
                    </CollapsibleSetting>
                </Section>
            </Box>
        },
        {
            title: messages.paint,
            content: <Box>
                <Setting
                    primary={(
                        <div className={classNames(styles.label, styles.customStageSize)}>
                            <FormattedMessage
                                defaultMessage="Nudge multiplier:"
                                id="nb.editorSettings.nudgeMultiplier"
                            />
                            <BufferedInput
                                value={String(props.preferences['paint-nudge-multiplier'] ?? 15)}
                                // eslint-disable-next-line react/jsx-no-bind
                                onSubmit={value => {
                                    const num = Number(value);
                                    if (Number.isFinite(num) && num > 0) {
                                        props.onSetPreference('paint-nudge-multiplier', num);
                                    }
                                }}
                                type="number"
                                min="1"
                                spellCheck="false"
                            />
                        </div>
                    )}
                    help={
                        <FormattedMessage
                            id="nb.editorSettings.nudgeMultiplierHelp"
                            defaultMessage="How far selected objects move when pressing Shift+Arrow keys in the paint editor."
                        />
                    }
                />
                <Setting
                    primary={(
                        <div className={classNames(styles.label, styles.customStageSize)}>
                            <FormattedMessage
                                defaultMessage="Canvas size multiplier:"
                                id="nb.editorSettings.canvasSizeMultiplier"
                            />
                            <BufferedInput
                                value={String(props.preferences['paint-canvas-size-multiplier'] ?? 2)}
                                // eslint-disable-next-line react/jsx-no-bind
                                onSubmit={value => {
                                    const num = Number(value);
                                    if (Number.isFinite(num) && num > 0 && num <= 10) {
                                        props.onSetPreference('paint-canvas-size-multiplier', num);
                                    }
                                }}
                                type="number"
                                min="1"
                                max="10"
                                spellCheck="false"
                            />
                        </div>
                    )}
                    help={
                        <FormattedMessage
                            id="nb.editorSettings.canvasSizeMultiplierHelp"
                            defaultMessage="How large the canvas is in the paint editor relative to the stage."
                        />
                    }
                />
                <BooleanSetting
                    value={!!props.preferences['paint-no-swap-button']}
                    label={<FormattedMessage
                        id="nb.editorSettings.noSwapButton"
                        defaultMessage="Hide swap button"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.noSwapButtonHelp"
                        defaultMessage="Hides the fill and outline swap button."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.onSetPreference('paint-no-swap-button', e.target.checked);
                    }}
                />
                <BooleanSetting
                    value={!!props.preferences['paint-no-cut-button']}
                    label={<FormattedMessage
                        id="nb.editorSettings.noCutButton"
                        defaultMessage="Hide cut button"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.noCutButtonHelp"
                        defaultMessage="Hides the cut to clipboard button."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.onSetPreference('paint-no-cut-button', e.target.checked);
                    }}
                />
            </Box>
        },
        {
            title: messages.sound,
            content: <Box>
                <Setting
                    primary={(
                        <div className={classNames(styles.label, styles.customStageSize)}>
                            <FormattedMessage
                                defaultMessage="Encoding bit rate (kbps):"
                                id="nb.editorSettings.encodingBitRate"
                            />
                            <BufferedInput
                                value={props.preferences['encoding-bit-rate'] ?? 128}
                                // eslint-disable-next-line react/jsx-no-bind
                                onSubmit={value => {
                                    props.onSetPreference('encoding-bit-rate', Math.max(1, Math.min(value, 320)));
                                }}
                                type="number"
                                min="1"
                                max="320"
                            />
                        </div>
                    )}
                    help={<FormattedMessage
                        id="nb.editorSettings.encodingBitRateHelp"
                        defaultMessage="Defines the bit rate for sounds encoded in NitroBolt."
                    />}
                />
                <BooleanSetting
                    value={props.preferences['waveform-render-type'] === 'sharp'}
                    label={<FormattedMessage
                        id="nb.editorSettings.waveformRenderType"
                        defaultMessage="Sharp waveforms"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.waveformRenderTypeHelp"
                        defaultMessage="Choose between sharp edges on sound waveforms or soft edges like in Scratch. Sharp edges can offer more detail on large sounds."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.onSetPreference('waveform-render-type', e.target.checked ? 'sharp' : 'soft');
                    }}
                />
                <BooleanSetting
                    value={props.preferences['waveform-color'] === 'volume'}
                    label={<FormattedMessage
                        id="nb.editorSettings.waveformColor"
                        defaultMessage="Waveform volume gradient"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.waveformColorHelp"
                        defaultMessage="If checked, waveforms will display a volume gradient where green is quieter and red is louder."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.onSetPreference('waveform-color', e.target.checked ? 'volume' : null);
                    }}
                />
            </Box>
        },
        {
            title: messages.versionControl,
            content: <Box>
                <Setting
                    primary={(
                        <div className={classNames(styles.label, styles.customStageSize)}>
                            <FormattedMessage
                                defaultMessage="Default branch name:"
                                id="nb.editorSettings.versionControl.defaultBranch"
                            />
                            <BufferedInput
                                value={props.preferences['git-default-branch'] || 'master'}
                                // eslint-disable-next-line react/jsx-no-bind
                                onSubmit={value => {
                                    props.onSetPreference('git-default-branch', value.trim() || 'master');
                                }}
                                type="text"
                                spellCheck="false"
                            />
                        </div>
                    )}
                    help={<FormattedMessage
                        defaultMessage="The initial branch name used when creating a new Git repository. Existing repositories are not affected."
                        id="nb.editorSettings.versionControl.defaultBranchHelp"
                    />}
                />
            </Box>
        },
        {
            title: messages.keymap,
            content: <Box>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.keymap.popups"
                        defaultMessage="Popups"
                    />}
                >
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Open backpack"
                            id="nb.editorSettings.keymap.openBackpack"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-open-backpack', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-open-backpack'] ?? defaultKeyboardShortcuts['open-backpack']}
                        />
                    </Box>
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Open editor settings"
                            id="nb.editorSettings.keymap.openEditorSettings"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-open-editor-settings', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-open-editor-settings'] ?? defaultKeyboardShortcuts['open-editor-settings']}
                        />
                    </Box>
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Open extension catalog"
                            id="nb.editorSettings.keymap.openExtentions"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-open-extensions', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-open-extensions'] ?? defaultKeyboardShortcuts['open-extensions']}
                        />
                    </Box>
                </Section>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.keymap.projectControls"
                        defaultMessage="Project Controls"
                    />}
                >
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Start project"
                            id="nb.editorSettings.keymap.startProject"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-start-project', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-start-project'] ?? defaultKeyboardShortcuts['start-project']}
                        />
                    </Box>
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Stop project"
                            id="nb.editorSettings.keymap.stopProject"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-stop-project', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-stop-project'] ?? defaultKeyboardShortcuts['stop-project']}
                        />
                    </Box>
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Toggle project full screen"
                            id="nb.editorSettings.keymap.projectFullScreen"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-project-full-screen', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-project-full-screen'] ?? defaultKeyboardShortcuts['project-full-screen']}
                        />
                    </Box>
                </Section>
                <Section
                    title={<FormattedMessage
                        id="nb.editorSettings.keymap.spriteSettings"
                        defaultMessage="Sprite Settings"
                    />}
                >
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Change sprite name"
                            id="nb.editorSettings.keymap.changeSpriteName"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-change-sprite-name', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-change-sprite-name'] ?? defaultKeyboardShortcuts['change-sprite-name']}
                        />
                    </Box>
                    <Box className={styles.keySetting}>
                        <FormattedMessage
                            defaultMessage="Toggle sprite visibility"
                            id="nb.editorSettings.keymap.spriteVisibility"
                        />
                        <KeyInput
                            onChange={shortcut => props.onSetPreference('keybind-toggle-sprite-visibility', shortcut.toJSON())}
                            shortcut={props.preferences['keybind-toggle-sprite-visibility'] ?? defaultKeyboardShortcuts['toggle-sprite-visibility']}
                        />
                    </Box>
                </Section>
            </Box>
        }
    ];

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="editorSettingsModal"
        >
            <Box className={styles.body}>
                <div className={styles.topicList}>
                    <div className={styles.navigation}>
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className={classNames(styles.topicItem, {
                                    [styles.active]: selectedSectionIndex === index
                                })}
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick={() => setSelectedSectionIndex(index)}
                            >
                                {section.icon &&
                                    <img
                                        src={section.icon}
                                        width="20"
                                        height="20"
                                    />
                                }
                                <FormattedMessage
                                    {...section.title}
                                />
                            </div>
                        ))}
                    </div>
                    {dirty && (
                        <button
                            className={classNames(styles.button, styles.dirtyButton)}
                            // eslint-disable-next-line react/jsx-handler-names
                            onClick={() => location.reload()}
                        >
                            <FormattedMessage
                                id="nb.editorSettings.dirty"
                                defaultMessage="Refresh to apply settings"
                            />
                        </button>
                    )}
                </div>
                {sections[selectedSectionIndex].escaped ?
                    <div
                        className={classNames(
                            styles.content,
                            styles.escaped
                        )}
                    >
                        {sections[selectedSectionIndex].content}
                    </div> :
                    <div className={styles.content}>
                        <h1><FormattedMessage {...sections[selectedSectionIndex].title} /></h1>
                        {sections[selectedSectionIndex].content}
                    </div>
                }
            </Box>
        </Modal>
    );
};

EditorSettingsModal.propTypes = {
    intl: intlShape,
    // eslint-disable-next-line react/no-unused-prop-types
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onChangeTheme: PropTypes.func,
    onOpenAccentManager: PropTypes.func.isRequired,
    onSetUsername: PropTypes.func,
    preferences: PropTypes.object.isRequired,
    onSetPreference: PropTypes.func.isRequired,
    vm: PropTypes.object,
    theme: PropTypes.instanceOf(Theme),
    username: PropTypes.string,
    usernameInvalid: PropTypes.bool,
    activeTab: PropTypes.number
};

EditorSettingsModal.defaultProps = {
    hiddenCategories: []
};

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme,
    username: state.scratchGui.tw.username,
    usernameInvalid: state.scratchGui.tw.usernameInvalid,
    activeTab: state.scratchGui.modals.editorSettingsModalTab,
    preferences: state.scratchGui.preferences,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onSetPreference: (key, value) => dispatch(setPreference(key, value)),
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        persistTheme(theme);
    },
    onOpenAccentManager: () => {
        dispatch(closeEditorSettingsModal());
        dispatch(openCustomAccentModal());
    },
    onSetUsername: username => {
        dispatch(setUsername(username));
        dispatch(setUsernameInvalid(false));
    },
    onSetHiddenCategories: hiddenCategories => dispatch(setHiddenCategories(hiddenCategories))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(EditorSettingsModal));
