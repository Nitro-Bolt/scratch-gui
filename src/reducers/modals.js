const OPEN_MODAL = 'scratch-gui/modals/OPEN_MODAL';
const CLOSE_MODAL = 'scratch-gui/modals/CLOSE_MODAL';

const MODAL_BACKDROP_LIBRARY = 'backdropLibrary';
const MODAL_COSTUME_LIBRARY = 'costumeLibrary';
const MODAL_EXTENSION_LIBRARY = 'extensionLibrary';
const MODAL_LOADING_PROJECT = 'loadingProject';
const MODAL_TELEMETRY = 'telemetryModal';
const MODAL_SOUND_LIBRARY = 'soundLibrary';
const MODAL_SPRITE_LIBRARY = 'spriteLibrary';
const MODAL_SOUND_RECORDER = 'soundRecorder';
const MODAL_CONNECTION = 'connectionModal';
const MODAL_TIPS_LIBRARY = 'tipsLibrary';
const MODAL_SETTINGS = 'settingsModal';
const MODAL_CUSTOM_EXTENSION = 'customExtensionModal';
const MODAL_EXTENSION_MANAGER = 'extensionManagerModal';
const MODAL_RESTORE_POINTS = 'restorePointModal';
const MODAL_FONTS = 'fontsModal';
const MODAL_UNKNOWN_PLATFORM = 'unknownPlatformModal';
const MODAL_INVALID_PROJECT = 'invalidProjectModal';
const MODAL_CUSTOM_ACCENT = 'customAccentModal';
const MODAL_EDITOR_SETTINGS = 'editorSettingsModal';

