// Returns true if year and month are valid
export function isValidYearMonth(year, month) {
  return Number.isInteger(year) && Number.isInteger(month) && month >= 0 && month < 12;
}

// Returns the weekday of first day of specified month 
// Return value is in integer (i.e. 0 is Monday and so on)
export function weekdayOfFirstDay(year, month) {
  if (!isValidYearMonth(year, month))
    throw new Error('Invalid year or month specified');
  return new Date(year, month, 1).getDay();
}

// Convert month index to month name as string
export function monthIndexToString(month) {
  if (!Number.isInteger(month) || month < 0 || month >= 12)
    throw new Error('Invalid month specified');
  const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  return monthNames[month] 
}

// Returns true if year is leap year
export function isLeapYear(year) {
  if (!Number.isInteger(year))
    throw new Error('Invalid year specified');
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
  
// Returns the number of days of specified month
export function getDaysOfMonth(year, month) {
  if (!isValidYearMonth(year, month))
    throw new Error('Invalid year or month specified');
  const daysInMonths = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];
  // Handle leap year case for February
  if (isLeapYear(year) && month == 1) {
    return 29;
  }
  return daysInMonths[month];
}

// Compare dates only year, month, and day
export function isSameDay(lhs, rhs) {
  return lhs.getDate() === rhs.getDate() && 
    lhs.getFullYear() === rhs.getFullYear() && 
    lhs.getMonth() === rhs.getMonth();
}


