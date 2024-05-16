import CalendarComponent from "./calendar_component.js";

class JournalView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    fetch("./modules/journal/date_switch.html")
      .then((x) => x.text())
      .then((x) => {
        this.shadowRoot.innerHTML = x;
      });
  }
}

customElements.define("date-switch", JournalView);

// Get references to DOM elements
const prevDateBtn = document.getElementById("prev-date-btn");
const openCalendarBtn = document.getElementById("open-calendar-btn");
const nextDateBtn = document.getElementById("next-date-btn");
const markdownEditor = document.getElementById("markdown-editor");
const calendarTab = document.getElementById("calendar-tab");
const calendar = document.getElementById("calendar");
const curMonth = document.getElementById("cur_month");
const calendarDays = document.getElementById("calendar_days");
const preMonth = document.getElementById("prev_month");
const nextMonth = document.getElementById("next_month");

const onDatePicked = (date) => {
  console.log(date);
};

const calendarCom = new CalendarComponent(
  curMonth,
  calendarDays,
  preMonth,
  nextMonth,
  onDatePicked
);
calendarCom.initialize();

// Initialize current date
let currentDate = new Date();

// Set current date in the "Open Calendar" button
openCalendarBtn.textContent = currentDate.toDateString();

// Event listeners
prevDateBtn.addEventListener("click", prevDate);
openCalendarBtn.addEventListener("click", openCalendar);
nextDateBtn.addEventListener("click", nextDate);

// Functions
function prevDate() {
  currentDate.setDate(currentDate.getDate() - 1);
  updateCalendar();
}

function openCalendar() {
  calendarTab.classList.toggle("tab-hidden");
  console.log("123");
}

function nextDate() {
  currentDate.setDate(currentDate.getDate() + 1);
  updateCalendar();
}

function updateCalendar() {
  openCalendarBtn.textContent = currentDate.toDateString();
  // Call set_calendar_date method of CalendarComponent
  calendar.set_calendar_date(currentDate);
}
