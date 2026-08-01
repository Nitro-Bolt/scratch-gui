import PropTypes from 'prop-types';
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import classNames from 'classnames';
import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import Box from '../box/box.jsx';
import ActionMenu from '../action-menu/action-menu.jsx';
import SortableAsset from './sortable-asset.jsx';
import SortableHOC from '../../lib/sortable-hoc.jsx';
import DragConstants from '../../lib/drag-constants';
import buildFolderLayout from '../../lib/folder-layout';
import FolderTile from '../folder-tile/folder-tile.jsx';
import VM from 'scratch-vm';

import styles from './selector.css';

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
        onExportClick,
        onExportBitmapClick,
        onItemClick,
        onFolderReorder,
        onItemFolderChangeComplete,
        onMoveToTopClick,
        onMoveToBottomClick
    } = props;

    const closedFolders = props.vm.runtime.projectFolders
        .filter(folder => folder._isOpen === false)
        .map(folder => folder.id);
    const handleToggleFolder = folderId => {
        props.vm.setFolderOpen(folderId, closedFolders.includes(folderId));
    };

    const {
        displayLength,
        dropIndexMap,
        folderDisplayOrder,
        groups,
        hasFolders,
        itemDisplayOrder
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

    const selectedItem = items[selectedItemIndex];

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
            componentRef={containerRef}
        >
            <Box className={styles.listArea}>
                {groups.map(group => {
                    const {folder} = group;
                    const firstItem = items[group.firstIndex];
                    return (
                        <React.Fragment key={folder ? folder.id : firstItem.name}>
                            {folder ? (
                                <SortableAsset
                                    index={getDisplayOrder(folderDisplayOrder[folder.id])}
                                    onAddSortable={onAddSortable}
                                    onRemoveSortable={onRemoveSortable}
                                >
                                    <FolderTile
                                        className={styles.listItem}
                                        dragType={dragType}
                                        dropIndexMap={dropIndexMap}
                                        folder={folder}
                                        index={group.firstIndex}
                                        open={group.isOpen}
                                        showMoveActions
                                        vm={props.vm}
                                        onReorder={onFolderReorder}
                                        onToggle={handleToggleFolder}
                                    />
                                </SortableAsset>
                            ) : null}
                            {group.isOpen ? group.itemIndices.map(candidateIndex => {
                                const candidate = items[candidateIndex];
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
                                                [styles.placeholder]: isRelevantDrag &&
                                                    candidateIndex === draggingIndex,
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
                                            index={candidateIndex}
                                            isBitmap={candidate.isBitmap}
                                            totalItems={items.length}
                                            name={candidate.name}
                                            number={candidateIndex + 1 /* 1-indexed */}
                                            selected={candidateIndex === selectedItemIndex}
                                            onClick={onItemClick}
                                            onDeleteButtonClick={onDeleteClick}
                                            onDuplicateButtonClick={onDuplicateClick}
                                            onExportButtonClick={onExportClick}
                                            onExportBitmapButtonClick={onExportBitmapClick}
                                            onFolderChangeComplete={onItemFolderChangeComplete && selectedItem ?
                                                targetId => onItemFolderChangeComplete(
                                                    selectedItem.dragPayload, targetId
                                                ) : null}
                                            onMoveToTopButtonClick={onMoveToTopClick}
                                            onMoveToBottomButtonClick={onMoveToBottomClick}
                                        />
                                    </SortableAsset>
                                );
                            }) : null}
                        </React.Fragment>
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
