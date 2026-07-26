import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import styles from './extension-manager-modal.css';

const messages = defineMessages({
    title: {
        defaultMessage: 'Extension Manager',
        description: 'Title of modal that appears when loading the Extension Manager',
        id: 'nb.extensionManager.title'
    }
});

const ExtensionManagerModal = props => {
    const [loadedExtensions, setLoadedExtensions] = useState(Array.from(props.vm.extensionManager._loadedExtensions));

    useEffect(() => {
        setLoadedExtensions(Array.from(props.vm.extensionManager._loadedExtensions));
    }, [props.vm.extensionManager._loadedExtensions]);

    let loadedAmountText;
    if (loadedExtensions.length == 0) {
        loadedAmountText = 'No extensions loaded';
    } else if (loadedExtensions.length == 1) {
        loadedAmountText = '1 loaded extension';
    } else {
        loadedAmountText = `${loadedExtensions.length} loaded extensions`;
    }

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="extensionManagerModal"
        >
            <Box className={styles.body}>
                <p>{loadedAmountText}</p>
                {loadedExtensions.map((extension, index) => (
                    <div
                        className={styles.extensionCard}
                        key={index}
                        draggable={props.draggable}
                        onDragStart={() => props.handleDragStart(index)}
                        onDragEnd={props.handleDragEnd}
                        onDragOver={props.handleDragOver}
                        onDrop={() => props.handleDrop(index)}
                    >
                        <p>{extension[0]}</p>
                        {!props.multiSelect ?
                            <button
                                className={styles.deleteOption}
                                onClick={() => props.removeExtension(extension[0])}
                            /> :
                            <FancyCheckbox
                                className={styles.checkboxOption}
                                onChange={props.updateExtensionList}
                                value={extension[0]}
                            />
                        }
                    </div>
                ))}
                {(!(loadedExtensions.length < 2) && !props.multiSelect) && (
                    <Box className={styles.multiSelectRow}>
                        <button
                            className={styles.multiSelectNormal}
                            onClick={props.changeMultiSelectState}
                        >
                            Select Multiple
                        </button>
                    </Box>
                )}
                {props.multiSelect && (
                    <Box className={styles.multiSelectRow}>
                        <button
                            className={styles.multiSelectNormal}
                            onClick={props.changeMultiSelectState}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.multiSelectDelete}
                            onClick={() => props.removeExtensions(props.extensions)}
                        >
                            Delete
                        </button>
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

ExtensionManagerModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    vm: PropTypes.shape({
        extensionManager: PropTypes.shape({
            removeExtension: PropTypes.func,
            reorderExtension: PropTypes.func
        })
    })
};

export default injectIntl(ExtensionManagerModal);
