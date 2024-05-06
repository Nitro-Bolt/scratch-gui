import LazyScratchBlocks from './tw-lazy-scratch-blocks';

/**
 * Implements Scratch.gui API for unsandboxed extensions.
 * @param {any} Scratch window.Scratch, mutated in place.
 */
const implementGuiAPI = Scratch => {
    Scratch.gui = {
        /**
         * Lazily get the internal ScratchBlocks object when it becomes available. It may never be
         * available if, for example, the user never enters the editor.
         *
         * ScratchBlocks becoming available does not necessarily mean the user is in the editor due
         * to getBlocklyEagerly() also existing. It also does not necessarily mean a workspace
         * has been created yet.
         *
         * @returns {Promise<any>} Promise that may eventually resolve to ScratchBlocks
         */
        getBlockly: () => new Promise(resolve => LazyScratchBlocks.onLoaded(resolve)),

        /**
         * Get the internal ScratchBlocks object as soon as possible. This lets you access it even
         * if the user never enters the editor.
         *
         * This method is VERY SLOW and will cause A LOT OF CPU AND NETWORK ACTIVITY because it
         * downloads and evaluates all of scratch-blocks, a multi-megabyte JavaScript bundle.
         *
         * @returns {Promise<any>} Promise that will resolve to ScratchBlocks.
         */
        getBlocklyEagerly: () => LazyScratchBlocks.load()
    };
};

export default implementGuiAPI;
