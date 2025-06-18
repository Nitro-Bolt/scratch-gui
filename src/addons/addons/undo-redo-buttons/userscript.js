import undoSvg from "./undo.svg";
import redoSvg from "./redo.svg";

export default async function ({ addon, msg, console }) {
    let buttonsContainer;
    const ThisBlockly = await addon.tab.traps.getBlockly();

    class BlocklyUtil {
        constructor(blocklyInstance) {
            this.Blockly = blocklyInstance;
        }
        get getBlockly() {
            return this.Blockly;
        }
        get getWorkspace() {
            const blockly = this.getBlockly;
            return blockly.getMainWorkspace();
        }
    }

    const Blockly = new BlocklyUtil(ThisBlockly)

    function createIconButton(title, iconSVG, onClick) {
        const button = document.createElement("button");
        button.innerHTML = iconSVG;
        button.title = title;
        button.className = "sa-buttons-button"
        button.addEventListener("click", onClick);
        return button;
    }

    function createUI(root) {
        buttonsContainer = document.createElement("div");
        buttonsContainer.className = "sa-buttons-container";
        addon.tab.displayNoneWhileDisabled(buttonsContainer, { display: "flex" });
        root.appendChild(buttonsContainer);
    
        let buttonsWrapper = buttonsContainer.appendChild(document.createElement("span"));
        buttonsWrapper.className = "sa-buttons-wrapper";
    
        let buttonsOut = buttonsWrapper.appendChild(document.createElement("label"));
        buttonsOut.className = "sa-buttons-dropdown-out";
    
        let undoButton = createIconButton("undo", undoSvg, () => Blockly.getWorkspace.undo(false));
        let redoButton = createIconButton("redo", redoSvg, () => Blockly.getWorkspace.undo(true));

        buttonsOut.appendChild(undoButton)
        buttonsOut.appendChild(redoButton)
    }

    function tabChanged(node) {
        if (!node) {
            return;
        }
        const tab = addon.tab.redux.state.scratchGui.editorTab.activeTabIndex;
        const visible = tab === 0;
        node.hidden = !visible;
    }

    let previousActiveTabDisabled = null;

    const ActiveTabUnsubscribe = ReduxStore.subscribe(() => {
        const newActiveTabDisabled = addon.tab.redux.state.scratchGui.editorTab.activeTabIndex;
    
        if (previousActiveTabDisabled !== newActiveTabDisabled) {
            tabChanged(buttonsContainer)
        }
        previousActiveTabDisabled = newActiveTabDisabled;
    });
    while (true) {
        const root = await addon.tab.waitForElement("ul[class*=gui_tab-list_]", {
            markAsSeen: true,
            reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
            reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
        });
        createUI(root);
        tabChanged(buttonsContainer);
    }
}
