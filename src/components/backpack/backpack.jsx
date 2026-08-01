import React from 'react';
/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {FormattedMessage, defineMessages, injectIntl, intlShape} from 'react-intl';
import DragConstants from '../../lib/drag-constants';
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import FolderTile from '../folder-tile/folder-tile.jsx';
import styles from './backpack.css';
import {defaultKeyboardShortcuts, registerKeyboardShortcut} from '../../lib/nb-keyboard-shortcut.js';

// TODO make sprite selector item not require onClick
const noop = () => {};
const BACKPACK_FOLDER_DRAG_TYPE = 'application/x-nitrobolt-folder';
const idsEqual = (first, second) => `${first}` === `${second}`;

const dragTypeMap = { // Keys correspond with the backpack-server item types
    costume: DragConstants.BACKPACK_COSTUME,
    sound: DragConstants.BACKPACK_SOUND,
    asset: DragConstants.BACKPACK_ASSET,
    script: DragConstants.BACKPACK_CODE,
    sprite: DragConstants.BACKPACK_SPRITE
};

const labelMap = defineMessages({
    costume: {
        id: 'gui.backpack.costumeLabel',
        defaultMessage: 'costume',
        description: 'Label for costume backpack item'
    },
    sound: {
        id: 'gui.backpack.soundLabel',
        defaultMessage: 'sound',
        description: 'Label for sound backpack item'
    },
    asset: {
        id: 'gui.backpack.assetLabel',
        defaultMessage: 'asset',
        description: 'Label for asset backpack item'
    },
    script: {
        id: 'gui.backpack.scriptLabel',
        defaultMessage: 'script',
        description: 'Label for script backpack item'
    },
    sprite: {
        id: 'gui.backpack.spriteLabel',
        defaultMessage: 'sprite',
        description: 'Label for sprite backpack item'
    },
    folder: {
        id: 'gui.backpack.folderLabel',
        defaultMessage: 'folder',
        description: 'Label for backpack folder'
    }
});

