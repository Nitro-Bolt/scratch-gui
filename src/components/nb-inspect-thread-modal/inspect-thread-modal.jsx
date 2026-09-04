import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import dropdownCaret from '../menu-bar/dropdown-caret.svg';

import styles from './inspect-thread-modal.css';

const round = value => Math.round(value * 100) / 100;

const DetailRow = ({label, children}) => (
    <div className={styles.row}>
        <span className={styles.key}>{label}</span>
        <span className={styles.value}>{children}</span>
    </div>
);
DetailRow.propTypes = {
    label: PropTypes.node.isRequired,
    children: PropTypes.node
};

const Connection = ({block, onReplaceBlock}) => (
    (!block || !block.id) ?
        <span className={styles.empty}>{'None'}</span> :
        <span
            style={{cursor: 'pointer'}}
            onClick={() => onReplaceBlock(block)}
        >
            {block.id}
        </span>
);
Connection.propTypes = {
    block: PropTypes.object.isRequired,
    onReplaceBlock: PropTypes.func
};

const Section = ({title, children}) => {
    const [expanded, setExpanded] = useState(true);
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>
                <span>{title}</span>
                <button
                    onClick={() => setExpanded(e => !e)}
                    className={styles.sectionDropdownCaret}
                >
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

const InspectThreadModal = props => {
    const {thread} = props;

    if (!thread) {
        return null;
    }

    const bool = value => value ? 'Yes' : 'No';

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel="Inspect Thread"
            id="inspectThreadModal"
        >
            <Box className={styles.body}>
                <Section title="Details">
                    <div className={styles.detailsGrid}>
                        <DetailRow label="Top Block">
                            <span>{thread.topBlock}</span>
                        </DetailRow>
                        <DetailRow label="Compiled">
                            <span>{bool(thread.isCompiled)}</span>
                        </DetailRow>
                        <DetailRow label="Paused">
                            {bool(thread.isPaused)}
                        </DetailRow>
                        <DetailRow label="Alive">
                            {bool(!thread.isKilled)}
                        </DetailRow>
                        <DetailRow label="Activated Via">
                            {thread.stackClick ? "Click" : "Hat"}
                        </DetailRow>
                    </div>
                </Section>
            </Box>
        </Modal>
    );
};
InspectThreadModal.propTypes = {
    thread: PropTypes.object,
    onClose: PropTypes.func.isRequired
};

export default InspectThreadModal;
