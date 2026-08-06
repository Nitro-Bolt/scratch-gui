import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {setHoveredSprite} from '../reducers/hovered-target';
import {updateAssetDrag} from '../reducers/asset-drag';
import VM from 'scratch-vm';
import getCostumeUrl from '../lib/get-costume-url';
import DragRecognizer from '../lib/drag-recognizer';
import {getEventXY} from '../lib/touch-utils';

import SpriteSelectorItemComponent from '../components/sprite-selector-item/sprite-selector-item.jsx';

class SpriteSelectorItem extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'getCostumeData',
            'setRef',
            'handleClick',
            'handleColor',
            'handleDelete',
            'handleDeleteContents',
            'handleDuplicate',
            'handleExport',
            'handleExportBitmap',
            'handleRename',
            'handleMoveToTop',
            'handleMoveToBottom',
            'handleCreateFolder',
            'handleFolderChange',
            'handleMouseEnter',
            'handleMouseLeave',
            'handleMouseDown',
            'handleDragEnd',
            'handleDrag',
            'handleTouchEnd'
        ]);

        this.dragRecognizer = new DragRecognizer({
            onDrag: this.handleDrag,
            onDragEnd: this.handleDragEnd
        });
    }
    componentDidMount () {
        document.addEventListener('touchend', this.handleTouchEnd);
    }
    componentWillUnmount () {
        document.removeEventListener('touchend', this.handleTouchEnd);
        this.dragRecognizer.reset();
    }
    getCostumeData () {
        if (this.props.costumeURL) return this.props.costumeURL;
        if (!this.props.asset) return null;

        return getCostumeUrl(this.props.asset);
    }
    handleDragEnd () {
        if (this.props.dragging) {
            this.props.onDrag({
                img: null,
                currentOffset: null,
                dragging: false,
                dragType: null,
                index: null
            });
        }
        setTimeout(() => {
            this.noClick = false;
        });
    }
    handleDrag (currentOffset) {
        this.props.onDrag({
            img: this.getCostumeData(),
            currentOffset: currentOffset,
            dragging: true,
            dragType: this.props.dragType,
            dropIndexMap: this.props.dropIndexMap,
            folderAtDisplayIndex: this.props.folderAtDisplayIndex,
            index: this.props.index,
            payload: this.props.dragPayload
        });
        this.noClick = true;
    }
    handleTouchEnd (e) {
        const {x, y} = getEventXY(e);
        const {top, left, bottom, right} = this.ref.getBoundingClientRect();
        if (x >= left && x <= right && y >= top && y <= bottom) {
            this.handleMouseEnter();
        }
    }
    handleMouseDown (e) {
        if (this.props.disableDrag) return;
        this.dragRecognizer.start(e);
    }
    handleClick (e) {
        e.preventDefault();
        const shouldGoToFront = e.shiftKey;
        if (!this.noClick) {
            this.props.onClick(this.props.id, shouldGoToFront);
        }
    }
    handleColor (e) {
        e.stopPropagation();
        this.props.onColorButtonClick(this.props.id, e);
    }
    handleDelete (e) {
        e.stopPropagation(); // To prevent from bubbling back to handleClick
        this.props.onDeleteButtonClick(this.props.id);
    }
    handleDeleteContents (e) {
        e.stopPropagation();
        this.props.onDeleteContentsButtonClick(this.props.id);
    }
    handleDuplicate (e) {
        e.stopPropagation(); // To prevent from bubbling back to handleClick
        this.props.onDuplicateButtonClick(this.props.id);
    }
    handleExport (e) {
        e.stopPropagation();
        this.props.onExportButtonClick(this.props.id);
    }
    handleExportBitmap (scale, e) {
        e.stopPropagation();
        this.props.onExportBitmapButtonClick(this.props.id, scale);
    }
    handleRename (e) {
        e.stopPropagation();
        this.props.onRenameButtonClick(this.props.id);
    }
    handleMoveToTop (e) {
        e.stopPropagation();
        this.props.onMoveToTopButtonClick(this.props.id);
    }
    handleMoveToBottom (e) {
        e.stopPropagation();
        this.props.onMoveToBottomButtonClick(this.props.id);
    }
    getFolderKind () {
        const kinds = {
            SPRITE: 'sprite',
            COSTUME: 'costume',
            SOUND: 'sound',
            ASSET: 'asset'
        };
        return kinds[this.props.dragType] || null;
    }
    getFolderScopeId () {
        return this.getFolderKind() === 'sprite' ? null : this.props.vm.editingTarget.id;
    }
    getFolderOptions () {
        if (this.props.disableFolderManagement) return [];
        const kind = this.getFolderKind();
        if (!kind) return [];
        const scopeId = this.getFolderScopeId();
        return this.props.vm.runtime.projectFolders.filter(folder =>
            folder.kind === kind && folder.scopeId === scopeId
        );
    }
    getFolderItemIndex () {
        return this.getFolderKind() === 'sprite' ? null : this.props.index;
    }
    getFolderTargetId () {
        return this.getFolderKind() === 'sprite' ? this.props.id : this.props.vm.editingTarget.id;
    }
    async handleCreateFolder (e) {
        e.stopPropagation();
        const kind = this.getFolderKind();
        const targetId = this.getFolderTargetId();
        const scopeId = this.getFolderScopeId();
        const target = this.props.vm.runtime.getTargetById(targetId);
        const collections = target && {
            costume: target.getCostumes(),
            sound: target.getSounds(),
            asset: target.getAssets()
        };
        const item = kind === 'sprite' ? target : collections && collections[kind] &&
            collections[kind][this.getFolderItemIndex()];
        const onFolderChangeComplete = this.props.onFolderChangeComplete;
        if (!kind || !item) return;
        // prompt() is Promise-based in the desktop application.
        // eslint-disable-next-line no-alert
        const name = await prompt('Folder name:');
        if (!name || !name.trim()) return;
        if (this.props.vm.runtime.getTargetById(targetId) !== target) return;
        const currentItems = kind === 'sprite' ? null : {
            costume: target.getCostumes(),
            sound: target.getSounds(),
            asset: target.getAssets()
        }[kind];
        const currentIndex = kind === 'sprite' ? null : currentItems.indexOf(item);
        if (kind !== 'sprite' && currentIndex < 0) return;
        const folder = this.props.vm.createFolder(
            name,
            kind,
            scopeId,
            this.props.folderId
        );
        this.props.vm.setItemFolder(
            kind,
            targetId,
            currentIndex,
            folder.id
        );
        if (onFolderChangeComplete) onFolderChangeComplete(targetId);
    }
    handleFolderChange (folderId, e) {
        if (e) e.stopPropagation();
        const targetId = this.getFolderTargetId();
        const onFolderChangeComplete = this.props.onFolderChangeComplete;
        this.props.vm.setItemFolder(
            this.getFolderKind(),
            targetId,
            this.getFolderItemIndex(),
            folderId
        );
        if (onFolderChangeComplete) onFolderChangeComplete(targetId);
    }
    handleMouseLeave () {
        if (this.props.disableTargetHover) return;
        this.props.dispatchSetHoveredSprite(null);
    }
    handleMouseEnter () {
        if (this.props.disableTargetHover) return;
        this.props.dispatchSetHoveredSprite(this.props.id);
    }
    setRef (component) {
        // Access the DOM node using .elem because it is going through ContextMenuTrigger
        this.ref = component && component.elem;
    }
    render () {
        const {
            /* eslint-disable no-unused-vars */
            asset,
            id,
            index,
            totalItems,
            onClick,
            onColorButtonClick,
            onDeleteButtonClick,
            onDeleteContentsButtonClick,
            onDuplicateButtonClick,
            onExportButtonClick,
            onExportBitmapButtonClick,
            onFolderChangeComplete,
            onRenameButtonClick,
            onMoveToTopButtonClick,
            onMoveToBottomButtonClick,
            dragPayload,
            isBitmap,
            receivedBlocks,
            costumeURL,
            vm,
            folderId,
            folderAtDisplayIndex,
            disableDrag,
            /* eslint-enable no-unused-vars */
            ...props
        } = this.props;
        return (
            <SpriteSelectorItemComponent
                componentRef={this.setRef}
                contextMenuId={`${this.props.dragType || 'item'}-${id}`}
                costumeURL={this.getCostumeData()}
                preventContextMenu={this.dragRecognizer.gestureInProgress()}
                onClick={this.handleClick}
                onColorButtonClick={onColorButtonClick ? this.handleColor : null}
                onDeleteButtonClick={onDeleteButtonClick ? this.handleDelete : null}
                onDeleteContentsButtonClick={onDeleteContentsButtonClick ? this.handleDeleteContents : null}
                onDuplicateButtonClick={onDuplicateButtonClick ? this.handleDuplicate : null}
                onExportButtonClick={onExportButtonClick ? this.handleExport : null}
                onExportBitmapButtonClick={onExportBitmapButtonClick ? this.handleExportBitmap : null}
                isBitmap={isBitmap}
                onRenameButtonClick={onRenameButtonClick ? this.handleRename : null}
                onMoveToTopButtonClick={onMoveToTopButtonClick && index !== 0 ? this.handleMoveToTop : null}
                onMoveToBottomButtonClick={onMoveToBottomButtonClick && index !== totalItems - 1 ?
                    this.handleMoveToBottom : null}
                folderId={folderId}
                folderOptions={this.props.folderOptions || this.getFolderOptions()}
                onCreateFolder={this.props.disableFolderManagement ? null :
                    (this.props.onCreateFolder || (this.getFolderKind() ? this.handleCreateFolder : null))}
                onFolderChange={this.props.disableFolderManagement ? null : (this.props.onFolderChange ||
                    (this.getFolderKind() ? this.handleFolderChange : null))}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                {...props}
                details={props.details}
            />
        );
    }
}

