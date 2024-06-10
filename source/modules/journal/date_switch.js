class JournalView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    fetch("modules/journal/date_switch.html")
      .then((x) => x.text())
      .then((x) => {
        this.shadowRoot.innerHTML = x;
        this.init();
      });
  }
  init() {
    // Get references to DOM elements
    const prevDateBtn = this.shadowRoot.getElementById("prev-date-btn");
    const openCalendarBtn = this.shadowRoot.getElementById("open-calendar-btn");
    const nextDateBtn = this.shadowRoot.getElementById("next-date-btn");
    const markdownEditor = this.shadowRoot.getElementById("markdown-editor");
    const calendarTab = this.shadowRoot.getElementById("calendar-tab");
    const calendar = this.shadowRoot.getElementById("calendar");
    calendar.onDatePicked = (date) => {
      currentDate = new Date(date); // Update currentDate with the selected date
      openCalendarBtn.textContent = currentDate.toDateString(); // Update the button text
      calendarTab.classList.add("tab-hidden"); // Hide the calendar tab
    };

    // const calendarCom = new CalendarComponent(
    //   curMonth,
    //   calendarDays,
    //   preMonth,
    //   nextMonth,
    //   onDatePicked
    // );
    // calendarCom.initialize();

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
  }
}

customElements.define("date-switch", JournalView);
