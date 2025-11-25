import { type Calendar } from "../../../lib/repo";
import {
  getAllDaysInMonth,
  formatDate,
  parseDate,
} from "../../../lib/date_utils";

interface MonthlyCalendarProps {
  month: string;
  calendarDays: Calendar[];
}

export function MonthlyCalendar({ month, calendarDays }: MonthlyCalendarProps) {
  const days = getAllDaysInMonth(month + "-01");
  const dayTypeMap = new Map(calendarDays.map((d) => [d.date, d.day_type]));

  // Count workdays, public holidays, weekends, and undefined days
  let workdaysCount = 0;
  let publicHolidaysCount = 0;
  let weekendsCount = 0;
  let undefinedCount = 0;

  days.forEach((day) => {
    const dayType = dayTypeMap.get(day.date);
    if (dayType === "workday") {
      workdaysCount++;
    } else if (dayType === "public_holiday") {
      publicHolidaysCount++;
    } else if (dayType === "weekend") {
      weekendsCount++;
    } else {
      undefinedCount++;
    }
  });

  const baseDate = parseDate(month + "-01");
  const year = baseDate.getFullYear();
  const monthIndex = baseDate.getMonth();
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
  const monthName = monthNames[monthIndex];

  // Calculate previous and next month
  const prevMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const prevMonthStr = formatDate(prevMonth).substring(0, 7);
  const nextMonthStr = formatDate(nextMonth).substring(0, 7);

  const firstDay = new Date(year, monthIndex, 1);
  const firstDayOfWeek = firstDay.getDay();
  const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const gridDays: Array<{
    date: string;
    dayNumber: number;
    dayName: string;
    isWeekend: boolean;
    isEmpty: boolean;
  }> = [];

  for (let i = 0; i < mondayBasedFirstDay; i++) {
    gridDays.push({
      date: "",
      dayNumber: 0,
      dayName: "",
      isWeekend: false,
      isEmpty: true,
    });
  }

  days.forEach((day) => {
    gridDays.push({
      ...day,
      isEmpty: false,
    });
  });

  const weekDayHeaders = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div class="w-2/3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex min-w-[200px] items-center gap-4">
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)] focus:outline-none"
            hx-get={`/partials/calendarManagement?month=${prevMonthStr}`}
            hx-target="#calendar-management-content"
            hx-swap="outerHTML"
          >
            &lt;
          </button>
          <h2
            safe
            class="flex-1 text-center text-2xl font-semibold text-[var(--text-primary)]"
          >
            {`${monthName} ${year}`}
          </h2>
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)] focus:outline-none"
            hx-get={`/partials/calendarManagement?month=${nextMonthStr}`}
            hx-target="#calendar-management-content"
            hx-swap="outerHTML"
          >
            &gt;
          </button>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex gap-4">
          <div class="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2">
            <div class="h-2 w-2 rounded-full bg-[var(--info)]"></div>
            <span class="text-xs text-[var(--text-secondary)]">Workdays: </span>
            <span class="text-sm font-bold text-[var(--info)]">
              {workdaysCount}
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2">
            <div class="h-2 w-2 rounded-full bg-[var(--error)]"></div>
            <span class="text-xs text-[var(--text-secondary)]">Holidays: </span>
            <span class="text-sm font-bold text-[var(--error)]">
              {publicHolidaysCount}
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2">
            <div class="h-2 w-2 rounded-full bg-[var(--text-tertiary)]"></div>
            <span class="text-xs text-[var(--text-secondary)]">Weekends: </span>
            <span class="text-sm font-bold text-[var(--text-tertiary)]">
              {weekendsCount}
            </span>
          </div>
          {undefinedCount > 0 && (
            <div class="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2">
              <div class="h-2 w-2 rounded-full bg-[var(--warning)]"></div>
              <span class="text-xs text-[var(--text-secondary)]">
                Not Set:{" "}
              </span>
              <span class="text-sm font-bold text-[var(--warning)]">
                {undefinedCount}
              </span>
            </div>
          )}
          <div class="flex items-center">
            <p class="text-sm text-[var(--text-secondary)]">
              Click on days to set their type
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1.5">
        {weekDayHeaders.map((day) => (
          <div
            safe
            class="pb-1 text-center text-[10px] font-medium tracking-[0.05em] text-[var(--text-tertiary)] uppercase"
          >
            {day}
          </div>
        ))}
        {gridDays.map((day) => {
          if (day.isEmpty) {
            return <div class="aspect-square"></div>;
          }

          const dayType = dayTypeMap.get(day.date);
          const isUndefined = dayType === undefined;
          const isWorkday = dayType === "workday";
          const isPublicHoliday = dayType === "public_holiday";
          const isWeekend = dayType === "weekend";

          const bgColor = isUndefined
            ? "var(--bg-elevated)"
            : isPublicHoliday
              ? "var(--error-light)"
              : isWeekend
                ? "var(--bg-tertiary)"
                : isWorkday
                  ? "var(--info-light)"
                  : "var(--bg-elevated)";

          const borderColor = isUndefined
            ? "var(--warning)"
            : isPublicHoliday
              ? "var(--error)"
              : isWeekend
                ? "var(--border)"
                : isWorkday
                  ? "var(--info)"
                  : "var(--border-subtle)";

          const textColor = isUndefined
            ? "var(--warning)"
            : isPublicHoliday
              ? "var(--error)"
              : isWeekend
                ? "var(--text-tertiary)"
                : isWorkday
                  ? "var(--info)"
                  : "var(--text-primary)";

          // Cycle through types: undefined -> workday -> public_holiday -> weekend -> workday
          const targetType = isUndefined
            ? "workday"
            : isWorkday
              ? "public_holiday"
              : isPublicHoliday
                ? "weekend"
                : "workday";
          const typeLabel = isUndefined
            ? "Not Set"
            : isPublicHoliday
              ? "Holiday"
              : isWeekend
                ? "Weekend"
                : "Workday";
          const nextTypeLabel = isUndefined
            ? "Workday"
            : isWorkday
              ? "Holiday"
              : isPublicHoliday
                ? "Weekend"
                : "Workday";

          return (
            <form
              hx-post="/partials/calendarManagement/day-type"
              hx-target="#calendar-management-content"
              hx-swap="outerHTML"
              hx-trigger="submit"
              class="m-0"
            >
              <input type="hidden" name="date" value={day.date} />
              <input type="hidden" name="day_type" value={targetType} />
              <button
                type="submit"
                class={`relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border [background-color:${bgColor}] [border-color:${borderColor}] text-[${textColor}] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none`}
                title={`${day.date} - ${typeLabel} (Click to set to ${nextTypeLabel})`}
              >
                <span class="text-xs font-medium tracking-[-0.01em]">
                  {day.dayNumber}
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
