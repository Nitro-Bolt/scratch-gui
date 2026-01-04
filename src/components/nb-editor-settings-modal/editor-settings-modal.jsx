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
import {onExportSettings} from '../../playground/addon-settings.jsx';
import {closeEditorSettingsModal, openCustomAccentModal} from '../../reducers/modals.js';
import {connect} from 'react-redux';
import helpIcon from './help-icon.svg';
import {APP_NAME} from '../../lib/brand.js';

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
    display: {
        id: 'nb.editorSettings.displaySection',
        defaultMessage: 'Display'
    },
    git: {
        id: 'nb.editorSettings.gitSection',
        defaultMessage: 'Git'
    },
    shortcuts: {
        id: 'nb.editorSettings.shortcutsSection',
        defaultMessage: 'Shortcuts'
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
            title: messages.display,
            content: <Box>
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
                        defaultMessage="Always Disable Compiler"
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
                <BooleanSetting
                    value={!!props.prefs['hide-backpack']}
                    label={<FormattedMessage
                        id="nb.editorSettings.hideBackpack"
                        defaultMessage="Hide Backback"
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
                        defaultMessage="Hide Feedback Button"
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
            title: messages.shortcuts,
            content: null
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
    prefs: PropTypes.any,
    setPref: PropTypes.func.isRequired
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    onOpenAccentManager: () => {
        dispatch(closeEditorSettingsModal());
        dispatch(openCustomAccentModal());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(EditorSettingsModal));
