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
        //console.log(x);
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
    const prevSvg = this.shadowRoot.getElementById("prev_svg");
    const nextSvg = this.shadowRoot.getElementById("next_svg");
    //console.log(prevSvg)
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    //console.log(accentColor)
    if (accentColor === '#8B4513') {
      prevSvg.src = "./modules/journal/white_next.svg";
      nextSvg.src = "./modules/journal/white_next.svg";
    }
    if (accentColor === '#FFA800') {
      prevSvg.src = "./modules/journal/next.svg";
      nextSvg.src = "./modules/journal/next.svg";
    }
    if (accentColor === '#606060') {
      prevSvg.src = "./modules/journal/dark_next.svg";
      nextSvg.src = "./modules/journal/dark_next.svg";
    }
    if (accentColor === '#5E94FF') {
      prevSvg.src = "./modules/journal/blue_next.svg";
      nextSvg.src = "./modules/journal/blue_next.svg";
    }
    if (accentColor === '#b86fdc') {
      prevSvg.src = "./modules/journal/purple_next.svg";
      nextSvg.src = "./modules/journal/purple_next.svg";
    }
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
