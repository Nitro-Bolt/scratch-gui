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
      condition: () => target.order !== 0,
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
      condition: () => target.order !== targets.length - 1,
    }
  );
};
