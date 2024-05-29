import CalendarComponent from "./calendar_component.js";

class CalendarView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        fetch('./modules/journal/calendar.html').then(x => x.text()).then(x => {
            this.shadowRoot.innerHTML = x;
            console.log(x);
            this.init();
        })
    }

    init() {
        const curMonth = this.shadowRoot.getElementById("cur_month");
        const calendarDays = this.shadowRoot.getElementById("calendar_days");
        const preMonth = this.shadowRoot.getElementById("prev_month");
        const nextMonth = this.shadowRoot.getElementById("next_month");

        const calendarCom = new CalendarComponent(
            curMonth,
            calendarDays,
            preMonth,
            nextMonth,     
            (date) => {this.onDatePicked(date);}
        );
        calendarCom.initialize();
    }
}

customElements.define('calendar-component', CalendarView);