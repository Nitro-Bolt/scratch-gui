const validateVariableEdit = (ScratchBlocks, vm, variable, options, errors, proposedName) => {
    const id = variable.getId();
    const newLocal = options.scope === 'local';
    const newCloud = options.isCloud;
    const cloudPrefix = ScratchBlocks.Variables.CLOUD_PREFIX;
    let conflictName = proposedName.trim();
    if (conflictName.indexOf(cloudPrefix) === 0) conflictName = conflictName.substring(cloudPrefix.length);
    if (newCloud) conflictName = cloudPrefix + conflictName;

    if (newCloud && newLocal) {
        ScratchBlocks.alert(errors.cloudLocal);
        return false;
    }
    if (newLocal && vm.editingTarget.isStage) {
        ScratchBlocks.alert(errors.stageLocal);
        return false;
    }
    if (newLocal && !variable.isLocal) {
        const conflict = vm.editingTarget.lookupVariableByNameAndType(conflictName, variable.type, true);
        if (conflict && conflict.id !== id) {
            ScratchBlocks.alert(errors.localConflict);
            return false;
        }
        const usedElsewhere = vm.runtime.targets.some(target => target.isOriginal && target !== vm.editingTarget &&
            Object.values(target.blocks._blocks).some(block =>
                Object.values(block.fields || {}).some(field => field.id === id)
            ));
        if (usedElsewhere) {
            ScratchBlocks.alert(errors.usedElsewhere);
            return false;
        }
    }
    if (!newLocal && variable.isLocal) {
        const hasConflict = vm.runtime.targets.some(target => target.isOriginal && target !== vm.editingTarget &&
            target.lookupVariableByNameAndType(conflictName, variable.type, true));
        if (hasConflict) {
            ScratchBlocks.alert(errors.globalConflict);
            return false;
        }
    }
    return true;
};

export default validateVariableEdit;
