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
  const dayButtons = days.map((day) => {
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
        class="flex flex-col items-center justify-center p-2 rounded border border-gray-200 dark:border-gray-700 ${bgClass} ${textClass} hover:ring-2 hover:ring-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[3rem] transition-all"
        ${hxGet ? `hx-get="${hxGet}?date=${day.date}"` : ""}
        ${hxTarget ? `hx-target="${hxTarget}"` : ""}
        hx-trigger="click"
        title="${day.date} - ${hours.toFixed(1)}h"
      >
        <span class="text-xs font-medium">${day.dayName}</span>
        <span
          class="text-sm font-bold ${isToday && !isSelected
            ? "text-indigo-600 dark:text-indigo-400"
            : ""}"
          >${day.dayNumber}</span
        >
        <span
          class="text-xs mt-0.5 ${isSelected
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
          ? html`<span class="text-xs mt-0.5">✓</span>`
          : hours > 0
            ? html`<span class="text-xs mt-0.5">⚠</span>`
            : ""}
      </button>
    `;
  });

  return html`
    <div class="mb-6">
      <h3 class="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Monthly View</h3>
      <div class="flex flex-wrap gap-1.5 overflow-x-auto pb-2">${dayButtons.join("")}</div>
      <div class="mt-3 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-gray-200 dark:border-gray-700"
          ></div>
          <span>Complete (≥8h)</span>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-gray-200 dark:border-gray-700"
          ></div>
          <span>Partial</span>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          ></div>
          <span>Empty</span>
        </div>
      </div>
    </div>
  `;
}
