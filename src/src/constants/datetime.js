// Function to get month name from month number
export const getMonthName = (monthNumber) => {
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return monthNames[monthNumber - 1];
};

// Returns abbreviated weekday names
export const getWeekdayNames = () => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
};

// Get today date
export const getTodayDate = (customDate = null) => {
    // const today = new Date();
    const today = customDate ? new Date(customDate) : new Date(); 
    const day = today.getDate();
    const month = today.getMonth() + 1; // Note: Months are zero-indexed
    const year = today.getFullYear();
    return { day, month, year };
};

// Returns the dates for the current week
export const getWeekDates = (currentDate) => {
    const today = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    const dayOfWeek = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

    // Calculate the first day of the week (Monday) and the last day of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    let weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push({
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        });
    }

    return weekDates;
};

// Format day to two digits (e.g., 01, 09)
export const formatDay = (day) => {
    return day < 10 ? `0${day}` : `${day}`;
};