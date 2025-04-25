export default async function ({ addon, global, console }) {
    addon.settings.addEventListener("change", changeFont);
    addon.self.addEventListener("disabled", disableFont);
    addon.self.addEventListener("reenabled", changeFont);
    
    async function disableFont() {
        document.querySelectorAll(".customFont").forEach(function (el) {
            el.remove();
        });
        console.log("Font is disabled")
    }
    
    async function changeFont() {
        disableFont()

        const font = addon.settings.get("webFont")
        var style = document.createElement("style");
        style.className = "customFont";
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=${font
                .replaceAll(")", "")
                .replaceAll("'", "")
                .replaceAll("}", "")
                .replaceAll(" ", "+")}:wght@200;300;400;500;600;700&display=swap');

            :not(code) {
                font-family: '${font
                    .replaceAll("\\", "")
                    .replaceAll("'", "")
                    .replaceAll("}", "")}', sans-serif;
            }
        `;
        try {
            document.body.appendChild(style);
            console.log("Appended" + style + "to body")
        } catch (err) {
            console.error(err)
        }
    }
}