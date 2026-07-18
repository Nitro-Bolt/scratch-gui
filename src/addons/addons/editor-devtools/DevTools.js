// import ShowBroadcast from "./show-broadcast.js";
import DomHelpers from "./DomHelpers.js";
import UndoGroup from "./UndoGroup.js";

export default class DevTools {
  constructor(addon, msg, m) {
    this.addon = addon;
    this.msg = msg;
    this.m = m;
    /**
     * @type {VirtualMachine}
     */
    this.domHelpers = new DomHelpers(addon);

    this.codeTab = null;
    this.costTab = null;
    this.costTabBody = null;
    this.selVarID = null;
    this.canShare = false;

    this.mouseXY = { x: 0, y: 0 };
  }

  async init() {
    this.addContextMenus();
    while (true) {
      const root = await this.addon.tab.waitForElement("ul[class*=gui_tab-list_]", {
        markAsSeen: true,
        reduxEvents: [
          "scratch-gui/mode/SET_PLAYER",
          "fontsLoaded/SET_FONTS_LOADED",
          "scratch-gui/locales/SELECT_LOCALE",
        ],
        reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
      });
      this.initInner(root);
    }
  }

  getWorkspace() {
    return Blockly.getMainWorkspace();
  }

  isCostumeEditor() {
    return this.costTab.className.indexOf("gui_is-selected") >= 0;
  }


  /**
   * Returns a Set of the top blocks in this workspace / sprite
   * @returns {Set<any>} Set of top blocks
   */
  getTopBlockIDs() {
    let wksp = this.getWorkspace();
    let topBlocks = wksp.getTopBlocks();
    let ids = new Set();
    for (const block of topBlocks) {
      ids.add(block.id);
    }
    return ids;
  }

  /**
   * Initiates a drag event for all block stacks except those in the set of ids.
   * But why? - Because we know all the ids of the existing stacks before we paste / duplicate - so we can find the
   * new stack by excluding all the known ones.
   * @param ids Set of previously known ids
   */
  beginDragOfNewBlocksNotInIDs(ids) {
    if (!this.addon.settings.get("enablePasteBlocksAtMouse")) {
      return;
    }
    let wksp = this.getWorkspace();
    let topBlocks = wksp.getTopBlocks();
    for (const block of topBlocks) {
      if (!ids.has(block.id)) {
        // console.log("I found a new block!!! - " + block.id);
        // todo: move the block to the mouse pointer?
        let mouseXYClone = { x: this.mouseXY.x, y: this.mouseXY.y };
        block.setIntersects(true); // fixes offscreen block pasting in TurboWarp
        this.domHelpers.triggerDragAndDrop(block.svgPath_, null, mouseXYClone);
      }
    }
  }

  updateMousePosition(e) {
    this.mouseXY.x = e.clientX;
    this.mouseXY.y = e.clientY;
  }

  eventMouseMove(e) {
    this.updateMousePosition(e);
  }

  eventKeyDown(e) {
    const switchCostume = (up) => {
      // todo: select previous costume
      let selected = this.costTabBody.querySelector("div[class*='sprite-selector-item_is-selected']");
      let node = up ? selected.parentNode.previousSibling : selected.parentNode.nextSibling;
      if (node) {
        let wrapper = node.closest("div[class*=gui_flex-wrapper]");
        node.querySelector("div[class^='sprite-selector-item_sprite-name']").click();
        node.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "start",
        });
        wrapper.scrollTop = 0;
      }
    };

    if (document.URL.indexOf("editor") <= 0) {
      return;
    }

    let ctrlKey = e.ctrlKey || e.metaKey;

    if (e.key === "ArrowLeft" && ctrlKey) {
      // Ctrl + Left Arrow Key
      if (document.activeElement.tagName === "INPUT") {
        return;
      }

      if (this.isCostumeEditor()) {
        switchCostume(true);
        e.cancelBubble = true;
        e.preventDefault();
        return true;
      }
    }

    if (e.key === "ArrowRight" && ctrlKey) {
      // Ctrl + Right Arrow Key
      if (document.activeElement.tagName === "INPUT") {
        return;
      }

      if (this.isCostumeEditor()) {
        switchCostume(false);
        e.cancelBubble = true;
        e.preventDefault();
        return true;
      }
    }

    if (e.keyCode === 86 && ctrlKey && !e.griff) {
      // Ctrl + V
      // Set a timeout so we can take control of the paste after the event
      let ids = this.getTopBlockIDs();
      setTimeout(() => {
        this.beginDragOfNewBlocksNotInIDs(ids);
      }, 10);
    }

    // if (e.keyCode === 220 && (!document.activeElement || document.activeElement.tagName === 'INPUT')) {
    //
    // }
  }

  eventCopyClick(block, blockOnly) {
    let wksp = this.getWorkspace();

    if (block) {
      block.select();
      let next = blockOnly ? block.getNextBlock() : null;
      if (next) {
        next.unplug(false); // setParent(null);
      }

      // separate child temporarily
      document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 67, ctrlKey: true }));
      if (next || blockOnly === 2) {
        setTimeout(() => {
          if (next) {
            wksp.undo(); // undo the unplug above...
          }
          if (blockOnly === 2) {
            UndoGroup.startUndoGroup(wksp);
            block.dispose(true);
            UndoGroup.endUndoGroup(wksp);
          }
        }, 0);
      }
    }
  }

  eventMouseDown(e) {
    this.updateMousePosition(e);
  }

  eventMouseUp(e) {
    this.updateMousePosition(e);
  }

  initInner(root) {
    let guiTabs = root.childNodes;

    if (this.codeTab && guiTabs[0] !== this.codeTab) {
      // We have been CHANGED!!! - Happens when going to project page, and then back inside again!!!
      this.domHelpers.unbindAllEvents();
    }

    this.codeTab = guiTabs[0];
    this.costTab = guiTabs[1];
    this.costTabBody = document.querySelector("div[aria-labelledby=" + this.costTab.id + "]");

    this.domHelpers.bindOnce(document, "keydown", (...e) => this.eventKeyDown(...e), true);
    this.domHelpers.bindOnce(document, "mousemove", (...e) => this.eventMouseMove(...e), true);
    this.domHelpers.bindOnce(document, "mousedown", (...e) => this.eventMouseDown(...e), true); // true to capture all mouse downs 'before' the dom events handle them
    this.domHelpers.bindOnce(document, "mouseup", (...e) => this.eventMouseUp(...e), true);
  }
}

class Col {
  /**
   * @param x {Number} x position (for ordering)
   * @param count {Number}
   * @param blocks {[Block]}
   */
  constructor(x, count, blocks) {
    /**
     * x position (for ordering)
     * @type {Number}
     */
    this.x = x;
    /**
     * @type {Number}
     */
    this.count = count;
    /**
     * @type {[Blockly.Block]}
     */
    this.blocks = blocks;
  }
}
