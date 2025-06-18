export default async function ({ addon, console, msg }) {
    let logo;
    console.log("remove logo addon activated"); // debug log
    while (!document.querySelector("img[class^='menu-bar_scratch-logo']")) {
        await new Promise(resolve => setTimeout(resolve, 10))
    }
    function Logo(toggle) {
        logo = document.querySelector("img[class^='menu-bar_scratch-logo']");
        if (logo) {
            logo.style.display = toggle ? "none" : ""
        } else {
            console.warn("logo not found.");
        }
    }

    function addLogo() {
        Logo(false)
    }

    function removeLogo() {
        Logo(true)
    }
    
    addon.settings.addEventListener("change", removeLogo);
    addon.self.addEventListener("disabled", addLogo);
    addon.self.addEventListener("reenabled", removeLogo);
    removeLogo()
}