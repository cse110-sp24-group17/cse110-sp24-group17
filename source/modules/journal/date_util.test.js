import {
  isValidYearMonth,
  weekdayOfFirstDay,
  monthIndexToString,
  isLeapYear,
  getDaysOfMonth,
  isSameDay
} from './date_util.js'; 

describe('isValidYearMonth', () => {
  test('should return true for valid year and month', () => {
    expect(isValidYearMonth(2021, 11)).toBe(true);
  });

  test('should return false for invalid month', () => {
    expect(isValidYearMonth(2021, -1)).toBe(false);
    expect(isValidYearMonth(2021, 12)).toBe(false);
  });

  test('should return false for non-integer year or month', () => {
    expect(isValidYearMonth(2021.5, 5)).toBe(false);
    expect(isValidYearMonth(2021, 5.5)).toBe(false);
  });
});

describe('weekdayOfFirstDay', () => {
  test('should return correct weekday index', () => {
    expect(weekdayOfFirstDay(2021, 0)).toBe(5); // January 1, 2021 is Friday
  });

  test('should throw error for invalid year or month', () => {
    expect(() => weekdayOfFirstDay(2021, 12)).toThrow('Invalid year or month specified');
  });
});

describe('monthIndexToString', () => {
  test('should convert month index to month name', () => {
    expect(monthIndexToString(0)).toBe('January');
  });

  test('should throw error for invalid month', () => {
    expect(() => monthIndexToString(12)).toThrow('Invalid month specified');
    expect(() => monthIndexToString(-1)).toThrow('Invalid month specified');
  });
});

describe('isLeapYear', () => {
  test('should return true for leap years', () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
  });

  test('should return false for non-leap years', () => {
    expect(isLeapYear(2021)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
  });

  test('should throw error for non-integer years', () => {
    expect(() => isLeapYear(2020.5)).toThrow('Invalid year specified');
  });
});

describe('getDaysOfMonth', () => {
  test('should return correct number of days', () => {
    expect(getDaysOfMonth(2021, 0)).toBe(31); // January
    expect(getDaysOfMonth(2021, 1)).toBe(28); // February in non-leap year
    expect(getDaysOfMonth(2020, 1)).toBe(29); // February in leap year
  });

  test('should throw error for invalid month', () => {
    expect(() => getDaysOfMonth(2021, 12)).toThrow('Invalid year or month specified');
  });
});

describe('isSameDay', () => {
  test('should return true for the same date', () => {
    const date1 = new Date(2021, 0, 1);
    const date2 = new Date(2021, 0, 1);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  test('should return false for different dates', () => {
    const date1 = new Date(2021, 0, 1);
    const date2 = new Date(2021, 0, 2);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});
