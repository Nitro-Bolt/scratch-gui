export default class Sprites {
    constructor(ReduxStore) {
        this.ReduxStore = ReduxStore
    }
    getScratchGui(ReduxStore) {
        return ReduxStore.getState().scratchGui
    }
    getSpriteFromName(targets, name) {
        for (let i = 0; i < targets.length; i++) {
            if (targets[i].isOriginal && !targets[i].isStage && targets[i].sprite.name == name) {
                return targets[i]
            }
        }
        return null
    }
    getSpriteFromIndex(index) {
        let sprites = this.getScratchGui(this.ReduxStore).targets.sprites
        for (let i = 0; i < sprites.length; i++) {
            if (!sprites[i].isStage && sprites[i].order == index) {
                return sprites[i]
            }
        }
        return null
    }
}