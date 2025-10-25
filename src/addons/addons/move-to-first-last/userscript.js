export default async ({ addon, console, msg }) => {
  const types = ["sprite"];

  addon.tab.createEditorContextMenu(
    (ctx) => {
      const target = addon.tab.traps.vm.editingTarget;
      addon.tab.traps.vm.reorderTarget(ctx.index, 0);
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
        const target = addon.tab.traps.vm.editingTarget;
        return ctx.index !== 0
      },
    }
  );
  addon.tab.createEditorContextMenu(
    (ctx) => {
      const target = addon.tab.traps.vm.editingTarget;
      addon.tab.traps.vm.reorderTarget(target.order, Infinity);
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
        const target = addon.tab.traps.vm.editingTarget;
        const targets = addon.tab.traps.vm.runtime.targets;
        const filteredTargets = [];
        for (let i = 0; i < targets.length; i++) {
            if (targets[i].isOriginal && !targets[i].isStage) {
                filteredTargets.push(targets[i])
            }
        }
        return ctx.index !== filteredTargets.length - 1
      },
    }
  );
};
