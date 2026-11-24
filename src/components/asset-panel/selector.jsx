import PropTypes from 'prop-types';
/* eslint-disable react/jsx-no-bind */
import React, {useEffect, useState} from 'react';
import classNames from 'classnames';
import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import Box from '../box/box.jsx';
import ActionMenu from '../action-menu/action-menu.jsx';
import SortableAsset from './sortable-asset.jsx';
import SortableHOC from '../../lib/sortable-hoc.jsx';
import DragConstants from '../../lib/drag-constants';
import buildFolderLayout from '../../lib/folder-layout';
import FolderTile from '../nb-folder-tile/folder-tile.jsx';
import VM from 'scratch-vm';

import styles from './selector.css';

const kindByDragType = {
    [DragConstants.COSTUME]: 'costume',
    [DragConstants.SOUND]: 'sound',
    [DragConstants.ASSET]: 'asset'
};

const getTargetCollection = (target, kind) => ({
    costume: target.getCostumes(),
    sound: target.getSounds(),
    asset: target.getAssets()
})[kind];

const Selector = props => {
    const {
        buttons,
        containerRef,
        dragType,
        isRtl,
        items,
        selectedItemIndex,
        draggingIndex,
        draggingPayload,
        draggingType,
        mouseOverIndex,
        ordering,
        onAddSortable,
        onRemoveSortable,
        onDeleteClick,
        onDuplicateClick,
        onReplaceClick,
        onExportClick,
        onExportBitmapClick,
        onItemClick,
        onFolderReorder,
        onItemFolderChangeComplete,
        onMoveToTopClick,
        onMoveToBottomClick
    } = props;

    const [selectedItems, setSelectedItems] = useState([
        items[selectedItemIndex] && items[selectedItemIndex].dragPayload
    ].filter(Boolean));
    const [selectionAnchor, setSelectionAnchor] = useState(
        items[selectedItemIndex] && items[selectedItemIndex].dragPayload
    );
    const selectedIndices = selectedItems.map(item =>
        items.findIndex(candidate => candidate.dragPayload === item)
    ).filter(index => index >= 0);
    useEffect(() => {
        const activeItem = items[selectedItemIndex] && items[selectedItemIndex].dragPayload;
        const availableSelectedItems = selectedItems.filter(item =>
            items.some(candidate => candidate.dragPayload === item)
        );
        if (activeItem && !availableSelectedItems.includes(activeItem)) {
            setSelectedItems([activeItem]);
        } else if (availableSelectedItems.length !== selectedItems.length) {
            setSelectedItems(availableSelectedItems);
        }
    }, [selectedItemIndex, items, selectedItems]);

    const handleItemClick = (index, shouldGoToFront, modifiers = {}) => {
        let nextSelection;
        if (modifiers.range) {
            const anchorIndex = items.findIndex(item => item.dragPayload === selectionAnchor);
            const start = Math.min(anchorIndex < 0 ? index : anchorIndex, index);
            const end = Math.max(anchorIndex < 0 ? index : anchorIndex, index);
            nextSelection = items.slice(start, end + 1).map(item => item.dragPayload);
        } else if (modifiers.additive) {
            const item = items[index].dragPayload;
            nextSelection = selectedItems.includes(item) ?
                selectedItems.filter(candidate => candidate !== item) : selectedItems.concat(item);
            if (nextSelection.length === 0) nextSelection = [item];
            setSelectionAnchor(item);
        } else {
            nextSelection = [items[index].dragPayload];
            setSelectionAnchor(items[index].dragPayload);
        }
        setSelectedItems(nextSelection);
        onItemClick(index, shouldGoToFront);
    };

    const getSelectedIndices = index => (
        selectedIndices.includes(index) ? selectedIndices : [index]
    );
    const handleBatchRename = async index => {
        const indices = getSelectedIndices(index).slice()
            .sort((a, b) => a - b);
        if (indices.length < 2) return;
        const selectedItemsInOrder = indices.map(candidateIndex =>
            items[candidateIndex] && items[candidateIndex].dragPayload
        ).filter(Boolean);
        // prompt() is Promise-based in the desktop application.
        // eslint-disable-next-line no-alert
        const requestedName = await prompt('Name for selected items:');
        const baseName = requestedName && requestedName.trim();
        const target = props.vm.editingTarget;
        const kind = kindByDragType[dragType];
        if (!baseName || !target || !kind) return;
        const collection = getTargetCollection(target, kind);
        selectedItemsInOrder.forEach((item, numberIndex) => {
            const currentIndex = collection.indexOf(item);
            if (currentIndex < 0) return;
            const name = `${baseName} ${numberIndex + 1}`;
            if (dragType === DragConstants.COSTUME) props.vm.renameCostume(currentIndex, name);
            else if (dragType === DragConstants.SOUND) props.vm.renameSound(currentIndex, name);
            else if (dragType === DragConstants.ASSET) props.vm.renameAsset(currentIndex, name, item.dataFormat);
        });
    };
    const closedFolders = props.vm.runtime.projectFolders
        .filter(folder => folder._isOpen === false)
        .map(folder => folder.id);
    const handleToggleFolder = folderId => {
        props.vm.setFolderOpen(folderId, closedFolders.includes(folderId));
    };

    const {
        displayLength,
        dropIndexMap,
        entries,
        folderAtDisplayIndex,
        folderDisplayOrder,
        hasFolders,
        itemDisplayOrder,
        parentFolderAtDisplayIndex
    } = buildFolderLayout(items, props.vm.runtime.projectFolders, closedFolders);

    const isRelevantDrag = draggingType === dragType;
    const getDisplayOrder = baseOrder => {
        if (!isRelevantDrag || (draggingPayload && draggingPayload.nativeFolderId) ||
            typeof mouseOverIndex !== 'number') return baseOrder;
        const draggedOrder = itemDisplayOrder[draggingIndex];
        if (typeof draggedOrder !== 'number') return baseOrder;
        const displayOrdering = Array(displayLength).fill(0)
            .map((_, index) => index);
        displayOrdering.splice(draggedOrder, 1);
        displayOrdering.splice(Math.min(mouseOverIndex, displayOrdering.length), 0, draggedOrder);
        return displayOrdering.indexOf(baseOrder);
    };

    let newButtonSection = null;

    if (buttons.length > 0) {
        const {img, title, onClick} = buttons[0];
        const moreButtons = buttons.slice(1);
        newButtonSection = (
            <Box className={styles.newButtons}>
                <ActionMenu
                    img={img}
                    moreButtons={moreButtons}
                    title={title}
                    tooltipPlace={isRtl ? 'left' : 'right'}
                    onClick={onClick}
                />
            </Box>
        );
    }

    return (
        <Box
            className={styles.wrapper}
        >
            <Box
                className={styles.listArea}
                componentRef={containerRef}
            >
                {entries.map(entry => {
                    if (entry.type === 'folder') {
                        return (
                            <SortableAsset
                                index={getDisplayOrder(folderDisplayOrder[entry.folder.id])}
                                key={entry.folder.id}
                                onAddSortable={onAddSortable}
                                onRemoveSortable={onRemoveSortable}
                            >
                                <FolderTile
                                    className={styles.listItem}
                                    dragType={dragType}
                                    dropIndexMap={dropIndexMap}
                                    folder={entry.folder}
                                    folderAtDisplayIndex={folderAtDisplayIndex}
                                    index={entry.firstIndex}
                                    open={entry.isOpen}
                                    parentFolderAtDisplayIndex={parentFolderAtDisplayIndex}
                                    showMoveActions
                                    vm={props.vm}
                                    onReorder={onFolderReorder}
                                    onToggle={handleToggleFolder}
                                />
                            </SortableAsset>
                        );
                    }
                    const candidateIndex = entry.itemIndex;
                    const candidate = items[candidateIndex];
                    const folder = entry.folder;
                    return (
                        <SortableAsset
                            id={candidate.name}
                            index={!hasFolders && isRelevantDrag ? ordering.indexOf(candidateIndex) :
                                getDisplayOrder(itemDisplayOrder[candidateIndex])}
                            key={candidate.name}
                            onAddSortable={onAddSortable}
                            onRemoveSortable={onRemoveSortable}
                        >
                            <SpriteSelectorItem
                                asset={candidate.asset}
                                className={classNames(styles.listItem, {
                                    [styles.placeholder]: isRelevantDrag && candidateIndex === draggingIndex,
                                    [styles.folderChild]: Boolean(folder)
                                })}
                                style={folder ? {
                                    backgroundColor: `${folder.color || '#d8b24a'}40`
                                } : null}
                                costumeURL={candidate.url}
                                details={candidate.details}
                                dragPayload={candidate.dragPayload}
                                dragType={dragType}
                                dropIndexMap={dropIndexMap}
                                id={candidateIndex}
                                folderId={folder ? candidate.folderId : null}
                                folderAtDisplayIndex={folderAtDisplayIndex}
                                index={candidateIndex}
                                isBitmap={candidate.isBitmap}
                                totalItems={items.length}
                                name={candidate.name}
                                number={candidateIndex + 1 /* 1-indexed */}
                                active={candidateIndex === selectedItemIndex}
                                selected={selectedIndices.includes(candidateIndex)}
                                selectedIndices={getSelectedIndices(candidateIndex)}
                                onClick={handleItemClick}
                                onDeleteButtonClick={onDeleteClick}
                                onDuplicateButtonClick={onDuplicateClick}
                                onReplaceButtonClick={onReplaceClick}
                                onExportButtonClick={onExportClick}
                                onExportBitmapButtonClick={onExportBitmapClick}
                                onFolderChangeComplete={onItemFolderChangeComplete && candidate ?
                                    targetId => onItemFolderChangeComplete(candidate.dragPayload, targetId) : null}
                                onRenameButtonClick={selectedIndices.length > 1 &&
                                    selectedIndices.includes(candidateIndex) ?
                                    handleBatchRename : null}
                                onMoveToTopButtonClick={onMoveToTopClick}
                                onMoveToBottomButtonClick={onMoveToBottomClick}
                            />
                        </SortableAsset>
                    );
                })}
            </Box>
            {newButtonSection}
        </Box>
    );
};

