export default async function ({ addon, msg, console }) {
    let buttonsContainer, undoButton, redoButton;
    const ThisBlockly = await addon.tab.traps.getBlockly();

    const icons = {
        "undoSvg": `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><!-- Generator: Sketch 43.2 (39069) - http://www.bohemiancoding.com/sketch --><title>undo</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="undo" fill="#76fa02"><path d="M15.5581635,12.7700651 L11.8403972,16.4941315 C11.5610922,16.7671364 11.1830854,16.9211391 10.7903784,16.9211391 C10.3990715,16.9211391 10.0210647,16.7671364 9.74035971,16.4941315 L6.02399342,12.7700651 C5.5969858,12.3430574 5.47098355,11.7060461 5.70198767,11.1530362 C5.93299179,10.6000263 6.46500128,10.24302 7.06701202,10.24302 L8.40403587,10.24302 C8.36903525,9.92101423 8.27803362,9.55700774 8.12403088,9.17200087 C8.07573002,9.05999887 8.02602913,8.94799688 7.97002813,8.83599488 C7.89302676,8.70999263 7.90072689,8.67499201 7.79502501,8.52098926 C7.62702201,8.26898476 7.47301926,8.07998139 7.29031601,7.86297752 C6.9200094,7.4639704 6.47200141,7.12096429 5.99599292,6.86895979 C5.5129843,6.6169553 5.00897531,6.46295255 4.56096732,6.37895105 C4.11995945,6.30194968 3.71395221,6.29494955 3.47594796,6.29494955 C3.35694584,6.28794943 3.2029431,6.31594993 3.12594172,6.32295005 C3.04194022,6.32995018 2.99293935,6.3369503 2.99293935,6.3369503 C2.49593048,6.38595117 2.04792249,6.02194468 1.99892162,5.52493582 C1.95692087,5.10492832 2.20192524,4.72692158 2.57293186,4.58691908 C2.57293186,4.58691908 2.62193273,4.56591871 2.6989341,4.53791821 C2.78993573,4.50991771 2.87393723,4.46091684 3.06994072,4.40491584 C3.46194772,4.28591371 3.95895658,4.15991147 4.60996819,4.09691034 C5.25397968,4.04090934 6.03099354,4.05490959 6.85070816,4.22291259 C7.66902276,4.39791571 8.53003812,4.72692158 9.32805235,5.20293007 C9.7060591,5.44793444 10.1120663,5.73493956 10.427072,6.01494456 C10.5670745,6.11994643 10.8050787,6.35795068 10.9450812,6.5049533 C11.1060841,6.67295629 11.2530867,6.84095929 11.4007893,7.01596241 C11.9670994,7.7159749 12.3871069,8.47198839 12.6601118,9.15800062 C12.8211147,9.55000762 12.9331167,9.92101423 13.0171182,10.24302 L14.5151449,10.24302 C15.1171556,10.24302 15.6491651,10.6000263 15.8801692,11.1530362 C16.1111734,11.7060461 15.9851711,12.3430574 15.5581635,12.7700651" id="Fill-1" transform="translate(8.994247, 10.494247) scale(-1, 1) rotate(-45.000000) translate(-8.994247, -10.494247) "></path></g></g></svg>`,
        "redoSvg": `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><!-- Generator: Sketch 43.2 (39069) - http://www.bohemiancoding.com/sketch --><title>redo</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="redo" fill="#76fa02"><path d="M17.5581635,12.7700651 L13.8403972,16.4941315 C13.5610922,16.7671364 13.1830854,16.9211391 12.7903784,16.9211391 C12.3990715,16.9211391 12.0210647,16.7671364 11.7403597,16.4941315 L8.02399342,12.7700651 C7.5969858,12.3430574 7.47098355,11.7060461 7.70198767,11.1530362 C7.93299179,10.6000263 8.46500128,10.24302 9.06701202,10.24302 L10.4040359,10.24302 C10.3690352,9.92101423 10.2780336,9.55700774 10.1240309,9.17200087 C10.07573,9.05999887 10.0260291,8.94799688 9.97002813,8.83599488 C9.89302676,8.70999263 9.90072689,8.67499201 9.79502501,8.52098926 C9.62702201,8.26898476 9.47301926,8.07998139 9.29031601,7.86297752 C8.9200094,7.4639704 8.47200141,7.12096429 7.99599292,6.86895979 C7.5129843,6.6169553 7.00897531,6.46295255 6.56096732,6.37895105 C6.11995945,6.30194968 5.71395221,6.29494955 5.47594796,6.29494955 C5.35694584,6.28794943 5.2029431,6.31594993 5.12594172,6.32295005 C5.04194022,6.32995018 4.99293935,6.3369503 4.99293935,6.3369503 C4.49593048,6.38595117 4.04792249,6.02194468 3.99892162,5.52493582 C3.95692087,5.10492832 4.20192524,4.72692158 4.57293186,4.58691908 C4.57293186,4.58691908 4.62193273,4.56591871 4.6989341,4.53791821 C4.78993573,4.50991771 4.87393723,4.46091684 5.06994072,4.40491584 C5.46194772,4.28591371 5.95895658,4.15991147 6.60996819,4.09691034 C7.25397968,4.04090934 8.03099354,4.05490959 8.85070816,4.22291259 C9.66902276,4.39791571 10.5300381,4.72692158 11.3280524,5.20293007 C11.7060591,5.44793444 12.1120663,5.73493956 12.427072,6.01494456 C12.5670745,6.11994643 12.8050787,6.35795068 12.9450812,6.5049533 C13.1060841,6.67295629 13.2530867,6.84095929 13.4007893,7.01596241 C13.9670994,7.7159749 14.3871069,8.47198839 14.6601118,9.15800062 C14.8211147,9.55000762 14.9331167,9.92101423 15.0171182,10.24302 L16.5151449,10.24302 C17.1171556,10.24302 17.6491651,10.6000263 17.8801692,11.1530362 C18.1111734,11.7060461 17.9851711,12.3430574 17.5581635,12.7700651" id="Fill-1" transform="translate(10.994247, 10.494247) rotate(-45.000000) translate(-10.994247, -10.494247) "></path></g></g></svg>`
    }

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

    function createIconButton(title, iconSVG, onClick, extraClasses = '', attributes = '') {
        const button = document.createElement("button");
        button.innerHTML = iconSVG;
        button.title = title;
        button.className = "sa-buttons-button" + (extraClasses !== '' ? (' ' + extraClasses) : '')
        for (const attribute of attributes) {
            button[attribute["name"]] = attribute["value"]
        }
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
    
        undoButton = createIconButton("Undo", icons["undoSvg"], () => Blockly.getWorkspace.undo(false), 'sa-radio-first', [{ "name": "dir", "value": "ltr" }]);
        redoButton = createIconButton("Redo", icons["redoSvg"], () => Blockly.getWorkspace.undo(true), 'sa-radio-last', [{ "name": "dir", "value": "rtl" }]);

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

    const activeTabUnsubscribe = ReduxStore.subscribe(() => {
        const newActiveTabDisabled = addon.tab.redux.state.scratchGui.editorTab.activeTabIndex;
    
        if (previousActiveTabDisabled !== newActiveTabDisabled) {
            tabChanged(buttonsContainer)
        }
        previousActiveTabDisabled = newActiveTabDisabled;
    });

    let previousUndoStack = null;
    let previousRedoStack = null;
    const stackUnsubscribe = ReduxStore.subscribe(() => {
        const newUndoStack = Blockly.getWorkspace.undoStack_;
        const newRedoStack = Blockly.getWorkspace.redoStack_;
    
        if (previousUndoStack !== newUndoStack) {
            if (!!newUndoStack.length < 1) {
                undoButton.setAttribute("disabled", "");
            } else {
                undoButton.removeAttribute("disabled");
            }
        }
        if (previousRedoStack !== newRedoStack) {
            if (!!newRedoStack.length < 1) {
                redoButton.setAttribute("disabled", "");
            } else {
                redoButton.removeAttribute("disabled");
            }
        }
        previousUndoStack = newUndoStack;
        previousRedoStack = newRedoStack;
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
