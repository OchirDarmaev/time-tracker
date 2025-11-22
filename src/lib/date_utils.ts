export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthFromDate(dateString: string): string {
  // Returns YYYY-MM format
  const date = new Date(dateString + "T00:00:00");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}

export function getAllDaysInMonth(dateString: string): Array<{
  date: string;
  dayNumber: number;
  dayName: string;
  isWeekend: boolean;
}> {
  const date = new Date(dateString + "T00:00:00");
  const year = date.getFullYear();
  const month = date.getMonth();

  const lastDay = new Date(year, month + 1, 0);

  const days: Array<{
    date: string;
    dayNumber: number;
    dayName: string;
    isWeekend: boolean;
  }> = [];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    days.push({
      date: formatDate(currentDate),
      dayNumber: day,
      dayName: dayNames[dayOfWeek],
      isWeekend,
    });
  }

  return days;
}
