export default async ({ addon, console, msg }) => {
  const types = ["costume"];

  addon.tab.createEditorContextMenu(
    (ctx) => {
      const target = addon.tab.traps.vm.editingTarget;
      target.deleteCostume(ctx.index);
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
      label: "merge costume to above",
      condition: (ctx) => ctx.index !== 0,
    }
  );
  addon.tab.createEditorContextMenu(
    (ctx) => {
      const target = addon.tab.traps.vm.editingTarget;
      target.deleteCostume(ctx.index);
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
      label: "merge costume to below",
      condition: (ctx) => ctx.index !== ctx.target.parentNode.parentNode.childElementCount - 1,
    }
  );
};
