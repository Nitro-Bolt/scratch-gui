export default async function ({ addon, console, msg }) {
    let logo;
    console.log("remove logo addon activated"); // debug log
    while (!document.querySelector("[class^=\"menu-bar_scratch-logo\"]")) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    console.log(document.querySelector("[class^=\"menu-bar_scratch-logo\"]"));
    function toggleLogo(toggle) {
        logo = document.querySelector("[class^=\"menu-bar_scratch-logo\"]");
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
    
    //addon.settings.addEventListener("change", removeLogo);
    addon.self.addEventListener("disabled", addLogo);
    addon.self.addEventListener("reenabled", removeLogo);
    removeLogo()
}