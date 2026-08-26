import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import VM from 'scratch-vm';

import AssetPanel from '../components/asset-panel/asset-panel.jsx';
import soundIcon from '../components/asset-panel/icon--sound.svg';
import soundIconRtl from '../components/asset-panel/icon--sound-rtl.svg';
import addSoundFromLibraryIcon from '../components/asset-panel/icon--add-sound-lib.svg';
import addSoundFromRecordingIcon from '../components/asset-panel/icon--add-sound-record.svg';
import fileUploadIcon from '../components/action-menu/icon--file-upload.svg';
import surpriseIcon from '../components/action-menu/icon--surprise.svg';
import searchIcon from '../components/action-menu/icon--search.svg';

import RecordModal from './record-modal.jsx';
import SoundEditor from './sound-editor.jsx';
import SoundLibrary from './sound-library.jsx';
import SoundEditorNotSupported from '../components/tw-sound-editor-not-supported/sound-editor-not-supported.jsx';

import {getSoundLibrary} from '../lib/libraries/tw-async-libraries';
import {handleFileUpload, soundUpload} from '../lib/file-uploader.js';
import errorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import DragConstants from '../lib/drag-constants';
import downloadBlob from '../lib/download-blob';
import SharedAudioContext from '../lib/audio/shared-audio-context.js';
import getAssetType from '../lib/nb-asset-type.js';

import {connect} from 'react-redux';

import {
    closeSoundLibrary,
    openSoundLibrary,
    openSoundRecorder
} from '../reducers/modals';

import {
    activateTab,
    COSTUMES_TAB_INDEX,
    ASSETS_TAB_INDEX
} from '../reducers/editor-tab';

import {setRestore} from '../reducers/restore-deletion';
import {showStandardAlert, closeAlertWithId} from '../reducers/alerts';

