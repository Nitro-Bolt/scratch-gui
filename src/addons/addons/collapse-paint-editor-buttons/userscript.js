export default async function({ addon }) {
    // const Blockly = await addon.tab.traps.getBlockly();
    const vm = addon.tab.traps.vm;

    let paintEditorContainer, paintEditorContainerTop;

    const symbols = {
        "down": "v",
        "up": "ʌ",
        "false": "v",
        "true": "ʌ"
    };

    let collapseStatuses = {
        "options": false,
    };

    function createButton(title, innerhtml, onClick, id) {
        const button = document.createElement("button");
        button.innerHTML = innerhtml;
        button.title = title;
        if (id) button.id = id;
        button.addEventListener("click", onClick);
        return button;
    };

    const collapseOptionsButton = createButton("", symbols["up"], () => {collapseFunc("options")}, "sa-collapse-options");

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "4px";
    container.appendChild(collapseOptionsButton);

    addon.tab.displayNoneWhileDisabled(container, {
        display: "flex",
    });

    function collapseFunc(type) {
        let status = collapseStatuses[type];
        let button = document.querySelector(`button#sa-collapse-${type}`);
        if (button) {
            collapseStatuses[type] = !status;
            button.innerHTML = symbols[String(!!status)]
            if (!!status) {
                let paintEditorRows = paintEditorContainerTop.querySelectorAll('[class^="paint-editor_row_"]')
                for (const row of paintEditorRows) {
                    row.style.display = "none";
                }
            } else {
                let paintEditorRows = paintEditorContainerTop.querySelectorAll('[class^="paint-editor_row_"]')
                for (const row of paintEditorRows) {
                    row.style.display = "";
                }
            }
        } else {
            console.warn("Button with specified type: ", type, " was not found.")
        }
    }

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    let previousCollapseOptions = null;

    const CollapseOptionsUnsubscribe = ReduxStore.subscribe(() => {
        if (paintEditorContainerTop) {
            const state = ReduxStore.getState();
            const newCollapseOptions = paintEditorContainerTop.contains(container);

            if (!newCollapseOptions) {
                let paintEditorRows = paintEditorContainerTop.querySelectorAll('[class^="paint-editor_row_"]')
                for (const row of paintEditorRows) {
                    insertAfter(row, container)
                    break;
                }
            } else {
                // nothing
            }
            previousCollapseOptions = newCollapseOptions;
        }
    });

    while (true) {
        await addon.tab.waitForElement("div[class^='paint-editor_editor-container_']", {
            markAsSeen: true,
            reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
            reduxCondition: (state) => state.scratchGui.editorTab.activeTabIndex == 1,
        });

        paintEditorContainer = document.querySelector('[class^="paint-editor_editor-container_"]');

        if (paintEditorContainer) {
            paintEditorContainerTop = document.querySelector('[class^="paint-editor_editor-container-top_"]');
            if (paintEditorContainerTop) {
                let paintEditorRow = paintEditorContainerTop.querySelector('[class^="paint-editor_row_"]') // test
                for (const row of paintEditorRows) {
                    insertAfter(row, container)
                    break;
                }
            }
        } else {
            console.warn("paintEditorContainer not found!")
        }
    }
}