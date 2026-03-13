import React from 'react';
import PropTypes from 'prop-types';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Editor from 'react-monaco-editor';

import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';

import redoIcon from '!../../lib/tw-recolor/build!../sound-editor/icon--redo.svg';
import undoIcon from '!../../lib/tw-recolor/build!../sound-editor/icon--undo.svg';

import styles from './asset-viewer.css';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    asset: {
        id: 'gui.assetViewer.asset',
        description: 'Label for the name of the asset',
        defaultMessage: 'Asset'
    },
    lastModifiedDate: {
        id: 'gui.assetViewer.lastModifiedDate',
        description: 'Label for the last modification date of the asset',
        defaultMessage: 'Last Modified'
    },
    size: {
        id: 'gui.assetViewer.size',
        description: 'Label for the size of the asset',
        defaultMessage: 'Size'
    },
    undo: {
        id: 'gui.assetViewer.undo',
        description: 'Title of the button to undo in the text asset editor',
        defaultMessage: 'Undo'
    },
    redo: {
        id: 'gui.assetViewer.redo',
        description: 'Title of the button to redo in the text asset editor',
        defaultMessage: 'Redo'
    }
});

const AssetViewerComponent = props => (
    <div className={`${styles.viewerContainer} ${props.isTextEditable ? styles.textMode : ''}`}>
        {props.isTextEditable ? (
            <React.Fragment>
                <div className={styles.editorHeaderRow}>
                    <div className={styles.inputGroup}>
                        <Label text={props.intl.formatMessage(messages.asset)}>
                            <BufferedInput
                                tabIndex="1"
                                type="text"
                                value={props.name}
                                onSubmit={props.onChangeName}
                                className={styles.nameInput}
                            />
                        </Label>
                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.button}
                                disabled={!props.canUndo}
                                title={props.intl.formatMessage(messages.undo)}
                                onClick={props.onUndo}
                            >
                                <TWRenderRecoloredImage
                                    className={styles.undoIcon}
                                    draggable={false}
                                    src={undoIcon}
                                />
                            </button>
                            <button
                                className={styles.button}
                                disabled={!props.canRedo}
                                title={props.intl.formatMessage(messages.redo)}
                                onClick={props.onRedo}
                            >
                                <TWRenderRecoloredImage
                                    className={styles.redoIcon}
                                    draggable={false}
                                    src={redoIcon}
                                />
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.editorSurface}>
                    <Editor
                        language={props.textLanguage || 'plaintext'}
                        theme={props.monacoTheme || 'vs'}
                        value={props.textContent}
                        options={{
                            minimap: {enabled: false},
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            tabSize: 4,
                            selectionHighlight: false,
                            occurrencesHighlight: false,
                            renderWhitespace: 'none'
                        }}
                        onChange={props.onChangeText}
                        editorDidMount={props.onEditorDidMount}
                    />
                </div>
                <div className={styles.infoRow}>
                    <div className={styles.attribute}>
                        <Label text={props.intl.formatMessage(messages.lastModifiedDate)}>
                            <Label secondary text={props.lastModified} />
                        </Label>
                    </div>
                    <div className={styles.attribute}>
                        <Label text={props.intl.formatMessage(messages.size)}>
                            <Label secondary text={props.size} />
                        </Label>
                    </div>
                </div>
            </React.Fragment>
        ) : (
            <React.Fragment>
                {props.blobURL && props.mediaType ? (
                    props.mediaType === 'video' ? (
                        <video className={styles.mediaPreview} src={props.blobURL} controls />
                    ) : props.mediaType === 'sound' ? (
                        <audio className={styles.mediaPreview} src={props.blobURL} controls />
                    ) : props.mediaType === 'image' ? (
                        <img className={styles.mediaPreview} src={props.blobURL} draggable={false} />
                    ) : null
                ) : (
                    <img
                        className={styles.icon}
                        draggable={false}
                        src={props.imageURL}
                    />
                )}
                <div className={styles.attribute}>
                    <Label text={props.intl.formatMessage(messages.asset)}>
                        <BufferedInput
                            tabIndex="1"
                            type="text"
                            value={props.name}
                            onSubmit={props.onChangeName}
                        />
                    </Label>
                </div>
                <div className={styles.attribute}>
                    <Label text={props.intl.formatMessage(messages.lastModifiedDate)}>
                        <Label secondary text={props.lastModified} />
                    </Label>
                </div>
                <div className={styles.attribute}>
                    <Label text={props.intl.formatMessage(messages.size)}>
                        <Label secondary text={props.size} />
                    </Label>
                </div>
            </React.Fragment>
        )}
    </div>
);

AssetViewerComponent.propTypes = {
    name: PropTypes.string.isRequired,
    lastModified: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    blobURL: PropTypes.any,
    mediaType: PropTypes.any,
    imageURL: PropTypes.string,
    isTextEditable: PropTypes.bool,
    textContent: PropTypes.string,
    textLanguage: PropTypes.string,
    monacoTheme: PropTypes.string,
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool,
    onUndo: PropTypes.func,
    onRedo: PropTypes.func,
    onChangeText: PropTypes.func,
    onChangeName: PropTypes.func,
    onEditorDidMount: PropTypes.func,
    intl: intlShape
};

export default injectIntl(AssetViewerComponent);