import CalendarComponent from "./calendar_component.js";
/**
 * CalendarView extends HTMLElement and is a web component for a calendar.
 * It loads HTML content dynamically and initializes a CalendarComponent for interactive use.
 */

class CalendarView extends HTMLElement {
  /**
   * Constructs an instance of CalendarView, setting up the shadow DOM and loading HTML content.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    fetch("./modules/journal/calendar.html")
      .then((x) => x.text())
      .then((x) => {
        this.shadowRoot.innerHTML = x;
        console.log(x);
        this.init();
      });
  }
  /**
   * Initializes the calendar view by setting up the calendar component and its interactions.
   */
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
      (date) => {
        this.onDatePicked(date);
      }
    );
    calendarCom.initialize();
  }
}

customElements.define("calendar-component", CalendarView);
