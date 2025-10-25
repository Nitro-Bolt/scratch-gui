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
      condition: (ctx) => ctx.index !== 0,
    }
  );
  addon.tab.createEditorContextMenu(
    (ctx) => {
      const target = addon.tab.traps.vm.editingTarget;
      addon.tab.traps.vm.reorderTarget(ctx.index, Infinity);
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
      condition: (ctx) => ctx.index !== ctx.target.parentNode.parentNode.childElementCount - 1,
    }
  );
};
