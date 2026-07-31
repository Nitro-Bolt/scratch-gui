import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import dropdownCaret from '../menu-bar/dropdown-caret.svg';

import styles from './inspect-block-modal.css';

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

const InputBlock = ({block}) => {
    if (!block) {
        return <span className={styles.empty}>Empty</span>;
    }
    return (
        <div className={styles.inputBlock}>
            <DetailRow label="Value">
                <span>{block.text}</span>
            </DetailRow>
            <DetailRow label={block.type}>
                <span>{}</span>
            </DetailRow>
        </div>
    );
};
InputBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        text: PropTypes.string,
        isShadow: PropTypes.bool
    })
};

const InspectBlockModal = props => {
    const data = props.block;
    if (!data) {
        return null;
    }

    const connectionLabel = connected => (connected ? 'Yes' : 'No');

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        }
    };

    const inputList = data.inputs || [];
    const fieldList = data.fields || [];

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel="Inspect Block"
            id="inspectBlockModal"
        >
            <Box className={styles.body}>
                <div className={styles.blockText}>{data.text}</div>
                <button
                    className={styles.copyButton}
                    onClick={handleCopy}
                >
                    {'Copy JSON'}
                </button>

                <Section title="Details">
                    <div className={styles.detailsGrid}>
                        <DetailRow label="ID">
                            <span>{data.id}</span>
                        </DetailRow>
                        <DetailRow label="Type">
                            <span>{data.type}</span>
                        </DetailRow>
                        <DetailRow label="Category">
                            {data.category}
                        </DetailRow>
                        <DetailRow label="Position">
                            <span>{`${data.x}, ${data.y}`}</span>
                        </DetailRow>
                        <DetailRow label="Size">
                            <span>{`${data.width} x ${data.height}`}</span>
                        </DetailRow>
                        <DetailRow label="Shadow">
                            {connectionLabel(data.isShadow)}
                        </DetailRow>
                        <DetailRow label="Descendants">
                            {data.descendantCount}
                        </DetailRow>
                    </div>
                </Section>

                <Section title="Connections">
                    <div className={styles.detailsGrid}>
                        <DetailRow label="Previous">
                            {connectionLabel(data.hasPreviousConnection)}
                        </DetailRow>
                        <DetailRow label="Next">
                            {connectionLabel(data.hasNextConnection)}
                        </DetailRow>
                        <DetailRow label="Output">
                            {connectionLabel(data.hasOutputConnection)}
                        </DetailRow>
                        <DetailRow label="Parent">
                            {data.parentId ?
                                <span>{data.parentId}</span> :
                                <span className={styles.empty}>{'None'}</span>
                            }
                        </DetailRow>
                        <DetailRow label="Next block">
                            {data.nextId ?
                                <span>{data.nextId}</span> :
                                <span className={styles.empty}>{'None'}</span>
                            }
                        </DetailRow>
                    </div>
                </Section>

                <Section title="Inputs">
                    {inputList.length === 0 ? (
                        <span className={styles.empty}>{'None'}</span>
                    ) : (
                        <ul className={styles.inputList}>
                            {inputList.filter(i => i.name || i.block).map((i, idx) => (
                                <li key={idx}>
                                    <div className={styles.inputHeader}>
                                        <span className={styles.valueName}>{i.name || 'Unnamed'}</span>
                                        <span className={styles.inputType}>{i.type}</span>
                                        {i.shadow && <span className={styles.inputType}>{'shadow'}</span>}
                                        {i.block && <span className={styles.inputType}>{i.block.id}</span>}
                                    </div>
                                    <InputBlock block={i.block} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                <Section title="Fields">
                    {fieldList.length === 0 ? (
                        <span className={styles.empty}>{'None'}</span>
                    ) : (
                        <ul className={styles.valueList}>
                            {fieldList.map((field, index) => (
                                <li key={index}>
                                    <span className={styles.valueName}>
                                        {`Name: ${field.name}`}
                                    </span>
                                    <span className={styles.value}>
                                        {`Value: ${field.text || field.value}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>
            </Box>
        </Modal>
    );
};

InspectBlockModal.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        text: PropTypes.string,
        category: PropTypes.string,
        isShadow: PropTypes.bool,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        inputs: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
            block: PropTypes.shape({
                id: PropTypes.string,
                type: PropTypes.string,
                text: PropTypes.string,
                isShadow: PropTypes.bool
            })
        })),
        fields: PropTypes.arrayOf(PropTypes.object),
        hasPreviousConnection: PropTypes.bool,
        hasNextConnection: PropTypes.bool,
        hasOutputConnection: PropTypes.bool,
        parentId: PropTypes.string,
        nextId: PropTypes.string,
        descendantCount: PropTypes.number
    }),
    onClose: PropTypes.func.isRequired
};

export default InspectBlockModal;
