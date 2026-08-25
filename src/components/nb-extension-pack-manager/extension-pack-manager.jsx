/* eslint-disable react/jsx-no-bind, react/jsx-no-literals */
import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import FileInput from '../tw-custom-extension-modal/file-input.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import helpIcon from '../nb-editor-settings-modal/help-icon.svg';
import loaderStyles from '../tw-custom-extension-modal/custom-extension-modal.css';
import styles from './extension-pack-manager.css';

class ExtensionPackManager extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            packURL: '',
            name: '',
            type: 'url',
            url: '',
            source: '',
            fileName: '',
            files: null,
            packMultiSelect: false,
            extensionMultiSelect: false,
            selectedPacks: [],
            selectedExtensions: [],
            dragging: null,
            packHelpVisible: false
        };
    }
    handleFiles (files) {
        const file = files && files[0];
        this.setState({files});
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => this.setState({source: reader.result, fileName: file.name});
        reader.readAsText(file);
    }
    handleSelection (stateKey, event) {
        const selected = this.state[stateKey];
        this.setState({
            [stateKey]: event.target.checked ?
                [...selected, event.target.value] :
                selected.filter(value => value !== event.target.value)
        });
    }
    handleDrop (type, index) {
        if (!this.state.dragging || this.state.dragging.type !== type) return;
        if (type === 'pack') {
            this.props.onReorderPacks(this.state.dragging.index, index);
        } else {
            this.props.onReorderExtensions(this.state.dragging.index, index);
        }
        this.setState({dragging: null});
    }
    render () {
        return (
            <Modal
                className={styles.modalContent}
                contentLabel="Manage Extension Galleries"
                id="extensionPackManager"
                onRequestClose={this.props.onClose}
            >
                <Box
                    className={styles.body}
                    onDragOver={event => {
                        if (event.dataTransfer.types.includes('Files')) {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'copy';
                        }
                    }}
                    onDrop={event => {
                        if (event.dataTransfer.files.length) {
                            event.preventDefault();
                            this.setState({type: 'file'});
                            this.handleFiles(event.dataTransfer.files);
                        }
                    }}
                >
                    <h2 className={styles.headingWithHelp}>
                        Extension Packs
                        <button
                            className={styles.helpIcon}
                            title="Click for help"
                            onClick={() => this.setState(state => ({packHelpVisible: !state.packHelpVisible}))}
                        >
                            <img
                                draggable={false}
                                src={helpIcon}
                            />
                        </button>
                    </h2>
                    {this.state.packHelpVisible && (
                        <div className={styles.packHelp}>
                            Find extension packs at{' '}
                            <a
                                href="https://packs.nitrobolt.org/"
                                rel="noreferrer"
                                target="_blank"
                            >
                                packs.nitrobolt.org
                            </a>
                            , or ask your favorite extension gallery to support the pack format.
                        </div>
                    )}
                    <p>
                        Add the direct URL to a pack.json file.
                    </p>
                    <div className={styles.addRow}>
                        <input
                            type="url"
                            placeholder="https://example.com/pack.json"
                            value={this.state.packURL}
                            onChange={event => this.setState({packURL: event.target.value})}
                        />
                        <button onClick={() => this.props.onAddPack(this.state.packURL)}>Add pack</button>
                    </div>
                    {this.props.packs.length > 0 && (
                        <div className={styles.entryList}>
                            {this.props.packs.map((pack, index) => (
                                <div
                                    className={styles.item}
                                    draggable={!this.state.packMultiSelect}
                                    key={pack.url}
                                    onDragEnd={() => this.setState({dragging: null})}
                                    onDragOver={event => event.preventDefault()}
                                    onDragStart={() => this.setState({dragging: {type: 'pack', index}})}
                                    onDrop={() => this.handleDrop('pack', index)}
                                >
                                    <div>
                                        <strong>{pack.name}</strong>
                                        <small>{pack.error || pack.url}</small>
                                    </div>
                                    {this.state.packMultiSelect ? (
                                        <FancyCheckbox
                                            className={styles.checkboxOption}
                                            value={pack.url}
                                            onChange={event => this.handleSelection('selectedPacks', event)}
                                        />
                                    ) : (
                                        <button
                                            aria-label={`Remove ${pack.name}`}
                                            className={styles.deleteOption}
                                            title="Remove"
                                            onClick={() => this.props.onRemovePack(pack.url)}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className={styles.multiSelectRow}>
                                {this.state.packMultiSelect ? (
                                    <React.Fragment>
                                        <button
                                            className={styles.multiSelectNormal}
                                            onClick={() => this.setState({packMultiSelect: false, selectedPacks: []})}
                                        >Cancel</button>
                                        <button
                                            className={styles.multiSelectDelete}
                                            disabled={!this.state.selectedPacks.length}
                                            onClick={() => {
                                                this.state.selectedPacks.forEach(this.props.onRemovePack);
                                                this.setState({packMultiSelect: false, selectedPacks: []});
                                            }}
                                        >Delete</button>
                                    </React.Fragment>
                                ) : (
                                    <button
                                        className={styles.multiSelectNormal}
                                        onClick={() => this.setState({packMultiSelect: true, selectedPacks: []})}
                                    >Select Multiple</button>
                                )}
                            </div>
                        </div>
                    )}

                    <h2>Individual extensions</h2>
                    <p>These extensions appear in the &quot;individual&quot; section of the extension picker.</p>
                    <label htmlFor="individual-extension-name">Display name</label>
                    <input
                        className={loaderStyles.urlInput}
                        id="individual-extension-name"
                        placeholder="Enter a name..."
                        value={this.state.name}
                        onChange={event => this.setState({name: event.target.value})}
                    />
                    <div className={loaderStyles.typeSelectorContainer}>
                        {['url', 'file', 'text'].map(type => (
                            <div
                                className={loaderStyles.typeSelectorButton}
                                data-active={this.state.type === type}
                                key={type}
                                onClick={() => this.setState({type, source: '', fileName: '', files: null})}
                                tabIndex={0}
                            >
                                {type === 'url' ? 'URL' : type === 'file' ? 'Files' : 'Text'}
                            </div>
                        ))}
                    </div>
                    <div className={styles.individualLoader}>
                        {this.state.type === 'url' ? (
                            <React.Fragment>
                                <p>Enter the extension&apos;s URL:</p>
                                <input
                                    className={loaderStyles.urlInput}
                                    type="url"
                                    placeholder="https://extensions.nitrobolt.org/..."
                                    value={this.state.url}
                                    onChange={event => this.setState({url: event.target.value})}
                                />
                            </React.Fragment>
                        ) : this.state.type === 'file' ? (
                            <React.Fragment>
                                <p>Select or drop extension JavaScript files:</p>
                                <FileInput
                                    accept=".js"
                                    className={styles.filePicker}
                                    files={this.state.files}
                                    onChange={files => this.handleFiles(files)}
                                />
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <p>Paste the extension&apos;s JavaScript source code:</p>
                                <textarea
                                    className={loaderStyles.textCodeInput}
                                    placeholder={'class Extension {\n  // ...\n}\n' +
                                        'Scratch.extensions.register(new Extension());'}
                                    value={this.state.source}
                                    onChange={event => this.setState({source: event.target.value, fileName: ''})}
                                    spellCheck={false}
                                />
                            </React.Fragment>
                        )}
                        <div className={loaderStyles.buttonRow}>
                            <button
                                className={loaderStyles.loadButton}
                                onClick={() => this.props.onAddExtension(this.state)}
                            >
                                Add extension
                            </button>
                        </div>
                    </div>
                    {this.props.extensions.length > 0 && (
                        <div className={styles.entryList}>
                            {this.props.extensions.map((extension, index) => (
                                <div
                                    className={styles.item}
                                    draggable={!this.state.extensionMultiSelect}
                                    key={extension.url}
                                    onDragEnd={() => this.setState({dragging: null})}
                                    onDragOver={event => event.preventDefault()}
                                    onDragStart={() => this.setState({dragging: {type: 'extension', index}})}
                                    onDrop={() => this.handleDrop('extension', index)}
                                >
                                    <div>
                                        <strong>{extension.name}</strong>
                                        <small>
                                            {extension.sourceType === 'file' ? extension.fileName || 'Uploaded file' :
                                                extension.sourceType === 'text' ? 'Pasted JavaScript' : extension.url}
                                        </small>
                                    </div>
                                    {this.state.extensionMultiSelect ? (
                                        <FancyCheckbox
                                            className={styles.checkboxOption}
                                            value={extension.url}
                                            onChange={event => this.handleSelection('selectedExtensions', event)}
                                        />
                                    ) : (
                                        <button
                                            aria-label={`Remove ${extension.name}`}
                                            className={styles.deleteOption}
                                            title="Remove"
                                            onClick={() => this.props.onRemoveExtension(extension.url)}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className={styles.multiSelectRow}>
                                {this.state.extensionMultiSelect ? (
                                    <React.Fragment>
                                        <button
                                            className={styles.multiSelectNormal}
                                            onClick={() => this.setState({
                                                extensionMultiSelect: false,
                                                selectedExtensions: []
                                            })}
                                        >Cancel</button>
                                        <button
                                            className={styles.multiSelectDelete}
                                            disabled={!this.state.selectedExtensions.length}
                                            onClick={() => {
                                                this.state.selectedExtensions.forEach(this.props.onRemoveExtension);
                                                this.setState({
                                                    extensionMultiSelect: false,
                                                    selectedExtensions: []
                                                });
                                            }}
                                        >Delete</button>
                                    </React.Fragment>
                                ) : (
                                    <button
                                        className={styles.multiSelectNormal}
                                        onClick={() => this.setState({
                                            extensionMultiSelect: true,
                                            selectedExtensions: []
                                        })}
                                    >Select Multiple</button>
                                )}
                            </div>
                        </div>
                    )}
                    {this.props.error && <p className={styles.error}>{this.props.error}</p>}
                </Box>
            </Modal>
        );
    }
}

ExtensionPackManager.propTypes = {
    error: PropTypes.string,
    extensions: PropTypes.arrayOf(PropTypes.object).isRequired,
    onAddExtension: PropTypes.func.isRequired,
    onAddPack: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onRemoveExtension: PropTypes.func.isRequired,
    onRemovePack: PropTypes.func.isRequired,
    onReorderExtensions: PropTypes.func.isRequired,
    onReorderPacks: PropTypes.func.isRequired,
    packs: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ExtensionPackManager;
