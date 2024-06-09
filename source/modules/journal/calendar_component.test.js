import CalendarComponent from "./calendar_component.js";
import { isSameDay, getDaysOfMonth, monthIndexToString, weekdayOfFirstDay } from './date_util.js';

// Now you can use the document object as if you were in a browser environment
//const CalendarComponent = require('./calendar_component.js');

describe('CalendarComponent', () => {
    let component;
    let curMonthElement;
    let contentElement;
    let prevButtonElement;
    let nextButtonElement;

    beforeEach(() => {
        // Initialize CalendarComponent
        curMonthElement = document.createElement('div');
        contentElement = document.createElement('div');
        prevButtonElement = document.createElement('button');
        nextButtonElement = document.createElement('button');

        component = new CalendarComponent(
            curMonthElement,
            contentElement,
            prevButtonElement,
            nextButtonElement,
            (date) => {
                this.onDatePicked(date);
            }
        );
        component.initialize();
    });

    test('should initialize correctly', () => {
        // Test initialization
        expect(component).toBeDefined();
        expect(component.curMonthElement).toBeDefined();
        expect(component.contentElement).toBeDefined();
        expect(component.prevMonthElement).toBeDefined();
        expect(component.nextMonthElement).toBeDefined();
    });


    test('should switch to previous month', () => {
        // Test switching to previous month
        const initialMonth = component.curMonth;
        prevButtonElement.click();
        expect(component.curMonth).toBe(initialMonth - 1);
    });

    test('should switch to next month', () => {
        // Test switching to next month
        const initialMonth = component.curMonth;
        nextButtonElement.click();
        expect(component.curMonth).toBe(initialMonth + 1);
    });

    test('should highlight today\'s date', () => {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        component.curMonth = month;
        component.curYear = year;
        component.render();

        // Check if today's date is highlighted in the DOM
        const dayElements = document.querySelectorAll('.calendar_row .calendar_day');
        dayElements.forEach((dayElement) => {
            const date = new Date(dayElement.dataset.date); 
            if (isSameDay(date, today)) {
                // Check if the date is today
                expect(dayElement.classList.contains('calendar_today')).toBe(true);
            } else {
                // Check if other dates are not highlighted
                expect(dayElement.classList.contains('calendar_today')).toBe(false);
            }
        });
    });

    test('should grey out dates that are not in the current month', () => {
        // Check each date element to see if it's greyed out if it's not in May 2024
        const dayElements = document.querySelectorAll('.calendar_row .calendar_day');
        dayElements.forEach(dayElement => {
            const date = new Date(dayElement.textContent + ' ' + component.curMonthElement.textContent);
            if (date.getMonth() !== component.curMonth) {
                // Date is not in May 2024, it should be greyed out
                expect(dayElement.classList.contains('calendar_grayed')).toBeTruthy();
            } else {
                // Date is in May 2024, it should not be greyed out
                expect(dayElement.classList.contains('calendar_grayed')).toBeFalsy();
            }
        });
    });

    test('should highlight selected date', () => {
        // Set the selected date
        const selectedDate = new Date(2024, 5, 15); // June 15, 2024
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        component.selectedDay = selectedDate;
        component.curMonth = month;
        component.curYear = year;
        component.render();
    
        // Check if the selected date is highlighted in the DOM
        const dayElements = document.querySelectorAll('.calendar_row .calendar_day');
        dayElements.forEach((dayElement) => {
            const date = new Date(dayElement.dataset.date);
            if (isSameDay(date, selectedDate)) {
                // Check if the date is the selected date
                expect(dayElement.classList.contains('calendar_selected')).toBe(true);
            } else {
                // Check if other dates are not highlighted
                expect(dayElement.classList.contains('calendar_selected')).toBe(false);
            }
        });
    });

    test('should display the correct number of days', () => {
        const month = 5; 
        const year = 2024;
        component.curMonth = month;
        component.curYear = year;
        component.render();
    
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let totalDays = 0;
        // Loop through each row to count the number of day elements that are not greyed out
        const dayRows = contentElement.querySelectorAll('.calendar_row');
        dayRows.forEach(row => {
            const dayElements = row.querySelectorAll(':not(.calendar_grayed)');
            totalDays += dayElements.length;
        });
        expect(totalDays).toBe(daysInMonth);
    });
});
