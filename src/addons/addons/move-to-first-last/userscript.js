export default async ({ addon, console, msg }) => {
  const types = ["sprite"];

  function getTrueTargets (targets) {
    const filteredTargets = [];
    for (let i = 0; i < targets.length; i++) {
        if (targets[i].isOriginal && !targets[i].isStage) {
            filteredTargets.push(targets[i])
        }
    }
    return filteredTargets;
  }

  addon.tab.createEditorContextMenu(
    (ctx) => {
      addon.tab.traps.vm.reorderTarget(ctx.index + 1, 0);
      queueMicrotask(() => {
        addon.tab.traps.vm.emitTargetsUpdate();
        addon.tab.traps.vm.runtime.emitProjectChanged();
        ctx.target.click();
      });
    },
    {
      types,
      position: "assetContextMenuAfterExport",
      order: 1,
      label: "move to first",
      condition: (ctx) => {
        return ctx.index !== 0
      },
    }
  );
  addon.tab.createEditorContextMenu(
    (ctx) => {
      addon.tab.traps.vm.reorderTarget(ctx.index + 1, getTrueTargets(addon.tab.traps.vm.runtime.targets).length - 1);
      queueMicrotask(() => {
        addon.tab.traps.vm.emitTargetsUpdate();
        addon.tab.traps.vm.runtime.emitProjectChanged();
        ctx.target.click();
      });
    },
    {
      types,
      position: "assetContextMenuAfterExport",
      order: 2,
      label: "move to last",
      condition: (ctx) => {
        const targets = addon.tab.traps.vm.runtime.targets;
        return ctx.index !== getTrueTargets(targets).length - 1
      },
    }
  );
};
