/* eslint-disable max-len */
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
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
import {connect} from 'react-redux';
import helpIcon from './help-icon.svg';
import {APP_NAME} from '../../lib/brand.js';
import {setUsername, setUsernameInvalid} from '../../reducers/tw.js';
import isScratchDesktop from '../../lib/isScratchDesktop.js';
import {generateRandomUsername} from '../../lib/tw-username.js';

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
    accents: {
        id: 'nb.editorSettings.accentsSection',
        defaultMessage: 'Accents'
    },
    addons: {
        id: 'nb.editorSettings.addonsSection',
        defaultMessage: 'Addons'
    },
    analytics: {
        id: 'nb.editorSettings.analyticsSection',
        defaultMessage: 'Analytics'
    },
    display: {
        id: 'nb.editorSettings.displaySection',
        defaultMessage: 'Display'
    },
    git: {
        id: 'nb.editorSettings.gitSection',
        defaultMessage: 'Git'
    },
    keymap: {
        id: 'nb.editorSettings.keymapSection',
        defaultMessage: 'Keymap'
    },
    projects: {
        id: 'nb.editorSettings.projectsSection',
        defaultMessage: 'Projects'
    }
});

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

const EditorSettingsModal = props => {
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
    const [windchimeOptOut, setWindchimeOptOut] = useState(localStorage.getItem('tw:windchime_opt_out') === 'true');
    const [dirty, setDirty] = useState(false);

    const sections = [
        {
            title: messages.accents,
            content: <button
                className={styles.button}
                onClick={props.onOpenAccentManager}
            >
                <FormattedMessage
                    id="nb.editorSettings.openAccentManager"
                    defaultMessage="Open Accent Manager"
                />
            </button>
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
            title: messages.analytics,
            content: <Box>
                <BooleanSetting
                    value={!windchimeOptOut}
                    label={<FormattedMessage
                        id="nb.editorSettings.viewCounter"
                        defaultMessage="Allow counting my views"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.viewCounterHelp"
                        defaultMessage="When you start a project that is loaded from Scratch, this may be logged so that a view counter can be incremented over time. Views are anonymous and can not be tied back to any user."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        localStorage.setItem('tw:windchime_opt_out', !e.target.checked);
                        setWindchimeOptOut(!e.target.checked);
                    }}
                />
            </Box>
        },
        {
            title: messages.display,
            content: <Box>
                <BooleanSetting
                    value={!!props.prefs['compact-tabs']}
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
                        props.setPref('compact-tabs', e.target.checked);
                    }}
                />
                <div className={styles.header}>
                    <FormattedMessage
                        id="nb.editorSettings.dangerZone"
                        defaultMessage="Danger Zone"
                    />
                    <div className={styles.divider} />
                </div>
                <BooleanSetting
                    value={!!props.prefs['hide-backpack']}
                    label={<FormattedMessage
                        id="nb.editorSettings.hideBackpack"
                        defaultMessage="Hide backback"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.hideBackpackHelp"
                        defaultMessage="Removes the backpack from the bottom of the screen."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => {
                        props.setPref('hide-backpack', e.target.checked);
                        // resizes block palette and stuff
                        requestAnimationFrame(() => dispatchEvent(new Event('resize')));
                    }}
                />
                <BooleanSetting
                    value={!!props.prefs['hide-feedback']}
                    label={<FormattedMessage
                        id="nb.editorSettings.hideFeedback"
                        defaultMessage="Hide feedback button"
                    />}
                    help={<FormattedMessage
                        id="nb.editorSettings.hideFeedbackHelp"
                        defaultMessage="Removes the feedback button from the top of the screen."
                    />}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => props.setPref('hide-feedback', e.target.checked)}
                />
            </Box>
        },
        {
            title: messages.git,
            content: null
        },
        {
            title: messages.keymap,
            content: null
        },
        {
            title: messages.projects,
            content: <Box>
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
                <div className={styles.header}>
                    <FormattedMessage
                        id="nb.editorSettings.dangerZone"
                        defaultMessage="Danger Zone"
                    />
                    <div className={styles.divider} />
                </div>
                <BooleanSetting
                    value={!!props.prefs['disable-compiler']}
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
                    onChange={e => props.setPref('disable-compiler', e.target.checked)}
                />
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
                    {sections.sort((a, b) => a.title.defaultMessage > b.title.defaultMessage).map((section, index) => (
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
                    {dirty && (
                        <div
                            className={styles.topicItem}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => location.reload()}
                        >
                            <FormattedMessage
                                id="nb.editorSettings.dirty"
                                defaultMessage="Reload to apply settings"
                            />
                        </div>
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
    onOpenAccentManager: PropTypes.func.isRequired,
    onSetUsername: PropTypes.func,
    prefs: PropTypes.any,
    setPref: PropTypes.func.isRequired,
    username: PropTypes.string,
    usernameInvalid: PropTypes.bool
};

const mapStateToProps = state => ({
    username: state.scratchGui.tw.username,
    usernameInvalid: state.scratchGui.tw.usernameInvalid
});

const mapDispatchToProps = dispatch => ({
    onOpenAccentManager: () => {
        dispatch(closeEditorSettingsModal());
        dispatch(openCustomAccentModal());
    },
    onSetUsername: username => {
        dispatch(setUsername(username));
        dispatch(setUsernameInvalid(false));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(EditorSettingsModal));
