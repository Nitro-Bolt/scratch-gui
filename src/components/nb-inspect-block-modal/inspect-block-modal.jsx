import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import dropdownCaret from '../menu-bar/dropdown-caret.svg';

import styles from './inspect-block-modal.css';

const round = value => Math.round(value * 100) / 100;

const blockToJSON = block => {
    if (!block) {
        return null;
    }
    const position = block.getRelativeToSurfaceXY();
    const size = block.getHeightWidth();
    const fieldToJSON = field => {
        let value = null;
        let text = null;
        try {
            value = field.getValue();
            text = field.getText();
        } catch (e) { /* empty */ }
        return {
            name: field.name,
            text,
            value
        };
    };
    return {
        id: block.id,
        type: block.type,
        text: block.toString(100),
        category: block.getCategory() || null,
        color: block.getColour(),
        isShadow: block.isShadow(),
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        fields: (block.fieldRow || []).map(fieldToJSON),
        inputs: (block.inputList || []).map(input => ({
            name: input.name,
            type: input.type,
            fields: (input.fieldRow || []).map(fieldToJSON),
            block: blockToJSON(input.connection ? input.connection.targetBlock() : null)
        })),
        parentId: block.getParent() ? block.getParent().id : null,
        nextId: block.getNextBlock() ? block.getNextBlock().id : null,
        rootId: block.getRootBlock() ? block.getRootBlock().id : null,
        descendantCount: block.getDescendants(false, true).length
    };
};

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

const buildXml = block => {
    const blockly = window.ScratchBlocks;
    if (!blockly || !blockly.Xml || !block) {
        return '';
    }
    try {
        const root = document.createElement('xml');
        root.appendChild(blockly.Xml.blockToDom(block, true));
        return blockly.Xml.domToPrettyText(root);
    } catch (e) {
        return '';
    }
};

