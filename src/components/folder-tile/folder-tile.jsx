import bindAll from 'lodash.bindall';
/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import DragConstants from '../../lib/drag-constants';
import getFolderForeground from '../../lib/folder-color';
import folderIcon from './folder.svg';
import styles from './folder-tile.css';

class FolderTile extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, ['handleChooseColor', 'handleClick', 'handleColor', 'handleDelete', 'handleMoveBottom',
            'handleDeleteContents', 'handleFolderChange', 'handleMoveTop', 'handleRename', 'setColorInput']);
    }
    handleClick () {
        this.props.onToggle(this.props.folder.id);
    }
    handleDelete () {
        if (this.props.onDelete) this.props.onDelete(this.props.folder.id);
        else this.props.vm.deleteFolder(this.props.folder.id);
    }
    handleDeleteContents () {
        if (this.props.onDeleteContents) this.props.onDeleteContents(this.props.folder.id);
        else this.props.vm.deleteFolderWithContents(this.props.folder.id);
    }
    handleColor (event) {
        event.stopPropagation();
        if (this.props.onColorChange) this.props.onColorChange(this.props.folder.id, event.target.value);
        else this.props.vm.setFolderColor(this.props.folder.id, event.target.value);
    }
    handleChooseColor (id, event) { // eslint-disable-line no-unused-vars
        const tile = this.colorInput.parentElement.getBoundingClientRect();
        const x = event && typeof event.clientX === 'number' ? event.clientX : tile.right;
        const y = event && typeof event.clientY === 'number' ? event.clientY : tile.bottom;
        this.colorInput.style.left = `${x}px`;
        this.colorInput.style.top = `${y}px`;
        this.colorInput.click();
    }
    setColorInput (input) {
        this.colorInput = input;
    }
    handleMoveTop () {
        if (this.props.onReorder) this.props.onReorder(this.props.folder.id, 0);
        else this.props.vm.moveFolderToIndex(this.props.folder.id, 0);
    }
    handleMoveBottom () {
        if (this.props.onReorder) this.props.onReorder(this.props.folder.id, Number.MAX_SAFE_INTEGER);
        else this.props.vm.moveFolderToIndex(this.props.folder.id, Number.MAX_SAFE_INTEGER);
    }
    handleFolderChange (parentId, event) {
        if (event) event.stopPropagation();
        try {
            if (this.props.onFolderChange) this.props.onFolderChange(this.props.folder.id, parentId, event);
            else this.props.vm.setFolderParent(this.props.folder.id, parentId);
        } catch (error) {
            // The destination can become invalid while its context menu is open.
        }
    }
    async handleRename () {
        // eslint-disable-next-line no-alert
        const name = await prompt('Rename folder:', this.props.folder.name);
        if (name && name.trim()) {
            try {
                if (this.props.onRename) this.props.onRename(this.props.folder.id, name.trim());
                else this.props.vm.renameFolder(this.props.folder.id, name);
            } catch (error) {
                // The name can conflict with a sibling created while the prompt is open.
            }
        }
    }
    render () {
        const folderDragTypes = {
            [DragConstants.ASSET]: DragConstants.FOLDER_ASSET,
            [DragConstants.SOUND]: DragConstants.FOLDER_SOUND,
            [DragConstants.COSTUME]: DragConstants.FOLDER_COSTUME,
            [DragConstants.SPRITE]: DragConstants.FOLDER_SPRITE
        };
        const folders = this.props.folderOptions || this.props.vm.runtime.projectFolders;
        const descendantIds = new Set([this.props.folder.id]);
        let foundDescendant = true;
        while (foundDescendant) {
            foundDescendant = false;
            for (const folder of folders) {
                if (descendantIds.has(folder.parentId) && !descendantIds.has(folder.id)) {
                    descendantIds.add(folder.id);
                    foundDescendant = true;
                }
            }
        }
        const scopedFolders = folders.filter(folder =>
            folder.kind === this.props.folder.kind && folder.scopeId === this.props.folder.scopeId &&
            !descendantIds.has(folder.id)
        );
        const hasSiblingNameConflict = parentId => Boolean(this.props.vm) && scopedFolders.some(folder =>
            folder.id !== this.props.folder.id && folder.parentId === parentId &&
            folder.name.toLocaleLowerCase() === this.props.folder.name.toLocaleLowerCase()
        );
        const folderOptions = scopedFolders.filter(folder => !hasSiblingNameConflict(folder.id));
        const color = this.props.folder.color || '#d8b24a';
        const foreground = getFolderForeground(color);
        return (
            <div
                className={classNames(styles.folderTile, this.props.className)}
                draggable={this.props.nativeDraggable}
                style={{
                    backgroundColor: color
                }}
                onDragOver={this.props.onNativeDragOver}
                onDragStart={this.props.onNativeDragStart}
                onDrop={this.props.onNativeDrop}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
                onMouseMove={this.props.onMouseMove}
            >
                <SpriteSelectorItem
                    costumeURL={folderIcon}
                    disableDrag={this.props.nativeDraggable}
                    disableTargetHover
                    details={this.props.open ? 'Open' : 'Closed'}
                    dragPayload={{
                        nativeFolderId: this.props.folder.id,
                        dropIndexMap: this.props.dropIndexMap,
                        folderAtDisplayIndex: this.props.folderAtDisplayIndex,
                        parentFolderAtDisplayIndex: this.props.parentFolderAtDisplayIndex
                    }}
                    dragType={folderDragTypes[this.props.dragType]}
                    id={this.props.folder.id}
                    folderId={this.props.folder.parentId || this.props.folder.folderId || null}
                    folderOptions={folderOptions}
                    foregroundColor={foreground}
                    canRemoveFromFolder={!hasSiblingNameConflict(null)}
                    name={this.props.folder.name}
                    index={this.props.index}
                    iconFilter={foreground === '#ffffff' ? 'invert(1)' : 'none'}
                    selected={false}
                    style={{backgroundColor: 'transparent', height: '100%', width: '100%'}}
                    onClick={this.handleClick}
                    onColorButtonClick={this.handleChooseColor}
                    onDeleteButtonClick={this.handleDelete}
                    onDeleteContentsButtonClick={this.handleDeleteContents}
                    onFolderChange={this.handleFolderChange}
                    onMoveToBottomButtonClick={this.props.showMoveActions ? this.handleMoveBottom : null}
                    onMoveToTopButtonClick={this.props.showMoveActions ? this.handleMoveTop : null}
                    onRenameButtonClick={this.handleRename}
                />
                <input
                    aria-label="Folder color"
                    className={styles.colorPicker}
                    ref={this.setColorInput}
                    type="color"
                    value={this.props.folder.color || '#d8b24a'}
                    onChange={this.handleColor}
                />
            </div>
        );
    }
}