Selector.propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        img: PropTypes.string.isRequired,
        onClick: PropTypes.func
    })),
    containerRef: PropTypes.func,
    dragType: PropTypes.oneOf(Object.keys(DragConstants)),
    draggingIndex: PropTypes.number,
    draggingPayload: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
    ]),
    draggingType: PropTypes.oneOf(Object.keys(DragConstants)),
    isRtl: PropTypes.bool,
    mouseOverIndex: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        asset: PropTypes.any,
        details: PropTypes.string,
        // eslint-disable-next-line react/forbid-prop-types
        dragPayload: PropTypes.any,
        isBitmap: PropTypes.bool,
        url: PropTypes.string,
        name: PropTypes.string.isRequired,
        folderId: PropTypes.string
    })),
    onAddSortable: PropTypes.func,
    onDeleteClick: PropTypes.func,
    onDuplicateClick: PropTypes.func,
    onReplaceClick: PropTypes.func,
    onExportClick: PropTypes.func,
    onExportBitmapClick: PropTypes.func,
    onItemClick: PropTypes.func.isRequired,
    onFolderReorder: PropTypes.func,
    onItemFolderChangeComplete: PropTypes.func,
    onRemoveSortable: PropTypes.func,
    onMoveToTopClick: PropTypes.func,
    onMoveToBottomClick: PropTypes.func,
    ordering: PropTypes.arrayOf(PropTypes.number),
    selectedItemIndex: PropTypes.number.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default SortableHOC(Selector);
