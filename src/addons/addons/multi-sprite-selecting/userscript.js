export default async function ({ addon, console, msg }) {
    let spritesContainer;
    let spriteSelectorContainer;
    let spriteWrappers = [];
    let spriteInfoRowTertiary;
    let spriteInfoGroup;
    let spriteDeleteButton;
    let stageSelectorContainer;
    let stageHeaderStageSizeGroup;

    let isSelectingChecked = false;
    let observer;

    const selectedSprites = new Set()

    const vm = addon.tab.traps.vm;

    function createIconButton(title, iconSVG, onClick) {
        const button = document.createElement("button");
        button.innerHTML = iconSVG;
        button.title = title;
        button.className = "sa-sprite-selecting-button"
        button.addEventListener("click", onClick);
        return button;
    }

    // window.getComputedStyle(document.documentElement).getPropertyValue('--ui-black-transparent');

    const icons = {
        "selectAll": `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>`,
        "unselectAll": `<?xml version="1.0" encoding="UTF-8"?><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="2" stroke="#FFFFFF" stroke-width="2" fill="none"/><line x1="6" y1="6" x2="14" y2="14" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="6" x2="6" y2="14" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>`,
        "deleteIcon": `<?xml version="1.0" encoding="UTF-8"?><svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>Delete</title><defs><path d="M4.54751641,6.99994966 L15.4523042,6.99994966 C15.7284466,6.99994966 15.9523042,7.22380729 15.9523042,7.49994966 C15.9523042,7.51506367 15.9516189,7.5301699 15.9502504,7.54522183 L15.1651793,16.1801783 C15.0715275,17.2102489 14.207924,17.9989808 13.1736049,17.9990897 L6.82662224,17.9997575 C5.79213514,17.9998663 4.92828345,17.2110677 4.83462539,16.180829 L4.04956981,7.54521753 C4.02456905,7.27020922 4.22724022,7.02700381 4.50224854,7.00200306 C4.51729904,7.00063483 4.53240384,6.99994966 4.54751641,6.99994966 Z M7.33333333,4 L7.88603796,2.34188612 C7.95409498,2.13771505 8.14516441,2 8.36037961,2 L11.6396204,2 C11.8548356,2 12.045905,2.13771505 12.113962,2.34188612 L12.6666667,4 L16.5,4 C16.7761424,4 17,4.22385763 17,4.5 L17,5.5 C17,5.77614237 16.7761424,6 16.5,6 L3.5,6 C3.22385763,6 3,5.77614237 3,5.5 L3,4.5 C3,4.22385763 3.22385763,4 3.5,4 L7.33333333,4 Z M8.38742589,4 L11.6125741,4 L11.2792408,3 L8.72075922,3 L8.38742589,4 Z M10,11.7204812 L11.5952436,10.1252376 C11.7905057,9.92997548 12.1070882,9.92997548 12.3023504,10.1252376 L12.3747624,10.1976496 C12.5700245,10.3929118 12.5700245,10.7094943 12.3747624,10.9047564 L10.7795188,12.5 L12.3747624,14.0952436 C12.5700245,14.2905057 12.5700245,14.6070882 12.3747624,14.8023504 L12.3023504,14.8747624 C12.1070882,15.0700245 11.7905057,15.0700245 11.5952436,14.8747624 L10,13.2795188 L8.40475641,14.8747624 C8.20949427,15.0700245 7.89291178,15.0700245 7.69764963,14.8747624 L7.62523762,14.8023504 C7.42997548,14.6070882 7.42997548,14.2905057 7.62523762,14.0952436 L9.22048121,12.5 L7.62523762,10.9047564 C7.42997548,10.7094943 7.42997548,10.3929118 7.62523762,10.1976496 L7.69764963,10.1252376 C7.89291178,9.92997548 8.20949427,9.92997548 8.40475641,10.1252376 L10,11.7204812 Z" id="path-1"></path></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><mask id="mask-2" fill="white"><use xlink:href="#path-1"></use></mask><g mask="url(#mask-2)" fill="#FFFFFF"><rect x="0" y="0" width="20" height="20"></rect></g></g></svg>`,
        "duplicateIcon": `<?xml version="1.0" encoding="UTF-8"?><svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="13.125" height="13.125" rx="2.2266" ry="2.2266" style="fill:none;stroke:#ffffff;stroke-linejoin:round;stroke-width:1.25"/><path d="M14.9805,5l.0195-0.9375a2.1875,2.1875,0,0,0-2.1875-2.1875H4.375A2.5,2.5,0,0,0,1.875,5V12.8125A2.1875,2.1875,0,0,0,4.0625,15h0.9375" style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.25"/><line x1="11.5625" y1="8.4375" x2="11.5625" y2="14.6875"style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.25"/><line x1="14.6875" y1="11.5625" x2="8.4375" y2="11.5625"style="fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.25"/></svg>`,
        "exportIcon": `<svg height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="m12 14v-4h2v4c0 1.1045695-.8954305 2-2 2h-10c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2h2v2h-2v10zm-.7142857-8.5h-1.57142859c-.78571428 0-2.35714285 0-4.71428571 2.35714286 0-3.14285715 2.35714286-5.5 4.71428571-5.5h1.57142859v-2.35714286l4.7142857 3.92857143-4.7142857 3.92857143z" fill="#ffffff"/></svg>`
    }

    const selectAllButton = createIconButton("Select All", icons["selectAll"], selectAll);
    const unselectAllButton = createIconButton("Unselect All", icons["unselectAll"], unselectAll);
    const deleteButton = createIconButton("Delete Selected Sprites", icons["deleteIcon"], deleteSelected);
    const duplicateButton = createIconButton("Duplicate Selected Sprites", icons["duplicateIcon"], duplicateSelected);
    // const exportButton = createIconButton("Export Selected Sprites", icons["exportIcon"], exportSelected);

    const selectedCountText = document.createElement("div");
    selectedCountText.className = "sa-sprite-selected-count";

    const container = document.createElement("div");
    container.className = "sa-sprite-selecting-container"
    container.appendChild(selectAllButton);
    container.appendChild(unselectAllButton);
    container.appendChild(deleteButton);
    container.appendChild(duplicateButton);
    // container.appendChild(exportButton);
    container.appendChild(selectedCountText);

    addon.tab.displayNoneWhileDisabled(container, {
        display: "flex",
    });

    const isSelectingLabel = document.createElement("label");
    isSelectingLabel.className = "sa-sprite-info-isselecting-label";
    isSelectingLabel.innerHTML = "<span class=\"sa-label_input-label\"><span style=\"font-size: 10.5px;\">   Is Selecting?   </span></span>"; // The Characters that aren't basic ASCII characters serve as a gap between "draggability" and the "is selecting" label.

    const isSelectingInput = document.createElement("input");
    isSelectingInput.type = "checkbox";
    isSelectingInput.className = "sa-sprite-info-isselecting-input";
    isSelectingInput.style.accentColor = "#80f41a";
    isSelectingInput.style.transform = "translate(0%, 20%)";

    isSelectingInput.addEventListener('click', async (event) => {
        isSelectingChecked = isSelectingInput.checked;
        runIsChecked();
    });

    let isSelectingContainer = document.createElement("div");
    isSelectingContainer.className = "sa-sprite-info-isselecting";

    isSelectingContainer.appendChild(isSelectingLabel);
    isSelectingContainer.appendChild(isSelectingInput);

    addon.tab.displayNoneWhileDisabled(isSelectingContainer, {
        display: "flex",
    });

    function updateButtonsVisibility() {
        const Gui = ReduxStore.getState().scratchGui;
        const sprites = Gui.targets.sprites;
        const empty = Object.keys(sprites).length === 0;
        const state = ReduxStore.getState();
        const newSpriteInfoDisabled = state.scratchGui.spriteInfoDisabled;
        let display;
        if (!!empty || !isSelectingChecked || !!newSpriteInfoDisabled) {
            display = "none";
        } else {
            display = "";
        };
        selectAllButton.style.display = display;
        unselectAllButton.style.display = display;
        deleteButton.style.display = display;
    }

    function updateSelectedText() {
        const state = ReduxStore.getState();
        const newSpriteInfoDisabled = state.scratchGui.spriteInfoDisabled;
        if (!isSelectingChecked || !!newSpriteInfoDisabled) { 
            selectedCountText.textContent = ""; 
            selectedCountText.style.display = "none"; 
        } else {
            const count = selectedSprites.size;
            if (count > 0) {
                selectedCountText.textContent = `${count} Sprite${count === 1 ? '' : 's'} selected`;
                selectedCountText.style.display = "block";
            } else {
                selectedCountText.textContent = "";
                selectedCountText.style.display = "none";
            }
        };
        updateButtonsVisibility();
    }

    function highlightSelected() {
        if (!isSelectingChecked) {
            spriteWrappers = document.querySelectorAll('[class^="sprite-selector_sprite-wrapper"]');

            spriteWrappers.forEach(wrapper => {
                wrapper.style.outline = "";
                delete(wrapper.dataset.spriteId);
                wrapper.removeEventListener("click", handleSpriteClick);
            });
            selectedSprites.clear(); 
        } else {
            spriteWrappers.forEach(wrapper => {
                const spriteId = wrapper.dataset.spriteId;
                if (selectedSprites.has(spriteId)) {
                    wrapper.style.outline = "6px solid blue";
                } else {
                    wrapper.style.outline = "";
                }
            });
        }
        updateButtonsVisibility();
    }

    function selectAll() {
        if (!spritesContainer) return;
        console.log("Selecting all sprites");
        const Gui = ReduxStore.getState().scratchGui;
        const sprites = Gui.targets.sprites;

        selectedSprites.clear();

        for (const targetId in sprites) {
            const sprite = sprites[targetId];
            selectedSprites.add(sprite.id);
        }
        updateSelectedText();
        highlightSelected();
        runIsChecked();
    }

    function unselectAll() {
        if (!spritesContainer) return;
        console.log("Unselecting all sprites");
        selectedSprites.clear();
        updateSelectedText();
        highlightSelected();
        runIsChecked();
    }

    function deleteSelected() {
        if (!spritesContainer) return;
        console.log("Deleting selected sprites");
        const Gui = ReduxStore.getState().scratchGui;
        const sprites = Gui.targets.sprites;
        const selected = [...selectedSprites];

        for (const targetId in sprites) {
            const sprite = sprites[targetId];
            if (selected.includes(sprite.id)) {
                vm.deleteSpriteInternal(sprite.id);
                console.log(`Deleted sprite: ${sprite.name}`);
            }
        }

        selectedSprites.clear();
        updateSelectedText();
        highlightSelected();
        runIsChecked();
    }

    async function duplicateSelected() {
        if (!spritesContainer) return;
        console.log("Duplicating selected sprites");
        const Gui = ReduxStore.getState().scratchGui;
        const sprites = Gui.targets.sprites;
        const selected = [...selectedSprites];

        const spritesToDuplicate = Object.values(sprites).filter(sprite => selected.includes(sprite.id));

        for (const sprite of spritesToDuplicate) {
            await vm.duplicateSprite(sprite.id);
            console.log(`Duplicated sprite: ${sprite.name}`);
        }

        updateSelectedText();
        highlightSelected();
        runIsChecked();
    }

    function exportSelected() {
        if (!spritesContainer) return;
        console.log("Exporting selected sprites");
        const Gui = ReduxStore.getState().scratchGui;
        const sprites = Gui.targets.sprites;
        const selected = [...selectedSprites];

        const spritesToExport = Object.values(sprites).filter(sprite => selected.includes(sprite.id));

        // from "src/lib/download-blob.js"
        function downloadBlob(filename, blob) {
            const downloadLink = document.createElement('a');
            document.body.appendChild(downloadLink);

            // Use special ms version if available to get it working on Edge.
            if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(blob, filename);
                return;
            }

            if ('download' in HTMLAnchorElement.prototype) {
                const url = window.URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = filename;
                downloadLink.type = blob.type;
                downloadLink.click();
                // remove the link after a timeout to prevent a crash on iOS 13 Safari
                window.setTimeout(() => {
                    document.body.removeChild(downloadLink);
                    window.URL.revokeObjectURL(url);
                }, 1000);
            } else {
                // iOS 12 Safari, open a new page and set href to data-uri
                let popup = window.open('', '_blank');
                const reader = new FileReader();
                reader.onloadend = function () {
                    popup.location.href = reader.result;
                    popup = null;
                };
                reader.readAsDataURL(blob);
            }
        }
        for (const sprite of spritesToExport) {
            vm.exportSprite(sprite.id)
                .then(content => {
                    downloadBlob(`${sprite.name}.pms`, content);
                    console.log(`Exported sprite: ${sprite.name}`);
                })
                .catch(err => {
                    console.error(`Failed to export ${sprite.name}:`, err);
                });
        }
        updateSelectedText();
        highlightSelected();
        runIsChecked();
    }

    let previousStageSize = null;

    const StageSizeUnsubscribe = ReduxStore.subscribe(() => {
        const state = ReduxStore.getState();
        const newStageSize = state.scratchGui.stageSize.stageSize;

        if (previousStageSize === 'small' && newStageSize === 'large' || previousStageSize === 'none' && newStageSize === 'large') {
            runIsChecked();
            const spriteInfoRowTertiary = document.querySelector('[class*="sprite-info_row-tertiary"]');
            const spritesContainer = document.querySelector('[class^="sprite-selector_items-wrapper"]');

            console.log("spriteInfoRowTertiary:", spriteInfoRowTertiary);
            console.log("spritesContainer:", spritesContainer);
            if (!spriteInfoRowTertiary || !spritesContainer) return;

            const spriteInfoGroup = spriteInfoRowTertiary.querySelector('[class^="sprite-info_group"]');
            console.log("spriteInfoGroup:", spriteInfoGroup);
            if (!spriteInfoGroup) return;

            // Redefine IsSelectingContainer
            if (!isSelectingContainer) {
                isSelectingContainer = document.createElement("div");
                isSelectingContainer.className = "sa-sprite-info-isselecting";

                isSelectingContainer.appendChild(isSelectingLabel);
                isSelectingContainer.appendChild(isSelectingInput);
            }

            if (isSelectingContainer.parentNode) {
                isSelectingContainer.parentNode.removeChild(isSelectingContainer);
            }

            console.log("isSelectingContainer:", isSelectingContainer);
            if (!isSelectingContainer) return;

            spriteInfoGroup.insertBefore(isSelectingContainer, null);
        }
        previousStageSize = newStageSize;
    });

    let previousSpriteInfoDisabled = null;

    const SpriteInfoUnsubscribe = ReduxStore.subscribe(() => {
        const state = ReduxStore.getState();
        const newSpriteInfoDisabled = state.scratchGui.spriteInfoDisabled;

        if (!!newSpriteInfoDisabled) {
            isSelectingContainer.style.display = "none"
        } else {
            isSelectingContainer.style.display = ""
        }
        previousSpriteInfoDisabled = newSpriteInfoDisabled;
    });

    async function runIsChecked() {
        if (!!isSelectingChecked) {
            updateSelectedText();
            highlightSelected();
            updateButtonsVisibility();
            enableSelecting();
            console.log('Checkbox is checked!');
        } else {
            disableSelecting();
            updateSelectedText();
            highlightSelected();
            updateButtonsVisibility();
            console.log('Checkbox is unchecked!');
        }
    }

    function bindClickHandlers() {
        spriteWrappers = document.querySelectorAll('[class^="sprite-selector_sprite-wrapper"]');
        const sprites = ReduxStore.getState().scratchGui.targets.sprites;

        spriteWrappers.forEach((wrapper, index) => {
            const spriteArray = Object.values(sprites).sort((a, b) => a.order - b.order);
            const sprite = spriteArray[index];
            if (!sprite) return;

            wrapper.dataset.spriteId = sprite.id;
            wrapper.removeEventListener("click", handleSpriteClick);
            wrapper.addEventListener("click", handleSpriteClick);
        });
        highlightSelected();
    }

    function handleSpriteClick(e) {
        const wrapper = e.currentTarget;
        const order = parseInt(window.getComputedStyle(wrapper).order, 10);
        if (isNaN(order)) return;

        const Gui = ReduxStore.getState().scratchGui;
        const sprites = Gui.targets.sprites;

        for (const target in sprites) {
            const sprite = sprites[target];
            if (sprite.order === order) {
                if (selectedSprites.has(sprite.id)) {
                    selectedSprites.delete(sprite.id);
                    console.log(`Unselected sprite: ${sprite.name}`);
                } else {
                    selectedSprites.add(sprite.id);
                    console.log(`Selected sprite: ${sprite.name}`);
                }
            }
        }
        updateSelectedText();
        highlightSelected();
        runIsChecked();
    }

    let HasWaitedForElement = false;

    async function enableSelecting() {
        console.log("enableSelecting() called");

        if (!HasWaitedForElement) {
            await addon.tab.waitForElement("div[class^='sprite-selector_items-wrapper']", {
                markAsSeen: true,
                reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
                reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
            });
            HasWaitedForElement = true;
        }
        console.log("enableSelecting() waited for element");

        spritesContainer = document.querySelector('[class^="sprite-selector_items-wrapper"]');
        spriteSelectorContainer = document.querySelector('[class^="sprite-selector_scroll-wrapper"]');
        spriteDeleteButton = document.querySelector('[class^="delete-button_delete-button"]');
        stageSelectorContainer = document.querySelector('[class^="stage-selector_stage-selector"]');
        stageHeaderStageSizeGroup = document.querySelector('[class^="stage-header_stage-size-toggle-group"]');

        spriteSelectorContainer.insertBefore(container, spritesContainer);
        console.log("inserted container before sprites container");

        if (observer) observer.disconnect();
        console.log("disconnected observer if it exists");

        observer = new MutationObserver(() => {
            updateButtonsVisibility();
            bindClickHandlers();
        });

        observer.observe(spritesContainer, { childList: true, subtree: true });

        if (spriteDeleteButton) {
            spriteDeleteButton.style.display = "none";
        }
        if (stageSelectorContainer) {
            stageSelectorContainer.style.display = "none";
        }
        if (stageHeaderStageSizeGroup) {
            stageHeaderStageSizeGroup.style.display = "none";
        }

        bindClickHandlers();
        updateButtonsVisibility();
    }

    function disableSelecting() {
        selectedSprites.clear();
        updateSelectedText();
        highlightSelected();

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        if (spriteDeleteButton) {
            spriteDeleteButton.style.display = "";
        }
        if (stageSelectorContainer) {
            stageSelectorContainer.style.display = "";
        }
        if (stageHeaderStageSizeGroup) {
            stageHeaderStageSizeGroup.style.display = "";
        }

        if (spriteSelectorContainer.contains(container)) {
            spriteSelectorContainer.removeChild(container);
        }
    }
    while (true) {
        await addon.tab.waitForElement("div[class*='sprite-info_row-tertiary']", {
            markAsSeen: true,
            reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
            reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
        });

        spriteInfoRowTertiary = document.querySelector('[class*="sprite-info_row-tertiary"]');
        spriteInfoGroup = spriteInfoRowTertiary.querySelector('[class^="sprite-info_group"]');

        if (!spriteInfoGroup.contains(isSelectingContainer)) {
            spriteInfoGroup.insertBefore(isSelectingContainer, null);
        }
    }
}