class SoundTab extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSelectSound',
            'handleDeleteSound',
            'handleDuplicateSound',
            'handleExportSound',
            'handleMoveToTop',
            'handleMoveToBottom',
            'handleNewSound',
            'handleSurpriseSound',
            'handleFileUploadClick',
            'handleSoundUpload',
            'handleFolderReorder',
            'handleItemFolderChangeComplete',
            'handleDrop',
            'setFileInput'
        ]);
        this.state = {selectedSoundIndex: 0};
    }

    componentWillReceiveProps (nextProps) {
        const {
            editingTarget,
            sprites,
            stage
        } = nextProps;

        const target = editingTarget && sprites[editingTarget] ? sprites[editingTarget] : stage;
        if (!target || !target.sounds) {
            return;
        }

        // If switching editing targets, reset the sound index
        if (this.props.editingTarget !== editingTarget) {
            this.setState({selectedSoundIndex: 0});
        } else if (this.state.selectedSoundIndex > target.sounds.length - 1) {
            this.setState({selectedSoundIndex: Math.max(target.sounds.length - 1, 0)});
        }
    }

    handleSelectSound (soundIndex) {
        this.setState({selectedSoundIndex: soundIndex});
    }

    handleDeleteSound (soundIndex) {
        const restoreFun = this.props.vm.deleteSound(soundIndex);
        if (soundIndex >= this.state.selectedSoundIndex) {
            this.setState({selectedSoundIndex: Math.max(0, soundIndex - 1)});
        }
        this.props.dispatchUpdateRestore({restoreFun, deletedItem: 'Sound'});
    }

    handleExportSound (soundIndex) {
        const item = this.props.vm.editingTarget.sprite.sounds[soundIndex];
        const blob = new Blob([item.asset.data], {type: item.asset.assetType.contentType});
        downloadBlob(`${item.name}.${item.asset.dataFormat}`, blob);
    }

    handleDuplicateSound (soundIndex) {
        this.props.vm.duplicateSound(soundIndex).then(() => {
            this.setState({selectedSoundIndex: soundIndex + 1});
        });
    }

    handleMoveToTop (soundIndex) {
        this.props.vm.editingTarget.reorderSound(soundIndex, 0);
        this.setState({selectedSoundIndex: 0});
    }

    handleMoveToBottom (soundIndex) {
        const lastSoundIndex = this.props.vm.editingTarget.sprite.sounds.length - 1;
        this.props.vm.editingTarget.reorderSound(soundIndex, lastSoundIndex);
        this.setState({selectedSoundIndex: lastSoundIndex});
    }

    handleNewSound () {
        if (!this.props.vm.editingTarget) {
            return null;
        }
        const sprite = this.props.vm.editingTarget.sprite;
        const sounds = sprite.sounds ? sprite.sounds : [];
        this.setState({selectedSoundIndex: Math.max(sounds.length - 1, 0)});
    }

    async handleSurpriseSound () {
        const soundLibraryContent = await getSoundLibrary();
        const soundItem = soundLibraryContent[Math.floor(Math.random() * soundLibraryContent.length)];
        const vmSound = {
            format: soundItem.dataFormat,
            md5: soundItem.md5ext,
            rate: soundItem.rate,
            sampleCount: soundItem.sampleCount,
            name: soundItem.name
        };
        this.props.vm.addSound(vmSound).then(() => {
            this.handleNewSound();
        });
    }

    handleFileUploadClick () {
        this.fileInput.click();
    }

    handleSoundUpload (e) {
        const storage = this.props.vm.runtime.storage;
        const targetId = this.props.vm.editingTarget.id;
        this.props.onShowImporting();
        handleFileUpload(e.target, (buffer, fileType, fileName, fileIndex, fileCount) => {
            soundUpload(buffer, fileType, storage, newSound => {
                newSound.name = fileName;
                this.props.vm.addSound(newSound, targetId).then(() => {
                    this.handleNewSound();
                    if (fileIndex === fileCount - 1) {
                        this.props.onCloseImporting();
                    }
                });
            }, this.props.onCloseImporting);
        }, this.props.onCloseImporting);
    }

    handleFolderReorder (folderId, newIndex) {
        const sounds = this.props.vm.editingTarget.sprite.sounds;
        const activeSound = sounds[this.state.selectedSoundIndex];
        this.props.vm.moveFolderToIndex(folderId, newIndex);
        this.setState({selectedSoundIndex: this.props.vm.editingTarget.sprite.sounds.indexOf(activeSound)});
    }
    handleItemFolderChangeComplete (activeSound, targetId) {
        const target = this.props.vm.editingTarget;
        if (!target || target.id !== targetId) return;
        const selectedSoundIndex = target.sprite.sounds.indexOf(activeSound);
        if (selectedSoundIndex >= 0) this.setState({selectedSoundIndex});
    }
    handleDrop (dropInfo) {
        if (dropInfo.dragType === DragConstants.FOLDER_SOUND &&
            dropInfo.payload && dropInfo.payload.nativeFolderId) {
            const sourceId = dropInfo.payload.nativeFolderId;
            const hoveredFolderId = dropInfo.payload.folderAtDisplayIndex &&
                dropInfo.payload.folderAtDisplayIndex[dropInfo.hoveredIndex];
            const hoveredFolder = this.props.vm.runtime.projectFolders.find(folder => folder.id === hoveredFolderId);
            const structuralIndex = typeof dropInfo.hoveredIndex === 'number' ?
                dropInfo.hoveredIndex : dropInfo.newIndex;
            const destinationParentId = hoveredFolder && hoveredFolder._isOpen !== false &&
                hoveredFolder.id !== sourceId ?
                hoveredFolder.id : dropInfo.rootDrop ? null : dropInfo.payload.parentFolderAtDisplayIndex &&
                    dropInfo.payload.parentFolderAtDisplayIndex[structuralIndex];
            if (destinationParentId !== sourceId) {
                try {
                    this.props.vm.setFolderParent(sourceId, destinationParentId || null);
                } catch (error) {
                    return;
                }
            }
            const mappedIndex = dropInfo.payload.dropIndexMap && dropInfo.payload.dropIndexMap[dropInfo.newIndex];
            this.handleFolderReorder(sourceId,
                typeof mappedIndex === 'number' ? mappedIndex : dropInfo.newIndex);
            return;
        }
        if (dropInfo.dragType === DragConstants.SOUND) {
            const sprite = this.props.vm.editingTarget.sprite;
            const activeSound = sprite.sounds[this.state.selectedSoundIndex];
            const mappedIndex = dropInfo.dropIndexMap && dropInfo.dropIndexMap[dropInfo.newIndex];
            const newIndex = typeof mappedIndex === 'number' ? mappedIndex : dropInfo.newIndex;
            const destination = sprite.sounds[newIndex];
            const hoveredFolderId = dropInfo.folderAtDisplayIndex &&
                dropInfo.folderAtDisplayIndex[dropInfo.hoveredIndex];
            const hoveredFolder = this.props.vm.runtime.projectFolders.find(folder => folder.id === hoveredFolderId);
            const destinationFolder = hoveredFolder || (destination && destination.folderId &&
                this.props.vm.runtime.projectFolders.find(folder => folder.id === destination.folderId));
            this.props.vm.setItemFolder('sound', this.props.vm.editingTarget.id,
                dropInfo.index, !dropInfo.rootDrop && destinationFolder && destinationFolder._isOpen !== false ?
                    destinationFolder.id : null, newIndex);

            this.setState({selectedSoundIndex: sprite.sounds.indexOf(activeSound)});
        } else if (dropInfo.dragType === DragConstants.BACKPACK_COSTUME) {
            this.props.onActivateCostumesTab();
            this.props.vm.addCostume(dropInfo.payload.body, {
                name: dropInfo.payload.name
            });
        } else if (dropInfo.dragType === DragConstants.BACKPACK_SOUND) {
            this.props.vm.addSound({
                md5: dropInfo.payload.body,
                name: dropInfo.payload.name
            }).then(this.handleNewSound);
        } else if (dropInfo.dragType === DragConstants.BACKPACK_ASSET) {
            // Detect if the asset can be added as a sound
            // If it is not a sound, add it to assets
            const payload = dropInfo.payload;
            const type = getAssetType(payload).type;
            const storage = this.props.vm.runtime.storage;
            const targetId = this.props.vm.editingTarget.id;
            if (type === 'sound') {
                soundUpload(payload.bodyData, payload.mime, storage, sound => {
                    sound.name = payload.name;
                    this.props.vm.addSound(sound, targetId)
                        .then(this.handleNewSound);
                });
            } else {
                this.props.onActivateAssetsTab();
                this.props.vm.addAsset({
                    md5: payload.body,
                    lastModified: payload.lastModified,
                    contentType: payload.mime,
                    dataFormat: payload.dataFormat,
                    name: payload.name
                });
            }
        }
    }

    setFileInput (input) {
        this.fileInput = input;
    }

    render () {
        const {
            dispatchUpdateRestore, // eslint-disable-line no-unused-vars
            intl,
            isRtl,
            vm,
            onNewSoundFromLibraryClick,
            onNewSoundFromRecordingClick
        } = this.props;

        if (!vm.editingTarget) {
            return null;
        }

        const isSupported = !!(vm.runtime.audioEngine && new SharedAudioContext());

        const sprite = vm.editingTarget.sprite;

        const sounds = sprite.sounds ? sprite.sounds.map(sound => (
            {
                url: isRtl ? soundIconRtl : soundIcon,
                name: sound.name,
                folderId: sound.folderId || null,
                details: (sound.sampleCount / sound.rate).toFixed(2),
                dragPayload: sound
            }
        )) : [];

        const messages = defineMessages({
            fileUploadSound: {
                defaultMessage: 'Upload Sound',
                description: 'Button to upload sound from file in the editor tab',
                id: 'gui.soundTab.fileUploadSound'
            },
            surpriseSound: {
                defaultMessage: 'Surprise',
                description: 'Button to get a random sound in the editor tab',
                id: 'gui.soundTab.surpriseSound'
            },
            recordSound: {
                defaultMessage: 'Record',
                description: 'Button to record a sound in the editor tab',
                id: 'gui.soundTab.recordSound'
            },
            addSound: {
                defaultMessage: 'Choose a Sound',
                description: 'Button to add a sound in the editor tab',
                id: 'gui.soundTab.addSoundFromLibrary'
            }
        });

        return (
            <AssetPanel
                isStage={vm.editingTarget.isStage}
                selectedSharedItem={sprite.sounds[this.state.selectedSoundIndex]}
                sharedAssetKind="sound"
                buttons={isSupported ? [{
                    title: intl.formatMessage(messages.addSound),
                    img: addSoundFromLibraryIcon,
                    onClick: onNewSoundFromLibraryClick
                }, {
                    title: intl.formatMessage(messages.fileUploadSound),
                    img: fileUploadIcon,
                    onClick: this.handleFileUploadClick,
                    fileAccept: '.wav, .mp3, .ogg, .flac, .aac, .m4a',
                    fileChange: this.handleSoundUpload,
                    fileInput: this.setFileInput,
                    fileMultiple: true
                }, {
                    title: intl.formatMessage(messages.surpriseSound),
                    img: surpriseIcon,
                    onClick: this.handleSurpriseSound
                }, {
                    title: intl.formatMessage(messages.recordSound),
                    img: addSoundFromRecordingIcon,
                    onClick: onNewSoundFromRecordingClick
                }, {
                    title: intl.formatMessage(messages.addSound),
                    img: searchIcon,
                    onClick: onNewSoundFromLibraryClick
                }] : []}
                dragType={DragConstants.SOUND}
                isRtl={isRtl}
                items={sounds}
                vm={vm}
                onFolderReorder={this.handleFolderReorder}
                onItemFolderChangeComplete={this.handleItemFolderChangeComplete}
                selectedItemIndex={this.state.selectedSoundIndex}
                onDeleteClick={this.handleDeleteSound}
                onDrop={this.handleDrop}
                onDuplicateClick={this.handleDuplicateSound}
                onExportClick={this.handleExportSound}
                onItemClick={this.handleSelectSound}
                onMoveToTopClick={this.handleMoveToTop}
                onMoveToBottomClick={this.handleMoveToBottom}
            >
                {sprite.sounds && sprite.sounds[this.state.selectedSoundIndex] ? (
                    isSupported ? (
                        <SoundEditor
                            soundIndex={this.state.selectedSoundIndex}
                            preferences={this.props.preferences}
                        />
                    ) : (
                        <SoundEditorNotSupported />
                    )
                ) : null}
                {this.props.soundRecorderVisible ? (
                    <RecordModal
                        onNewSound={this.handleNewSound}
                        preferences={this.props.preferences}
                    />
                ) : null}
                {this.props.soundLibraryVisible ? (
                    <SoundLibrary
                        vm={this.props.vm}
                        onNewSound={this.handleNewSound}
                        onRequestClose={this.props.onRequestCloseSoundLibrary}
                    />
                ) : null}
            </AssetPanel>
        );
    }
}

