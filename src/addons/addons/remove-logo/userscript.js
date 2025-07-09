export default async function ({ addon, console, msg }) {
    let logo;
    
    function toggleLogo(toggle) {
        if (logo) {
            logo.style.display = toggle ? "none" : ""
        } else {
            console.warn("logo not found.");
        }
    }
    function addLogo() {
        toggleLogo(false)
    }

    function removeLogo() {
        toggleLogo(true)
    }

    while (true) {
        // console.log("remove logo addon activated");
        logo = await addon.tab.waitForElement("[class^=\"menu-bar_scratch-logo\"]", {
            markAsSeen: true,
            reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
            reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
        });
        addon.settings.addEventListener("change", removeLogo);
        addon.self.addEventListener("disabled", addLogo);
        addon.self.addEventListener("reenabled", removeLogo);
        removeLogo()
        // console.log(document.querySelector("[class^=\"menu-bar_scratch-logo\"]"));
    }
}