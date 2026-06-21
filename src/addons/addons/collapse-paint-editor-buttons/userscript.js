export default async function({ addon }) {
    // const Blockly = await addon.tab.traps.getBlockly();
    const vm = addon.tab.traps.vm;

    let paintEditorContainer, paintEditorContainerTop;
    const symbols = {
        "down": "v",
        "up": "ʌ",
        "true": "v",
        "false": "ʌ"
    };
    let collapseStatuses = {
        "options": true,
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

    const resize = () => window.dispatchEvent(new Event("resize"));

    // const collapseOptionsButton = createButton("", symbols["up"], () => {collapseFunc("options")}, "sa-collapse-options");
    let container = createContainerTemplate();

    function collapseFunc(type, onlyChangeButton = false) {
        let status = collapseStatuses[type];
        let button = document.querySelector(`button#sa-collapse-${type}`);
        if (button) {
            if (!onlyChangeButton) collapseStatuses[type] = !status;
            if (!onlyChangeButton) button.innerHTML = symbols[String(!status)]
            if (!!onlyChangeButton) button.innerHTML = symbols[String(!!status)]
            if (!status && !onlyChangeButton) {
                let paintEditorRows = paintEditorContainerTop.childNodes
                for (const row of paintEditorRows) {
                    if (row.id !== `sa-collapse-container`) {
                        row.style.display = "none";
                    }
                }
            } else {
                let paintEditorRows = paintEditorContainerTop.childNodes
                for (const row of paintEditorRows) {
                    if (row.id !== `sa-collapse-container`) {
                        row.style.display = "";
                    }
                }
            }
            resize();
        } else {
            console.warn("Button with specified type: ", type, " was not found.")
        }
    }

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode/*.nextSibling*/);
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

    let testContainer;
    let alreadyChanged = false;

    while (true) {
        await new Promise(async (r) => {
            while (!testContainer) {
                testContainer = document.querySelector('[class*="paint-editor_editor-container_"]');
                await new Promise(res => setTimeout(res, 50));
            };
            r();
        });
        console.log("element was successfully found. (sa-collapse-paint-editor-button)");

        paintEditorContainer = document.querySelector('[class*="paint-editor_editor-container_"]');
        if (paintEditorContainer) {
            paintEditorContainerTop = document.querySelector('[class*="paint-editor_editor-container-top_"]');
            if (paintEditorContainerTop) {
                let paintEditorRows = paintEditorContainerTop.childNodes
                for (const row of paintEditorRows) {
                    insertAfter(row, container)
                    if (!alreadyChanged) {
                        collapseFunc("options")
                        alreadyChanged = true
                    }
                    collapseFunc("options", true)
                    break;
                }
            }
        } else {
            console.warn("paintEditorContainer not found!")
        };
        await new Promise(async (r) => {
            while (!!testContainer) {
                testContainer = document.querySelector('div#sa-collapse-container');
                await new Promise(res => setTimeout(res, 50));
            };
            r();
        });
    }
}