SoundTab.propTypes = {
    dispatchUpdateRestore: PropTypes.func,
    editingTarget: PropTypes.string,
    intl: intlShape,
    isRtl: PropTypes.bool,
    onActivateCostumesTab: PropTypes.func.isRequired,
    onActivateAssetsTab: PropTypes.func.isRequired,
    onCloseImporting: PropTypes.func.isRequired,
    onNewSoundFromLibraryClick: PropTypes.func.isRequired,
    onNewSoundFromRecordingClick: PropTypes.func.isRequired,
    onRequestCloseSoundLibrary: PropTypes.func.isRequired,
    onShowImporting: PropTypes.func.isRequired,
    soundLibraryVisible: PropTypes.bool,
    soundRecorderVisible: PropTypes.bool,
    sprites: PropTypes.shape({
        id: PropTypes.shape({
            sounds: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string.isRequired
            }))
        })
    }),
    stage: PropTypes.shape({
        sounds: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired
        }))
    }),
    preferences: PropTypes.object,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    isRtl: state.locales.isRtl,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    soundLibraryVisible: state.scratchGui.modals.soundLibrary,
    soundRecorderVisible: state.scratchGui.modals.soundRecorder
});

const mapDispatchToProps = dispatch => ({
    onActivateCostumesTab: () => dispatch(activateTab(COSTUMES_TAB_INDEX)),
    onActivateAssetsTab: () => dispatch(activateTab(ASSETS_TAB_INDEX)),
    onNewSoundFromLibraryClick: e => {
        e.preventDefault();
        dispatch(openSoundLibrary());
    },
    onNewSoundFromRecordingClick: () => {
        dispatch(openSoundRecorder());
    },
    onRequestCloseSoundLibrary: () => {
        dispatch(closeSoundLibrary());
    },
    dispatchUpdateRestore: restoreState => {
        dispatch(setRestore(restoreState));
    },
    onCloseImporting: () => dispatch(closeAlertWithId('importingAsset')),
    onShowImporting: () => dispatch(showStandardAlert('importingAsset'))
});

export default errorBoundaryHOC('Sound Tab')(
    injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps
    )(SoundTab))
);
