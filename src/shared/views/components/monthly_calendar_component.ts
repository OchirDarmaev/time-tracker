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
      return html`<div class="min-w-[2.5rem]"></div>`;
    }

    const hours = dayHoursMap[day.date] || 0;
    const isComplete = hours >= requiredHours;
    const isSelected = day.date === selectedDate;
    const isToday = day.date === today;

    // Determine background color based on status
    let bgClass = "bg-gray-100 dark:bg-gray-800";
    if (isSelected) {
      bgClass = "bg-indigo-500 text-white";
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
        ? "text-gray-400 dark:text-gray-500"
        : "text-gray-900 dark:text-gray-100";

    return html`
      <button
        type="button"
        class="flex flex-col items-center justify-center p-1 rounded border border-gray-200 dark:border-gray-700 ${bgClass} ${textClass} hover:ring-1 hover:ring-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[2.5rem] transition-all"
        ${hxGet ? `hx-get="${hxGet}?date=${day.date}"` : ""}
        ${hxTarget ? `hx-target="${hxTarget}"` : ""}
        hx-trigger="click"
        title="${day.date} - ${hours.toFixed(1)}h"
      >
        <span
          class="text-xs font-bold leading-tight ${isToday && !isSelected
            ? "text-indigo-600 dark:text-indigo-400"
            : ""}"
          >${day.dayNumber}</span
        >
        <span
          class="text-[10px] leading-tight ${isSelected
            ? "text-white/90"
            : hours >= requiredHours
              ? "text-green-700 dark:text-green-400"
              : hours > 0
                ? "text-yellow-700 dark:text-yellow-400"
                : "text-gray-400 dark:text-gray-500"}"
        >
          ${hours > 0 ? hours.toFixed(1) + "h" : "-"}
        </span>
        ${isComplete
          ? html`<span class="text-[10px] leading-tight">✓</span>`
          : hours > 0
            ? html`<span class="text-[10px] leading-tight">⚠</span>`
            : ""}
      </button>
    `;
  });

  const weekDayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return html`
    <div class="mb-4">
      <h3 class="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
        Monthly View - ${monthName} ${year}
      </h3>
      <div class="grid grid-cols-7 gap-1">
        ${weekDayHeaders
          .map(
            (day) => html`
              <div
                class="text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 py-1"
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
