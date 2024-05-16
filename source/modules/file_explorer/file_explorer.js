import App from "../models/app.js"

class FileExplorerComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        fetch('./modules/file_explorer/file_explorer.html').then(x => x.text()).then(x => {
            this.shadowRoot.innerHTML = x;
            this.init();
        })
    }

    init() {
        const fileEntry = App.get_file_store();
        console.log(fileEntry.root.getChildren());

        const fileElement = this.shadowRoot.getElementById('file');
        const newEle = document.createElement('div');
        newEle.innerText = "I'm file";
        for (fileEntry in getChildren()) {
        fileElement.appendChild(convertToDOM(fileEntry));
        }
    }
}

customElements.define('file-explorer', FileExplorerComponent);
