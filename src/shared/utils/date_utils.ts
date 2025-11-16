export function getWorkingDaysInMonth(year: number, month: number): number {
  const lastDay = new Date(year, month, 0);
  let workingDays = 0;

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthFromDate(dateString: string): string {
  return dateString.substring(0, 7);
}

export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

export function getAllDaysInMonth(dateString: string): Array<{
  date: string;
  dayNumber: number;
  dayName: string;
  isWeekend: boolean;
  dayOfWeek: number;
}> {
  const baseDate = parseDate(dateString);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: Array<{
    date: string;
    dayNumber: number;
    dayName: string;
    isWeekend: boolean;
    dayOfWeek: number;
  }> = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Monday first

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday-based: 0=Sun->6, 1=Mon->0, 2=Tue->1, ..., 6=Sat->5
    const mondayBasedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    days.push({
      date: formatDate(date),
      dayNumber: day,
      dayName: dayNames[mondayBasedDayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayOfWeek: mondayBasedDayOfWeek,
    });
  }

  return days;
}