const Backpack = ({
    blockDragOver,
    containerRef,
    contents,
    dragOver,
    error,
    expanded,
    intl,
    loading,
    showMore,
    onToggle,
    onDelete,
    onRename,
    onMouseEnter,
    onMouseLeave,
    onMore,
    onCreateFolder,
    onFolderColorChange,
    onFolderDropTargetChange,
    onFolderReorder,
    onFolderToggle,
    onMoveToFolder,
    foldersEnabled,
    preferences
}) => {
    const closedFolders = contents
        .filter(item => item.type === 'folder' && item.open === false)
        .map(item => item.id);
    const [draggedFolderId, setDraggedFolderId] = React.useState(null);
    const isFolderClosed = folderId => closedFolders.some(id => idsEqual(id, folderId));
    const setFolderDropTarget = (folderId, destinationId = null, insertAfter = false) => {
        if (onFolderDropTargetChange) onFolderDropTargetChange(folderId, destinationId, insertAfter);
    };
    const updateFolderDropTarget = (folderId, destinationId, event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const midpoint = box.left + (box.width / 2);
        const isRtl = document.documentElement.dir === 'rtl';
        const insertAfter = isRtl ? event.clientX < midpoint : event.clientX > midpoint;
        setFolderDropTarget(folderId, destinationId, insertAfter);
    };
    registerKeyboardShortcut(
        preferences['keybind-open-backpack'] ?? defaultKeyboardShortcuts['open-backpack'],
        onToggle
    );
    const toggleFolder = folderId => {
        const opening = isFolderClosed(folderId);
        onFolderToggle(folderId, opening);
    };
    const isFolderDrag = event => draggedFolderId || (event.dataTransfer && event.dataTransfer.types &&
        Array.from(event.dataTransfer.types).includes(BACKPACK_FOLDER_DRAG_TYPE));
    const handleFolderDragOver = event => {
        if (!isFolderDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
    };
    const handleFolderDrop = (destinationId, event) => {
        if (!isFolderDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        const sourceId = event.dataTransfer.getData(BACKPACK_FOLDER_DRAG_TYPE) || draggedFolderId;
        if (sourceId && `${sourceId}` === `${destinationId}`) {
            setDraggedFolderId(null);
            return;
        }
        if (sourceId) {
            const box = event.currentTarget.getBoundingClientRect();
            const midpoint = box.left + (box.width / 2);
            const isRtl = document.documentElement.dir === 'rtl';
            const insertAfter = isRtl ? event.clientX < midpoint : event.clientX > midpoint;
            onFolderReorder(sourceId, destinationId, insertAfter);
        }
        setDraggedFolderId(null);
    };
    const folders = foldersEnabled ? contents.filter(item => item.type === 'folder') : [];
    const renderedIds = new Set();
    const renderItem = item => {
        const folder = item.folderId && folders.find(candidate => idsEqual(candidate.id, item.folderId));
        const dropFolderId = folder && !isFolderClosed(folder.id) ? folder.id : null;
        return (
            <SpriteSelectorItem
                className={classNames(styles.backpackItem, {
                    [styles.folderChild]: Boolean(folder)
                })}
                costumeURL={item.thumbnailUrl}
                details={item.name}
                dragPayload={item}
                dragType={dragTypeMap[item.type]}
                id={item.id}
                folderId={foldersEnabled && folder ? folder.id : null}
                folderOptions={folders}
                key={item.id}
                name={intl.formatMessage(labelMap[item.type])}
                selected={false}
                style={folder ? {
                    'backgroundColor': `${folder.color || '#d8b24a'}40`,
                    '--folder-background': `${folder.color || '#d8b24a'}40`
                } : null}
                onClick={noop}
                onCreateFolder={foldersEnabled ? () => onCreateFolder(item.id) : null}
                onDeleteButtonClick={onDelete}
                onRenameButtonClick={item.type === 'sprite' || (!foldersEnabled && item.type === 'folder') ?
                    null : onRename}
                onFolderChange={foldersEnabled ?
                    (folderId, event) => onMoveToFolder(item.id, folderId, event) : null}
                onMouseEnter={foldersEnabled ? () => setFolderDropTarget(dropFolderId, item.id) : null}
                onMouseLeave={foldersEnabled ? () => setFolderDropTarget(null) : null}
                onMouseMove={foldersEnabled ? event =>
                    updateFolderDropTarget(dropFolderId, item.id, event) : null}
                onNativeDragOver={foldersEnabled ? handleFolderDragOver : null}
                onNativeDrop={foldersEnabled ? event =>
                    handleFolderDrop(folder ? folder.id : item.id, event) : null}
            />
        );
    };
    return (
        <div
            className={classNames(styles.backpackContainer,
                {
                    [styles.stageLeft]: preferences['stage-left']
                }
            )}
        >
            <div
                className={styles.backpackHeader}
                onClick={onToggle}
            >
                {onToggle ? (
                    <FormattedMessage
                        defaultMessage="Backpack"
                        description="Button to open the backpack"
                        id="gui.backpack.header"
                    />
                ) : (
                    <ComingSoonTooltip
                        place="top"
                        tooltipId="backpack-tooltip"
                    >
                        <FormattedMessage
                            defaultMessage="Backpack"
                            description="Button to open the backpack"
                            id="gui.backpack.header"
                        />
                    </ComingSoonTooltip>
                )}
            </div>
            {expanded ? (
                <div
                    className={classNames(styles.backpackList, {
                        [styles.dragOver]: dragOver || blockDragOver
                    })}
                    ref={containerRef}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {/* eslint-disable-next-line no-negated-condition */}
                    {error !== false ? (
                        <div className={styles.statusMessage}>
                            <FormattedMessage
                                defaultMessage="Error loading backpack"
                                description="Error backpack message"
                                id="gui.backpack.errorBackpack"
                            />
                            <div className={styles.errorMessage}>{error}</div>
                        </div>
                    ) : (
                        loading ? (
                            <div className={styles.statusMessage}>
                                <FormattedMessage
                                    defaultMessage="Loading..."
                                    description="Loading backpack message"
                                    id="gui.backpack.loadingBackpack"
                                />
                            </div>
                        ) : (
                            contents.length > 0 ? (
                                <div
                                    className={styles.backpackListInner}
                                    onDragEnd={() => {
                                        setDraggedFolderId(null);
                                        setFolderDropTarget(null);
                                    }}
                                >
                                    {contents.map(item => {
                                        if (renderedIds.has(item.id) || (item.folderId && folders.some(
                                            folder => idsEqual(folder.id, item.folderId)
                                        ))) return null;
                                        if (!foldersEnabled || item.type !== 'folder') {
                                            renderedIds.add(item.id);
                                            return renderItem(item);
                                        }
                                        const children = contents.filter(child => idsEqual(child.folderId, item.id));
                                        renderedIds.add(item.id);
                                        children.forEach(child => renderedIds.add(child.id));
                                        return (
                                            <React.Fragment key={item.id}>
                                                <FolderTile
                                                    className={styles.backpackItem}
                                                    folder={item}
                                                    nativeDraggable
                                                    open={!isFolderClosed(item.id)}
                                                    onColorChange={onFolderColorChange}
                                                    onDelete={onDelete}
                                                    onMouseEnter={() => setFolderDropTarget(
                                                        isFolderClosed(item.id) ? null : item.id,
                                                        item.id
                                                    )}
                                                    onMouseLeave={() => setFolderDropTarget(null)}
                                                    onMouseMove={event => updateFolderDropTarget(
                                                        isFolderClosed(item.id) ? null : item.id,
                                                        item.id,
                                                        event
                                                    )}
                                                    onRename={onRename}
                                                    onToggle={toggleFolder}
                                                    onNativeDragOver={handleFolderDragOver}
                                                    onNativeDragStart={event => {
                                                        event.dataTransfer.setData(BACKPACK_FOLDER_DRAG_TYPE, item.id);
                                                        event.dataTransfer.effectAllowed = 'move';
                                                        setDraggedFolderId(item.id);
                                                    }}
                                                    onNativeDrop={event => handleFolderDrop(item.id, event)}
                                                />
                                                {isFolderClosed(item.id) ? null : children.map(renderItem)}
                                            </React.Fragment>
                                        );
                                    })}
                                    {showMore && (
                                        <button
                                            className={styles.more}
                                            onClick={onMore}
                                        >
                                            <FormattedMessage
                                                defaultMessage="More"
                                                description="Load more from backpack"
                                                id="gui.backpack.more"
                                            />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.statusMessage}>
                                    <FormattedMessage
                                        defaultMessage="Backpack is empty"
                                        description="Empty backpack message"
                                        id="gui.backpack.emptyBackpack"
                                    />
                                </div>
                            )
                        )
                    )}
                </div>
            ) : null}
        </div>
    );
};

Backpack.propTypes = {
    blockDragOver: PropTypes.bool,
    containerRef: PropTypes.func,
    contents: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        thumbnailUrl: PropTypes.string,
        type: PropTypes.string,
        name: PropTypes.string
    })),
    dragOver: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    expanded: PropTypes.bool,
    foldersEnabled: PropTypes.bool,
    intl: intlShape,
    loading: PropTypes.bool,
    onDelete: PropTypes.func,
    onRename: PropTypes.func,
    onMore: PropTypes.func,
    onCreateFolder: PropTypes.func,
    onFolderColorChange: PropTypes.func,
    onFolderDropTargetChange: PropTypes.func,
    onFolderReorder: PropTypes.func,
    onFolderToggle: PropTypes.func,
    onMoveToFolder: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onToggle: PropTypes.func,
    preferences: PropTypes.object,
    showMore: PropTypes.bool
};

Backpack.defaultProps = {
    blockDragOver: false,
    contents: [],
    dragOver: false,
    expanded: false,
    foldersEnabled: false,
    loading: false,
    showMore: false,
    onMore: null,
    onToggle: null
};

export default injectIntl(Backpack);
