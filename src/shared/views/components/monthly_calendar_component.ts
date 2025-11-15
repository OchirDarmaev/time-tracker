import { html } from "../../utils/html";
import { getAllDaysInMonth, formatDate } from "../../utils/date_utils";

export interface MonthlyCalendarProps {
  selectedDate: string;
  hxGet: string;
  hxTarget: string;
  dayHoursMap: Record<string, number>; // date -> hours
}

export function renderMonthlyCalendar(props: MonthlyCalendarProps): string {
  const { selectedDate, hxGet, hxTarget, dayHoursMap } = props;
  const days = getAllDaysInMonth(selectedDate);
  const requiredHours = 8;

  const today = formatDate(new Date());
  const baseDate = new Date(selectedDate + "T00:00:00");
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  // Format month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month];
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to Monday-based: 0=Sun->6, 1=Mon->0, 2=Tue->1, etc.
  const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Create grid with empty cells for days before month starts
  const gridDays: Array<{
    date: string;
    dayNumber: number;
    dayName: string;
    isWeekend: boolean;
    isEmpty: boolean;
  }> = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < mondayBasedFirstDay; i++) {
    gridDays.push({
      date: "",
      dayNumber: 0,
      dayName: "",
      isWeekend: false,
      isEmpty: true,
    });
  }

  // Add actual days
  days.forEach((day) => {
    gridDays.push({
      ...day,
      isEmpty: false,
    });
  });

  const dayButtons = gridDays.map((day) => {
    if (day.isEmpty) {
      return html`<div class="min-w-[2rem]"></div>`;
    }

    const hours = dayHoursMap[day.date] || 0;
    const isOverLimit = hours > requiredHours;
    const isComplete = hours === requiredHours;
    const isSelected = day.date === selectedDate;
    const isToday = day.date === today;

    // Determine background color based on status
    let bgClass = "bg-gray-100 dark:bg-gray-800";
    if (isSelected) {
      bgClass = "bg-indigo-500 text-white";
    } else if (isOverLimit) {
      bgClass = "bg-orange-100 dark:bg-orange-900/30";
    } else if (isComplete) {
      bgClass = "bg-green-100 dark:bg-green-900/30";
    } else if (hours > 0) {
      bgClass = "bg-yellow-100 dark:bg-yellow-900/30";
    } else if (day.isWeekend) {
      bgClass = "bg-gray-50 dark:bg-gray-900/50";
    }

    // Text color
    const textClass = isSelected
      ? "text-white"
      : day.isWeekend
        ? "text-gray-500 dark:text-gray-500"
        : "text-gray-900 dark:text-gray-100";

    return html`
      <button
        type="button"
        class="flex items-center  justify-center p-1 rounded-full border border-gray-200 dark:border-gray-700 ${bgClass} ${textClass} hover:ring-2 hover:ring-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[2rem] h-[2rem] transition-all font-medium"
        ${hxGet ? `hx-get="${hxGet}?date=${day.date}"` : ""}
        ${hxTarget ? `hx-target="${hxTarget}"` : ""}
        ${hxGet ? `hx-swap="outerHTML transition:true"` : ""}
        hx-trigger="click"
        hx-scroll="false"
        title="${day.date} - ${hours.toFixed(1)}h"
      >
        <span
          class="text-xs font-semibold leading-tight ${isToday && !isSelected
            ? "text-indigo-600 dark:text-indigo-400"
            : ""}"
          >${day.dayNumber}</span
        >
      </button>
    `;
  });

  const weekDayHeaders = ["M", "T", "W", "T", "F", "S", "S"];

  return html`
    <div class="mb-4">
      <h3 class="text-sm  mb-3 text-gray-900 dark:text-gray-100 tracking-tight">
        ${monthName} ${year}
      </h3>
      <div class="grid grid-cols-7 gap-1.5">
        ${weekDayHeaders
          .map(
            (day) => html`
              <div
                class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1.5 uppercase "
              >
                ${day}
              </div>
            `
          )
          .join("")}
        ${dayButtons.join("")}
      </div>
    </div>
  `;
}
