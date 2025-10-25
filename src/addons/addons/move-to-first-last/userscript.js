export default async ({ addon, console, msg }) => {
  const types = ["sprite"];

  addon.tab.createEditorContextMenu(
    (ctx) => {
      const target = addon.tab.traps.vm.editingTarget;
      addon.tab.traps.vm.reorderTarget(target.order, 0);
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
      condition: () => {
        const target = addon.tab.traps.vm.editingTarget;
        return target.getLayerOrder() !== 0
      },
    }
  );
  addon.tab.createEditorContextMenu(
    (ctx) => {
      const targets = addon.tab.traps.vm.runtime.targets;
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
      condition: () => {
        const target = addon.tab.traps.vm.editingTarget;
        const targets = addon.tab.traps.vm.runtime.targets;
        return target.getLayerOrder() !== targets.length - 1
      },
    }
  );
};
