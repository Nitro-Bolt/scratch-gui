import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import debounce from 'lodash.debounce';
import VM from 'scratch-vm';

import {formatBytes} from '../lib/tw-bytes-utils.js';
import getCostumeUrl from '../lib/get-costume-url';
import getAssetType from '../lib/nb-asset-type.js';

import {connect} from 'react-redux';

import AssetViewerComponent from '../components/nb-asset-viewer/asset-viewer.jsx';

class AssetViewer extends React.Component {
    constructor (props) {
        super(props);

        bindAll(this, [
            'handleAssetRename',
            'handleTextContentChange',
            'handleEditorDidMount',
            'handleUndo',
            'handleRedo'
        ]);

        this.state = {
            blobURL: null,
            textContent: '',
            canUndo: false,
            canRedo: false
        };

        this.editor = null;
        this.editorDisposable = null;
        this.initialContent = '';
        this.saveTextAssetDebounced = debounce(value => {
            this.saveTextAsset(value);
        }, 150);
    }

    componentDidMount () {
        this.updateBlobURL();
        this.updateTextContent();
    }

    componentDidUpdate (prevProps) {
        if (
            prevProps.assetId !== this.props.assetId ||
            prevProps.assetIndex !== this.props.assetIndex ||
            prevProps.contentType !== this.props.contentType ||
            prevProps.mediaType !== this.props.mediaType
        ) {
            this.initialContent = '';
            this.updateBlobURL();
            this.updateTextContent();
        }
    }

    componentWillUnmount () {
        this.revokeBlobURL();
        this.clearEditorListener();
        this.saveTextAssetDebounced.cancel();
    }

    clearEditorListener () {
        if (this.editorDisposable) {
            this.editorDisposable.dispose();
            this.editorDisposable = null;
        }
    }

    revokeBlobURL () {
        if (this.state.blobURL) {
            URL.revokeObjectURL(this.state.blobURL);
        }
    }

    getAssetObject () {
        const sprite = this.props.vm.editingTarget.sprite;
        return sprite.assets[this.props.assetIndex];
    }

    decodeAssetData () {
        const assetObject = this.getAssetObject();
        if (!assetObject || !assetObject.asset || !assetObject.asset.data) {
            return '';
        }

        try {
            return new TextDecoder().decode(assetObject.asset.data);
        } catch (e) {
            return '';
        }
    }

    updateBlobURL () {
        this.revokeBlobURL();

        const supportsBlobPreview = this.props.mediaType === 'video' ||
            this.props.mediaType === 'sound' ||
            this.props.mediaType === 'image';

        if (!supportsBlobPreview) {
            this.setState({blobURL: null});
            return;
        }

        const assetObject = this.getAssetObject();
        if (!assetObject) {
            this.setState({blobURL: null});
            return;
        }

        const blob = new Blob([assetObject.asset.data], {type: this.props.contentType});
        this.setState({blobURL: URL.createObjectURL(blob)});
    }

    updateTextContent () {
        if (!this.props.isTextEditable) {
            this.setState({
                textContent: '',
                canUndo: false,
                canRedo: false
            });
            return;
        }

        this.setState({
            textContent: this.decodeAssetData(),
            canUndo: false,
            canRedo: false
        });
    }

    saveTextAsset (value) {
        if (!this.props.isTextEditable) {
            return;
        }

        const assetObject = this.getAssetObject();
        if (!assetObject || !assetObject.asset || typeof assetObject.asset.encodeTextData !== 'function') {
            return;
        }

        const extension = assetObject.dataFormat || 'txt';
        assetObject.asset.encodeTextData(value, extension, true);
        assetObject.md5 = `${assetObject.asset.assetId}.${extension}`;
        assetObject.assetId = assetObject.asset.assetId;
        this.props.vm.runtime.emitProjectChanged();
    }

    updateUndoRedoState () {
        if (!this.editor) {
            return;
        }

        const model = this.editor.getModel();
        if (!model || typeof model.canUndo !== 'function' || typeof model.canRedo !== 'function') {
            return;
        }

        const currentContent = model.getValue();
        const contentHasChanged = currentContent !== this.initialContent;
        const canUndo = model.canUndo() && contentHasChanged;
        const canRedo = model.canRedo();

        this.setState({
            canUndo,
            canRedo
        });
    }

