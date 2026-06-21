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

    function createContainerTemplate() {
        const collapseOptionsButton = createButton("", symbols["up"], () => {collapseFunc("options")}, "sa-collapse-options");

        const e = document.createElement("div");
        e.style.display = "flex";
        e.style.gap = "4px";
        e.appendChild(collapseOptionsButton);
        e.id = "sa-collapse-container";

        addon.tab.displayNoneWhileDisabled(e, {
            display: "flex",
        });

        return e;
    };

    // const collapseOptionsButton = createButton("", symbols["up"], () => {collapseFunc("options")}, "sa-collapse-options");

    let container = createContainerTemplate();

    function collapseFunc(type) {
        let status = collapseStatuses[type];
        let button = document.querySelector(`button#sa-collapse-${type}`);
        if (button) {
            collapseStatuses[type] = !status;
            button.innerHTML = symbols[String(!!status)]
            if (!!status) {
                let paintEditorRows = paintEditorContainerTop.childNodes
                for (const row of paintEditorRows) {
                    row.style.display = "none";
                }
            } else {
                let paintEditorRows = paintEditorContainerTop.childNodes
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
            const newCollapseOptions = paintEditorContainerTop.querySelector('div#sa-collapse-container');

            if (!newCollapseOptions) {
                container = createContainerTemplate();

                let paintEditorRows = paintEditorContainerTop.childNodes
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
        await addon.tab.waitForElement("div[class*='paint-editor_editor-container_']", {
            markAsSeen: true,
            reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
            reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
        });

        paintEditorContainer = document.querySelector('[class*="paint-editor_editor-container_"]');

        if (paintEditorContainer) {
            paintEditorContainerTop = document.querySelector('[class*="paint-editor_editor-container-top_"]');
            if (paintEditorContainerTop) {
                let paintEditorRows = paintEditorContainerTop.childNodes
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