SpriteSelectorItem.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    asset: PropTypes.any,
    canRemoveFromFolder: PropTypes.bool,
    costumeURL: PropTypes.string,
    dispatchSetHoveredSprite: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    dragPayload: PropTypes.any,
    dragType: PropTypes.string,
    dropIndexMap: PropTypes.arrayOf(PropTypes.number),
    disableFolderManagement: PropTypes.bool,
    disableDrag: PropTypes.bool,
    disableTargetHover: PropTypes.bool,
    dragging: PropTypes.bool,
    folderId: PropTypes.string,
    folderAtDisplayIndex: PropTypes.objectOf(PropTypes.string),
    folderOptions: PropTypes.arrayOf(PropTypes.object),
    // eslint-disable-next-line react/forbid-prop-types
    id: PropTypes.any,
    index: PropTypes.number,
    isBitmap: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    totalItems: PropTypes.number,
    name: PropTypes.any,
    onClick: PropTypes.func,
    onColorButtonClick: PropTypes.func,
    onCreateFolder: PropTypes.func,
    onDeleteButtonClick: PropTypes.func,
    onDeleteContentsButtonClick: PropTypes.func,
    onRenameButtonClick: PropTypes.func,
    onDrag: PropTypes.func.isRequired,
    onDuplicateButtonClick: PropTypes.func,
    onExportButtonClick: PropTypes.func,
    onExportBitmapButtonClick: PropTypes.func,
    onFolderChangeComplete: PropTypes.func,
    onFolderChange: PropTypes.func,
    onMoveToTopButtonClick: PropTypes.func,
    onMoveToBottomButtonClick: PropTypes.func,
    onNativeDragOver: PropTypes.func,
    onNativeDrop: PropTypes.func,
    onMouseMove: PropTypes.func,
    receivedBlocks: PropTypes.bool.isRequired,
    selected: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state, {id}) => ({
    dragging: state.scratchGui.assetDrag.dragging,
    receivedBlocks: state.scratchGui.hoveredTarget.receivedBlocks &&
        state.scratchGui.hoveredTarget.sprite === id,
    vm: state.scratchGui.vm
});
const mapDispatchToProps = dispatch => ({
    dispatchSetHoveredSprite: spriteId => {
        dispatch(setHoveredSprite(spriteId));
    },
    onDrag: data => dispatch(updateAssetDrag(data))
});

const ConnectedComponent = connect(
    mapStateToProps,
    mapDispatchToProps
)(SpriteSelectorItem);

export default ConnectedComponent;
