import PropTypes from 'prop-types';
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import classNames from 'classnames';
import VM from 'scratch-vm';

import DragConstants from '../../lib/drag-constants';
import buildFolderLayout from '../../lib/folder-layout';

import Box from '../box/box.jsx';
import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import SortableHOC from '../../lib/sortable-hoc.jsx';
import SortableAsset from '../asset-panel/sortable-asset.jsx';
import ThrottledPropertyHOC from '../../lib/throttled-property-hoc.jsx';
import FolderTile from '../folder-tile/folder-tile.jsx';

import styles from './sprite-selector.css';

const ThrottledSpriteSelectorItem = ThrottledPropertyHOC('asset', 500)(SpriteSelectorItem);

const SpriteList = function (props) {
    const {
        containerRef,
        editingTarget,
        draggingIndex,
        draggingPayload,
        draggingType,
        hoveredTarget,
        onDeleteSprite,
        onDuplicateSprite,
        onExportSprite,
        onSelectSprite,
        onAddSortable,
        onRemoveSortable,
        ordering,
        mouseOverIndex,
        raised,
        selectedId,
        vm,
        items
    } = props;

    const closedFolders = vm.runtime.projectFolders
        .filter(folder => folder._isOpen === false)
        .map(folder => folder.id);
    const handleToggleFolder = folderId => {
        vm.setFolderOpen(folderId, closedFolders.includes(folderId));
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
    } = buildFolderLayout(items, vm.runtime.projectFolders, closedFolders);

    const isSpriteDrag = draggingType === DragConstants.SPRITE;
    const getDisplayOrder = baseOrder => {
        if (!isSpriteDrag || (draggingPayload && draggingPayload.nativeFolderId) ||
            typeof mouseOverIndex !== 'number') return baseOrder;
        const draggedOrder = itemDisplayOrder[draggingIndex];
        if (typeof draggedOrder !== 'number') return baseOrder;
        const displayOrdering = Array(displayLength).fill(0)
            .map((_, index) => index);
        displayOrdering.splice(draggedOrder, 1);
        displayOrdering.splice(Math.min(mouseOverIndex, displayOrdering.length), 0, draggedOrder);
        return displayOrdering.indexOf(baseOrder);
    };

    const renderSprite = (candidate, candidateIndex, candidateFolder) => {
        // If the sprite has just received a block drop, used for green highlight
        const receivedBlocks = (
            hoveredTarget.sprite === candidate.id &&
            candidate.id !== editingTarget &&
            hoveredTarget.receivedBlocks
        );

        // If the sprite is indicating it can receive block dropping, used for blue highlight
        let isRaised = !receivedBlocks && raised && candidate.id !== editingTarget;

        // A sprite is also raised if a costume or sound is being dragged.
        // Note the absence of the self-sharing check: a sprite can share assets with itself.
        // This is a quirk of 2.0, but seems worth leaving possible, it
        // allows quick (albeit unusual) duplication of assets.
        isRaised = isRaised || [
            DragConstants.COSTUME,
            DragConstants.SOUND,
            DragConstants.ASSET,
            DragConstants.BACKPACK_COSTUME,
            DragConstants.BACKPACK_SOUND,
            DragConstants.BACKPACK_ASSET,
            DragConstants.BACKPACK_CODE].includes(draggingType);

        return (
            <SortableAsset
                className={classNames(styles.spriteWrapper, {
                    [styles.placeholder]: isSpriteDrag && candidateIndex === draggingIndex})}
                index={!hasFolders && isSpriteDrag ? ordering.indexOf(candidateIndex) :
                    getDisplayOrder(itemDisplayOrder[candidateIndex])}
                key={candidate.id}
                onAddSortable={onAddSortable}
                onRemoveSortable={onRemoveSortable}
            >
                <ThrottledSpriteSelectorItem
                    asset={candidate.costume && candidate.costume.asset}
                    className={classNames(styles.sprite, {
                        [styles.raised]: isRaised,
                        [styles.receivedBlocks]: receivedBlocks,
                        [styles.folderChild]: Boolean(candidateFolder)
                    })}
                    style={candidateFolder ? {
                        backgroundColor: `${candidateFolder.color || '#d8b24a'}40`
                    } : null}
                    dragPayload={candidate.id}
                    dragType={DragConstants.SPRITE}
                    dropIndexMap={dropIndexMap}
                    id={candidate.id}
                    folderId={candidateFolder ? candidate.folderId : null}
                    folderAtDisplayIndex={folderAtDisplayIndex}
                    index={candidateIndex}
                    key={candidate.id}
                    name={candidate.name}
                    selected={candidate.id === selectedId}
                    onClick={onSelectSprite}
                    onDeleteButtonClick={onDeleteSprite}
                    onDuplicateButtonClick={onDuplicateSprite}
                    onExportButtonClick={onExportSprite}
                />
            </SortableAsset>
        );
    };

    return (
        <Box
            className={classNames(styles.scrollWrapper, {
                [styles.scrollWrapperDragging]: draggingType === DragConstants.BACKPACK_SPRITE
            })}
            componentRef={containerRef}
        >
            <Box
                className={styles.itemsWrapper}
            >
                {entries.map(entry => (entry.type === 'item' ?
                    renderSprite(items[entry.itemIndex], entry.itemIndex, entry.folder) : (
                        <SortableAsset
                            className={styles.spriteWrapper}
                            index={getDisplayOrder(folderDisplayOrder[entry.folder.id])}
                            key={entry.folder.id}
                            onAddSortable={onAddSortable}
                            onRemoveSortable={onRemoveSortable}
                        >
                            <FolderTile
                                className={styles.sprite}
                                dragType={DragConstants.SPRITE}
                                dropIndexMap={dropIndexMap}
                                folder={entry.folder}
                                folderAtDisplayIndex={folderAtDisplayIndex}
                                index={entry.firstIndex}
                                open={entry.isOpen}
                                parentFolderAtDisplayIndex={parentFolderAtDisplayIndex}
                                vm={vm}
                                onToggle={handleToggleFolder}
                            />
                        </SortableAsset>
                    )))}
            </Box>
        </Box>
    );
};

SpriteList.propTypes = {
    containerRef: PropTypes.func,
    draggingIndex: PropTypes.number,
    draggingPayload: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
    ]),
    draggingType: PropTypes.oneOf(Object.keys(DragConstants)),
    editingTarget: PropTypes.string,
    hoveredTarget: PropTypes.shape({
        hoveredSprite: PropTypes.string,
        receivedBlocks: PropTypes.bool,
        sprite: PropTypes.string
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
        costume: PropTypes.shape({
            url: PropTypes.string,
            name: PropTypes.string.isRequired,
            bitmapResolution: PropTypes.number.isRequired,
            rotationCenterX: PropTypes.number.isRequired,
            rotationCenterY: PropTypes.number.isRequired
        }),
        name: PropTypes.string.isRequired,
        folderId: PropTypes.string,
        order: PropTypes.number.isRequired
    })),
    onAddSortable: PropTypes.func,
    mouseOverIndex: PropTypes.number,
    onDeleteSprite: PropTypes.func,
    onDuplicateSprite: PropTypes.func,
    onExportSprite: PropTypes.func,
    onRemoveSortable: PropTypes.func,
    onSelectSprite: PropTypes.func,
    ordering: PropTypes.arrayOf(PropTypes.number),
    raised: PropTypes.bool,
    selectedId: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default SortableHOC(SpriteList);