FolderTile.propTypes = {
    className: PropTypes.string,
    dragType: PropTypes.string,
    dropIndexMap: PropTypes.arrayOf(PropTypes.number),
    folderAtDisplayIndex: PropTypes.objectOf(PropTypes.string),
    folderOptions: PropTypes.arrayOf(PropTypes.object),
    folder: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string,
        folderId: PropTypes.string,
        kind: PropTypes.string,
        parentId: PropTypes.string,
        scopeId: PropTypes.string
    }).isRequired,
    open: PropTypes.bool.isRequired,
    index: PropTypes.number,
    onToggle: PropTypes.func.isRequired,
    showMoveActions: PropTypes.bool,
    onColorChange: PropTypes.func,
    onDelete: PropTypes.func,
    onDeleteContents: PropTypes.func,
    onFolderChange: PropTypes.func,
    nativeDraggable: PropTypes.bool,
    onNativeDragOver: PropTypes.func,
    onNativeDragStart: PropTypes.func,
    onNativeDrop: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseMove: PropTypes.func,
    parentFolderAtDisplayIndex: PropTypes.objectOf(PropTypes.string),
    onRename: PropTypes.func,
    onReorder: PropTypes.func,
    vm: PropTypes.shape({
        deleteFolder: PropTypes.func.isRequired,
        deleteFolderWithContents: PropTypes.func.isRequired,
        moveFolderToIndex: PropTypes.func.isRequired,
        renameFolder: PropTypes.func.isRequired,
        setFolderParent: PropTypes.func.isRequired,
        setFolderOpen: PropTypes.func.isRequired,
        setFolderColor: PropTypes.func.isRequired,
        runtime: PropTypes.shape({
            projectFolders: PropTypes.arrayOf(PropTypes.object).isRequired
        })
    })
};

export default FolderTile;
