import { isSameDay, getDaysOfMonth, monthIndexToString, weekdayOfFirstDay } from './date_util.js'

// CalendarComponent is a convenient calendar widget component
// that lets user pick date and run "onDatePicked" callback function
// when user picked the date
export default class CalendarComponent {
  constructor(curMonthElement, contentElement, prevButtonElement, nextButtonElement, onDatePicked) {
    this.curMonthElement = curMonthElement;
    this.contentElement = contentElement;
    this.onDatePicked = onDatePicked;
    this.prevMonthElement = prevButtonElement;
    this.nextMonthElement = nextButtonElement;
  }

  // initialize the component and performs initial render
  initialize() {
    this.today = new Date();
    this.curYear = this.today.getFullYear();
    this.curMonth = this.today.getMonth();
    this.prevMonthElement.addEventListener('click', () => {
      this.prevMonth();
    });
    this.nextMonthElement.addEventListener('click', () => {
      this.nextMonth();
    });
    this.selectedDay = null;
    this.render();
  }

  // renders the component
  render() {
    this.curMonthElement.textContent = monthIndexToString(this.curMonth) + ", " + this.curYear
    this.contentElement.replaceChildren();
    this.fillDateGrid();
    
    const create_row = (days) => {
      const row = document.createElement('div');
      row.classList.add('calendar_row');
      days.forEach((day) => {
        const col = document.createElement('div');
        if (isSameDay(this.today, day)) {
          col.classList.add('calendar_today');
        }
        if (this.selectedDay && isSameDay(this.selectedDay, day)) {
          col.classList.add('calendar_selected');
        }
        if (day.getMonth() != this.curMonth) {
          col.classList.add('calendar_grayed');
        } else {
          col.addEventListener('click', () => {
            this.selectedDay = day;
            this.onDatePicked(day);
            this.render();
          });
        }
        col.textContent = day.getDate().toString();
        row.appendChild(col);
      });
      return row;
    };

    for (let i = 0; i < this.days.length; i += 7) {
      this.contentElement.appendChild(create_row(this.days.slice(i,i+7)));
    }
  }

  // fill "date grid" which will be displayed on the screen
  fillDateGrid() {
    this.days = new Array(42).fill(null);
    let counter = 1
    let firstDay = weekdayOfFirstDay(this.curYear, this.curMonth);
    let flag = false;
    let prevMonth = (this.curMonth+11) % 12; // 11 = -1 (mod 12)
    let nextMonth = (this.curMonth+1) % 12;
    for(let i = firstDay; i < this.days.length; i++) {
      if (!flag) {
        this.days[i] = new Date(this.curYear, this.curMonth, counter++);
      } else {
        this.days[i] = new Date(this.curYear, nextMonth, counter++);
      }
      if(counter > getDaysOfMonth(this.curYear,this.curMonth)){
        counter = 1;
        flag = true;
      }
    }
    let count = getDaysOfMonth(this.curYear, prevMonth);
    console.log(count)
    for(let i = firstDay - 1; i >= 0; i--){
      this.days[i] = new Date(this.curYear, prevMonth, count--);
    }
  }

  // switch to previous month
  prevMonth() {
    this.curMonth--;
    if(this.curMonth == -1){
        this.curYear--;
        this.curMonth = 11
    }
    this.selectedDay = null;
    this.render();
  }

  // switch to next month
  nextMonth() {
    this.curMonth++;
    if (this.curMonth == 12){
        this.curYear++
        this.curMonth = 0
    }
    this.selectedDay = null
    this.render();
  }
}

