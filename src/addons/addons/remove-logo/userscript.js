export default async function ({ addon, console, msg }) {
    let logo;
    async function Logo(toggle) {
        await addon.tab.waitForElement("img[class^='menu-bar_scratch-logo']", {
            markAsSeen: true,
            reduxEvents: ["scratch-gui/mode/SET_PLAYER", "fontsLoaded/SET_FONTS_LOADED", "scratch-gui/locales/SELECT_LOCALE"],
            reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
        });
        logo = document.querySelector("img[class^='menu-bar_scratch-logo']");
        if (logo) {
            logo.style.display = toggle ? "none" : ""
        } else {
            console.warn("logo not found.");
        }
    }

    async function addLogo() {
        Logo(false)
    }

    async function removeLogo() {
        Logo(true)
    }
    
    addon.settings.addEventListener("change", removeLogo);
    addon.self.addEventListener("disabled", addLogo);
    addon.self.addEventListener("reenabled", removeLogo);

    removeLogo()
}