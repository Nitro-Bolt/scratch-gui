/* eslint-disable max-len */
import {defineMessages, FormattedMessage, intlShape, injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './editor-settings-modal.css';
import Box from '../box/box.jsx';
import {sections} from './sections.jsx';
import classNames from 'classnames';

const messages = defineMessages({
    title: {
        defaultMessage: 'Editor Settings',
        description: 'Title of editor settings modal',
        id: 'nb.editorSettings.title'
    }
});

const EditorSettingsModal = props => {
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
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
                            <FormattedMessage
                                {...section.title}
                            />
                        </div>
                    ))}
                </div>
                <div className={styles.content}>
                    {sections[selectedSectionIndex].content}
                </div>
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
