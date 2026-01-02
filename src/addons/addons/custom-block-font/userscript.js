export default async function ({ addon, global, console }) {
    addon.settings.addEventListener("change", changeFont);
    addon.self.addEventListener("disabled", disableFont);
    addon.self.addEventListener("reenabled", changeFont);
    
    async function disableFont() {
        document.querySelectorAll(".customFontForBlocks").forEach(function (el) {
            el.remove();
        });
    }
    
    async function changeFont() {
        disableFont()

        const font = addon.settings.get("blockFont");
        var style = document.createElement("style");
        style.className = "customFontForBlocks";
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=${font
                .replaceAll(")", "")
                .replaceAll("'", "")
                .replaceAll("}", "")
                .replaceAll(" ", "+")}:wght@200;300;400;500;600;700&display=swap');
            
            .goog-menuitem-content,
            .blocklyText {
                font-family: '${font
                    .replaceAll("\\", "")
                    .replaceAll("'", "")
                    .replaceAll("}", "")}', sans-serif;
            }
        `;
        document.body.appendChild(style);
    }

    changeFont()
}