class JournalView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        fetch('./modules/journal/date_switch.html').then(x => x.text()).then(x => {
            this.shadowRoot.innerHTML = x;
        })
    }
}

customElements.define('date-switch', JournalView);