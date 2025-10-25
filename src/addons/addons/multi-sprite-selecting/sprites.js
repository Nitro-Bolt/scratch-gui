export default class Sprites {
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
}