/* eslint-disable max-len */
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './editor-settings-modal.css';
import Box from '../box/box.jsx';
import classNames from 'classnames';
import AddonSettingsComponent from '../../addons/settings/settings.jsx';
import {onExportSettings} from '../../playground/addon-settings.jsx';

const messages = defineMessages({
    title: {
        defaultMessage: 'Editor Settings',
        description: 'Title of editor settings modal',
        id: 'nb.editorSettings.title'
    },
    accents: {
        id: 'nb.editorSettings.accentsSection',
        defaultMessage: 'Accents'
    },
    addons: {
        id: 'nb.editorSettings.addonsSection',
        defaultMessage: 'Addons'
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

const EditorSettingsModal = props => {
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
    const [dirty, setDirty] = useState(false);

    const sections = [
        {
            title: messages.accents,
            content: null
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
    onClose: PropTypes.func.isRequired
};

export default injectIntl(EditorSettingsModal);