const initialState = {
    [MODAL_BACKDROP_LIBRARY]: false,
    [MODAL_COSTUME_LIBRARY]: false,
    [MODAL_EXTENSION_LIBRARY]: false,
    [MODAL_LOADING_PROJECT]: false,
    [MODAL_TELEMETRY]: false,
    [MODAL_SOUND_LIBRARY]: false,
    [MODAL_SPRITE_LIBRARY]: false,
    [MODAL_SOUND_RECORDER]: false,
    [MODAL_CONNECTION]: false,
    [MODAL_TIPS_LIBRARY]: false,
    [MODAL_SETTINGS]: false,
    [MODAL_CUSTOM_EXTENSION]: false,
    [MODAL_EXTENSION_MANAGER]: false,
    [MODAL_RESTORE_POINTS]: false,
    [MODAL_FONTS]: false,
    [MODAL_UNKNOWN_PLATFORM]: false,
    [MODAL_INVALID_PROJECT]: false,
    [MODAL_CUSTOM_ACCENT]: false,
    [MODAL_EDITOR_SETTINGS]: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case OPEN_MODAL:
        return Object.assign({}, state, {
            [action.modal]: true
        });
    case CLOSE_MODAL:
        return Object.assign({}, state, {
            [action.modal]: false
        });
    default:
        return state;
    }
};
const openModal = function (modal) {
    return {
        type: OPEN_MODAL,
        modal: modal
    };
};
const closeModal = function (modal) {
    return {
        type: CLOSE_MODAL,
        modal: modal
    };
};
const openBackdropLibrary = function () {
    return openModal(MODAL_BACKDROP_LIBRARY);
};
const openCostumeLibrary = function () {
    return openModal(MODAL_COSTUME_LIBRARY);
};
const openExtensionLibrary = function () {
    return openModal(MODAL_EXTENSION_LIBRARY);
};
const openLoadingProject = function () {
    return openModal(MODAL_LOADING_PROJECT);
};
const openTelemetryModal = function () {
    return openModal(MODAL_TELEMETRY);
};
const openSoundLibrary = function () {
    return openModal(MODAL_SOUND_LIBRARY);
};
const openSpriteLibrary = function () {
    return openModal(MODAL_SPRITE_LIBRARY);
};
const openSoundRecorder = function () {
    return openModal(MODAL_SOUND_RECORDER);
};
const openConnectionModal = function () {
    return openModal(MODAL_CONNECTION);
};
const openTipsLibrary = function () {
    return openModal(MODAL_TIPS_LIBRARY);
};
const openSettingsModal = function () {
    return openModal(MODAL_SETTINGS);
};
const openCustomExtensionModal = function () {
    return openModal(MODAL_CUSTOM_EXTENSION);
};
const openExtensionManagerModal = function () {
    return openModal(MODAL_EXTENSION_MANAGER);
};
const openRestorePointModal = function () {
    return openModal(MODAL_RESTORE_POINTS);
};
const openFontsModal = function () {
    return openModal(MODAL_FONTS);
};
const openUnknownPlatformModal = function () {
    return openModal(MODAL_UNKNOWN_PLATFORM);
};
const openInvalidProjectModal = function () {
    return openModal(MODAL_INVALID_PROJECT);
};
const openCustomAccentModal = function () {
    return openModal(MODAL_CUSTOM_ACCENT);
};
const openEditorSettingsModal = function () {
    return openModal(MODAL_EDITOR_SETTINGS);
};
const closeBackdropLibrary = function () {
    return closeModal(MODAL_BACKDROP_LIBRARY);
};
const closeCostumeLibrary = function () {
    return closeModal(MODAL_COSTUME_LIBRARY);
};
const closeExtensionLibrary = function () {
    return closeModal(MODAL_EXTENSION_LIBRARY);
};
const closeLoadingProject = function () {
    return closeModal(MODAL_LOADING_PROJECT);
};
const closeTelemetryModal = function () {
    return closeModal(MODAL_TELEMETRY);
};
const closeSpriteLibrary = function () {
    return closeModal(MODAL_SPRITE_LIBRARY);
};
const closeSoundLibrary = function () {
    return closeModal(MODAL_SOUND_LIBRARY);
};
const closeSoundRecorder = function () {
    return closeModal(MODAL_SOUND_RECORDER);
};
const closeTipsLibrary = function () {
    return closeModal(MODAL_TIPS_LIBRARY);
};
const closeConnectionModal = function () {
    return closeModal(MODAL_CONNECTION);
};
const closeSettingsModal = function () {
    return closeModal(MODAL_SETTINGS);
};
const closeCustomExtensionModal = function () {
    return closeModal(MODAL_CUSTOM_EXTENSION);
};
const closeExtensionManagerModal = function () {
    return closeModal(MODAL_EXTENSION_MANAGER);
};
const closeRestorePointModal = function () {
    return closeModal(MODAL_RESTORE_POINTS);
};
const closeFontsModal = function () {
    return closeModal(MODAL_FONTS);
};
const closeUnknownPlatformModal = function () {
    return closeModal(MODAL_UNKNOWN_PLATFORM);
};
const closeInvalidProjectModal = function () {
    return closeModal(MODAL_INVALID_PROJECT);
};
const closeCustomAccentModal = function () {
    return closeModal(MODAL_CUSTOM_ACCENT);
};
const closeEditorSettingsModal = function () {
    return closeModal(MODAL_EDITOR_SETTINGS);
};
export {
    reducer as default,
    initialState as modalsInitialState,
    openBackdropLibrary,
    openCostumeLibrary,
    openExtensionLibrary,
    openLoadingProject,
    openSoundLibrary,
    openSpriteLibrary,
    openSoundRecorder,
    openTelemetryModal,
    openTipsLibrary,
    openConnectionModal,
    openSettingsModal,
    openCustomExtensionModal,
    openExtensionManagerModal,
    openRestorePointModal,
    openFontsModal,
    openUnknownPlatformModal,
    openInvalidProjectModal,
    openCustomAccentModal,
    openEditorSettingsModal,
    closeBackdropLibrary,
    closeCostumeLibrary,
    closeExtensionLibrary,
    closeLoadingProject,
    closeSpriteLibrary,
    closeSoundLibrary,
    closeSoundRecorder,
    closeTelemetryModal,
    closeTipsLibrary,
    closeConnectionModal,
    closeSettingsModal,
    closeCustomExtensionModal,
    closeExtensionManagerModal,
    closeRestorePointModal,
    closeFontsModal,
    closeUnknownPlatformModal,
    closeInvalidProjectModal,
    closeCustomAccentModal,
    closeEditorSettingsModal
};
