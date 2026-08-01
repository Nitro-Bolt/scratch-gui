import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import DeleteButton from '../delete-button/delete-button.jsx';
import styles from './sprite-selector-item.css';
import {ContextMenuTrigger} from 'react-contextmenu';
import {
    DangerousMenuItem,
    UnborderedDangerousMenuItem,
    ContextMenu,
    MenuItem,
    SubMenu,
    subMenuProps
} from '../context-menu/context-menu.jsx';
import {FormattedMessage} from 'react-intl';

class FolderMenuItem extends React.PureComponent {
    constructor (props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick (e) {
        this.props.onSelect(this.props.folderId, e);
    }
    render () {
        return <MenuItem onClick={this.handleClick}>{this.props.children}</MenuItem>;
    }
}

FolderMenuItem.propTypes = {
    children: PropTypes.node,
    folderId: PropTypes.string,
    onSelect: PropTypes.func.isRequired
};

const getFolderLabel = (folder, folders) => {
    const foldersById = new Map(folders.map(candidate => [`${candidate.id}`, candidate]));
    const names = [];
    const visitedIds = new Set();
    let current = folder;
    while (current && !visitedIds.has(`${current.id}`)) {
        names.unshift(current.name);
        visitedIds.add(`${current.id}`);
        const parentId = current.parentId || current.folderId;
        current = parentId ? foldersById.get(`${parentId}`) : null;
    }
    return names.join(' / ');
};

const hasContextMenu = props => Boolean(props.onDuplicateButtonClick || props.onDeleteButtonClick ||
    props.onDeleteContentsButtonClick ||
    props.onExportButtonClick || props.onExportBitmapButtonClick || props.onMoveToTopButtonClick ||
    props.onMoveToBottomButtonClick || props.onCreateFolder || props.onColorButtonClick ||
    props.onRenameButtonClick || props.onFolderChange);

const SpriteSelectorItem = props => (
    <ContextMenuTrigger
        attributes={{
            className: classNames(props.className, styles.spriteSelectorItem, {
                [styles.isSelected]: props.selected
            }),
            ...(typeof props.name === 'string' ? {'data-searchable-name': props.name} : {}),
            style: props.style,
            onClick: props.onClick,
            onDragOver: props.onNativeDragOver,
            onDrop: props.onNativeDrop,
            onMouseEnter: props.onMouseEnter,
            onMouseLeave: props.onMouseLeave,
            onMouseMove: props.onMouseMove,
            onMouseDown: props.onMouseDown,
            onTouchStart: props.onMouseDown
        }}
        disable={props.preventContextMenu}
        id={props.contextMenuId}
        ref={props.componentRef}
    >
        {typeof props.number === 'undefined' ? null : (
            <div className={styles.number}>{props.number}</div>
        )}
        {props.costumeURL ? (
            <div className={styles.spriteImageOuter}>
                <div className={styles.spriteImageInner}>
                    <img
                        alt=""
                        className={styles.spriteImage}
                        draggable={false}
                        loading="lazy"
                        src={props.costumeURL}
                        style={props.iconFilter ? {filter: props.iconFilter} : null}
                    />
                </div>
            </div>
        ) : null}
        <div
            className={styles.spriteInfo}
            style={props.foregroundColor ? {color: props.foregroundColor} : null}
        >
            <div className={styles.spriteName}>{props.name}</div>
            {props.details ? (
                <div className={styles.spriteDetails}>{props.details}</div>
            ) : null}
        </div>
        {(props.selected && props.onDeleteButtonClick) ? (
            <DeleteButton
                className={styles.deleteButton}
                onClick={props.onDeleteButtonClick}
            />
        ) : null }
        {hasContextMenu(props) ? (
            <ContextMenu id={props.contextMenuId}>
                {props.onDuplicateButtonClick ? (
                    <MenuItem onClick={props.onDuplicateButtonClick}>
                        <FormattedMessage
                            defaultMessage="duplicate"
                            description="Menu item to duplicate in the right click menu"
                            id="gui.spriteSelectorItem.contextMenuDuplicate"
                        />
                    </MenuItem>
                ) : null}
                {props.onExportButtonClick ? (
                    <MenuItem onClick={props.onExportButtonClick}>
                        <FormattedMessage
                            defaultMessage="export"
                            description="Menu item to export the selected item"
                            id="gui.spriteSelectorItem.contextMenuExport"
                        />
                    </MenuItem>
                ) : null }
                {props.onExportBitmapButtonClick && !props.isBitmap ? (
                    <MenuItem onClick={props.onExportBitmapButtonClick}>
                        <FormattedMessage
                            defaultMessage="export as bitmap"
                            description="Menu item to bitmap export the selected item"
                            id="gui.spriteSelectorItem.contextMenuExportBitmap"
                        />
                    </MenuItem>
                ) : null }
                {props.onRenameButtonClick ? (
                    <MenuItem onClick={props.onRenameButtonClick}>
                        <FormattedMessage
                            defaultMessage="rename"
                            description="Menu item to rename an item"
                            id="tw.spriteSelectorItem.rename"
                        />
                    </MenuItem>
                ) : null}
                {props.onColorButtonClick ? (
                    <MenuItem onClick={props.onColorButtonClick}>
                        <FormattedMessage
                            defaultMessage="change color"
                            description="Menu item to change a folder color"
                            id="gui.folders.changeColor"
                        />
                    </MenuItem>
                ) : null}
                {props.onMoveToTopButtonClick ? (
                    <MenuItem onClick={props.onMoveToTopButtonClick}>
                        <FormattedMessage
                            defaultMessage="move to top"
                            description="Menu item to move an item to the top of the list"
                            id="tw.spriteSelectorItem.contextMenuMoveToTop"
                        />
                    </MenuItem>
                ) : null}
                {props.onMoveToBottomButtonClick ? (
                    <MenuItem onClick={props.onMoveToBottomButtonClick}>
                        <FormattedMessage
                            defaultMessage="move to bottom"
                            description="Menu item to move an item to the bottom of the list"
                            id="tw.spriteSelectorItem.contextMenuMoveToBottom"
                        />
                    </MenuItem>
                ) : null}
                {props.onCreateFolder ? (
                    <MenuItem onClick={props.onCreateFolder}>
                        <FormattedMessage
                            defaultMessage="create folder"
                            description="Menu item to create a folder"
                            id="gui.folders.create"
                        />
                    </MenuItem>
                ) : null}
                {props.folderId && props.canRemoveFromFolder ? (
                    <FolderMenuItem
                        folderId={null}
                        onSelect={props.onFolderChange}
                    >
                        <FormattedMessage
                            defaultMessage="remove from folder"
                            description="Menu item to remove an item from its folder"
                            id="gui.folders.removeItem"
                        />
                    </FolderMenuItem>
                ) : null}
                {props.folderOptions.some(folder => folder.id !== props.folderId) ? (
                    <SubMenu
                        {...subMenuProps}
                        hoverDelay={150}
                        title={(
                            <FormattedMessage
                                defaultMessage="add to folder..."
                                description="Submenu for moving an item into a folder"
                                id="gui.folders.addItem"
                            />
                        )}
                    >
                        {props.folderOptions.filter(folder => folder.id !== props.folderId).map(folder => (
                            <FolderMenuItem
                                folderId={folder.id}
                                key={folder.id}
                                onSelect={props.onFolderChange}
                            >
                                {getFolderLabel(folder, props.folderOptions)}
                            </FolderMenuItem>
                        ))}
                    </SubMenu>
                ) : null}
                {props.onDeleteButtonClick ? (
                    <DangerousMenuItem onClick={props.onDeleteButtonClick}>
                        <FormattedMessage
                            defaultMessage="delete"
                            description="Menu item to delete in the right click menu"
                            id="gui.spriteSelectorItem.contextMenuDelete"
                        />
                    </DangerousMenuItem>
                ) : null }
                {props.onDeleteContentsButtonClick ? (
                    <UnborderedDangerousMenuItem onClick={props.onDeleteContentsButtonClick}>
                        <FormattedMessage
                            defaultMessage="delete with contents"
                            description="Menu item to delete a folder and everything inside it"
                            id="gui.folders.deleteContents"
                        />
                    </UnborderedDangerousMenuItem>
                ) : null }
            </ContextMenu>
        ) : null}
    </ContextMenuTrigger>
);

SpriteSelectorItem.propTypes = {
    canRemoveFromFolder: PropTypes.bool,
    className: PropTypes.string,
    componentRef: PropTypes.func,
    contextMenuId: PropTypes.string.isRequired,
    costumeURL: PropTypes.string,
    details: PropTypes.string,
    folderId: PropTypes.string,
    foregroundColor: PropTypes.string,
    folderOptions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })),
    // eslint-disable-next-line react/forbid-prop-types
    name: PropTypes.any,
    number: PropTypes.number,
    onClick: PropTypes.func,
    onColorButtonClick: PropTypes.func,
    onDeleteButtonClick: PropTypes.func,
    onDeleteContentsButtonClick: PropTypes.func,
    onDuplicateButtonClick: PropTypes.func,
    onExportButtonClick: PropTypes.func,
    onExportBitmapButtonClick: PropTypes.func,
    isBitmap: PropTypes.bool,
    iconFilter: PropTypes.string,
    onRenameButtonClick: PropTypes.func,
    onMoveToTopButtonClick: PropTypes.func,
    onMoveToBottomButtonClick: PropTypes.func,
    onNativeDragOver: PropTypes.func,
    onNativeDrop: PropTypes.func,
    onCreateFolder: PropTypes.func,
    onFolderChange: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseMove: PropTypes.func,
    preventContextMenu: PropTypes.bool,
    selected: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.object
};

SpriteSelectorItem.defaultProps = {
    canRemoveFromFolder: true,
    folderOptions: []
};

export default SpriteSelectorItem;