const InspectBlockModal = props => {
    const {block} = props;
    const [xmlText, setXmlText] = useState(() => buildXml(block));
    const [xmlError, setXmlError] = useState(null);

    useEffect(() => {
        setXmlText(buildXml(block));
        setXmlError(null);
    }, [block]);

    if (!block) {
        return null;
    }

    const connectionLabel = connected => (connected ? 'Yes' : 'No');

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(JSON.stringify(blockToJSON(block), null, 2));
        }
    };

    const handleReloadXml = () => {
        setXmlText(buildXml(block));
        setXmlError(null);
    };

    const handleApply = () => {
        const blockly = window.ScratchBlocks;
        if (!blockly || !blockly.Xml) {
            setXmlError('Blockly is not available');
            return;
        }

        let doc;
        try {
            doc = blockly.Xml.textToDom(xmlText);
        } catch (e) {
            setXmlError(`Invalid XML: ${e.message}`);
            return;
        }

        let xmlBlock = null;
        for (let i = 0; i < doc.childNodes.length; i++) {
            const node = doc.childNodes[i];
            if (node.nodeName === 'block' || node.nodeName === 'shadow') {
                xmlBlock = node;
                break;
            }
        }
        if (!xmlBlock) {
            setXmlError('No <block> or <shadow> element found in the XML');
            return;
        }
        if (xmlBlock.getAttribute('id')) {
            xmlBlock.removeAttribute('id');
        }
        if (xmlBlock.querySelectorAll) {
            xmlBlock.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        }

        const workspace = block.workspace;
        if (!workspace) {
            setXmlError('The block is no longer on a workspace');
            return;
        }
        const xy = block.getRelativeToSurfaceXY();
        const parent = block.getParent();
        const parentInput = parent ? parent.getInputWithBlock(block) : null;
        const prevConn = block.previousConnection && block.previousConnection.isConnected() ?
            block.previousConnection.targetConnection : null;
        const nextConn = block.nextConnection && block.nextConnection.isConnected() ?
            block.nextConnection.targetConnection : null;

        let newBlock;
        try {
            newBlock = blockly.Xml.domToBlock(xmlBlock, workspace);
        } catch (e) {
            setXmlError(`Failed to create block: ${e.message}`);
            return;
        }

        try {
            newBlock.moveBy(xy.x, xy.y);
            const newConn = newBlock.outputConnection || newBlock.previousConnection;
            if (parentInput && parentInput.connection && newConn) {
                parentInput.connection.connect(newConn);
            } else if (prevConn && newBlock.previousConnection) {
                prevConn.connect(newBlock.previousConnection);
            }
            if (nextConn && newBlock.nextConnection && !newBlock.nextConnection.isConnected()) {
                newBlock.nextConnection.connect(nextConn);
            }
            block.dispose(false, false);
        } catch (e) {
            newBlock.dispose(false, false);
            setXmlError(`Failed to replace block: ${e.message}`);
            return;
        }

        if (props.onReplaceBlock) {
            props.onReplaceBlock(newBlock);
        }
        setXmlError(null);
    };

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={props.onClose}
            contentLabel="Inspect Block"
            id="inspectBlockModal"
        >
            <Box className={styles.body}>
                <div className={styles.blockText}>{block.toString(100)}</div>
                <button
                    className={styles.coolButton}
                    onClick={handleCopy}
                >
                    {'Copy JSON'}
                </button>

                <Section title="Details">
                    <div className={styles.detailsGrid}>
                        <DetailRow label="ID">
                            <span>{block.id}</span>
                        </DetailRow>
                        <DetailRow label="Type">
                            <span>{block.type}</span>
                        </DetailRow>
                        <DetailRow label="Category">
                            {block.getCategory()}
                        </DetailRow>
                        <DetailRow label="Color">
                            {block.getColour()}
                        </DetailRow>
                        <DetailRow label="Position">
                            <span>{`${
                                round(block.getRelativeToSurfaceXY().x)
                            }, ${
                                round(block.getRelativeToSurfaceXY().y)
                            }`}</span>
                        </DetailRow>
                        <DetailRow label="Size">
                            <span>{`${
                                round(block.getHeightWidth().width)
                            } x ${
                                round(block.getHeightWidth().height)
                            }`}</span>
                        </DetailRow>
                        <DetailRow label="Shadow">
                            {connectionLabel(block.isShadow())}
                        </DetailRow>
                    </div>
                </Section>

                <Section title="Connections">
                    <div className={styles.detailsGrid}>
                        <DetailRow label="Descendants">
                            {block.getDescendants(false, true).length}
                        </DetailRow>
                        <DetailRow label="Previous">
                            <Connection
                                block={block.getPreviousBlock()}
                                onReplaceBlock={props.onReplaceBlock}
                            />
                        </DetailRow>
                        <DetailRow label="Next">
                            <Connection
                                block={block.getNextBlock()}
                                onReplaceBlock={props.onReplaceBlock}
                            />
                        </DetailRow>
                        <DetailRow label="Output">
                            <Connection
                                block={block?.outputConnection?.targetBlock()}
                                onReplaceBlock={props.onReplaceBlock}
                            />
                        </DetailRow>
                        <DetailRow label="Parent">
                            <Connection
                                block={block.getParent()}
                                onReplaceBlock={props.onReplaceBlock}
                            />
                        </DetailRow>
                        <DetailRow label="Root">
                            <Connection
                                block={block.getRootBlock()}
                                onReplaceBlock={props.onReplaceBlock}
                            />
                        </DetailRow>
                    </div>
                </Section>

                <Section title="XML">
                    <div className={styles.xmlActions}>
                        <button
                            className={styles.coolButton}
                            onClick={handleApply}
                        >
                            {'Apply'}
                        </button>
                        <button
                            className={styles.coolButton}
                            onClick={handleReloadXml}
                        >
                            {'Reload XML'}
                        </button>
                    </div>
                    {xmlError && (
                        <div className={styles.xmlError}>{xmlError}</div>
                    )}
                    <textarea
                        className={styles.xmlTextarea}
                        value={xmlText}
                        onChange={e => setXmlText(e.target.value)}
                        spellCheck={false}
                    />
                </Section>
            </Box>
        </Modal>
    );
};
InspectBlockModal.propTypes = {
    block: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onReplaceBlock: PropTypes.func
};

export default InspectBlockModal;