    handleEditorDidMount (editor) {
        this.clearEditorListener();
        this.editor = editor;

        const model = editor.getModel();
        this.initialContent = model ? model.getValue() : '';

        if (model && typeof model.onDidChangeContent === 'function') {
            this.editorDisposable = model.onDidChangeContent(() => {
                this.updateUndoRedoState();
            });
        }

        setTimeout(() => {
            if (!this.editor) return;

            this.editor.setPosition({lineNumber: 1, column: 1});

            this.setState({
                canUndo: false,
                canRedo: false
            });
        }, 0);
    }

    handleTextContentChange (value) {
        this.setState({textContent: value});
        this.saveTextAssetDebounced(value);
        this.updateUndoRedoState();
    }

    handleUndo () {
        if (!this.editor) {
            return;
        }

        const model = this.editor.getModel();
        if (!model) return;

        this.editor.trigger('asset-editor-toolbar', 'undo', null);

        setTimeout(() => {
            if (!this.editor || !model) return;

            const contentAfter = model.getValue();

            if (contentAfter === this.initialContent) {
                this.editor.trigger('asset-editor-toolbar', 'redo', null);
            }

            this.updateUndoRedoState();
        }, 0);
    }

    handleRedo () {
        if (!this.editor) {
            return;
        }

        this.editor.trigger('asset-editor-toolbar', 'redo', null);

        setTimeout(() => {
            this.updateUndoRedoState();
        }, 0);
    }

    handleAssetRename (newName) {
        const [name, ...extensionParts] = newName.split('.');
        const extension = extensionParts.join('.') || 'file';
        this.props.vm.renameAsset(this.props.assetIndex, name, extension);
    }

    render () {
        let imageURL;
        if (this.props.mediaType === 'image') {
            imageURL = getCostumeUrl(this.props.icon.asset);
        } else if (this.props.icon.url) {
            imageURL = this.props.icon.url;
        }

        const monacoTheme = this.props.theme.gui === 'dark' ? 'vs-dark' : 'vs';

        return (
            <AssetViewerComponent
                sharedAssetControl={this.props.sharedAssetControl}
                name={this.props.name}
                lastModified={this.props.lastModified}
                size={this.props.size}
                blobURL={this.state.blobURL}
                mediaType={this.props.mediaType}
                imageURL={imageURL}
                isTextEditable={this.props.isTextEditable}
                textContent={this.state.textContent}
                textLanguage={this.props.textLanguage}
                monacoTheme={monacoTheme}
                canUndo={this.state.canUndo}
                canRedo={this.state.canRedo}
                onChangeName={this.handleAssetRename}
                onChangeText={this.handleTextContentChange}
                onEditorDidMount={this.handleEditorDidMount}
                onUndo={this.handleUndo}
                onRedo={this.handleRedo}
            />
        );
    }
}

AssetViewer.propTypes = {
    sharedAssetControl: PropTypes.node,
    icon: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    lastModified: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    assetId: PropTypes.string.isRequired,
    assetIndex: PropTypes.number.isRequired,
    contentType: PropTypes.string,
    mediaType: PropTypes.string,
    isTextEditable: PropTypes.bool,
    textLanguage: PropTypes.string,
    theme: PropTypes.object,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = (state, {selectedAssetIndex}) => {
    const sprite = state.scratchGui.vm.editingTarget.sprite;
    const index = selectedAssetIndex >= 0 && selectedAssetIndex < sprite.assets.length ?
        selectedAssetIndex : sprite.assets.length - 1;
    const assetObject = sprite.assets[index];
    const assetType = getAssetType(assetObject);

    return {
        vm: state.scratchGui.vm,
        theme: state.scratchGui.theme.theme,
        name: assetObject.dataFormat !== '' ?
            `${assetObject.name}.${assetObject.dataFormat}` :
            assetObject.name,
        lastModified: assetObject.lastModified ?
            new Date(assetObject.lastModified).toLocaleString() :
            'Unknown',
        size: formatBytes(assetObject.asset.data.byteLength),
        assetIndex: index,
        assetId: assetObject.asset.assetId,
        contentType: assetObject.contentType,
        mediaType: assetType.displayable ? assetType.type : null,
        isTextEditable: assetType.editable === true,
        textLanguage: assetType.language || 'plaintext'
    };
};

export default connect(
    mapStateToProps
)(AssetViewer);
