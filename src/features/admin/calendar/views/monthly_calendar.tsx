import { calendarModel } from "@/shared/models/calendar.js";
import { getAllDaysInMonth, formatDate, parseDate } from "@/shared/utils/date_utils.js";
import { adminCalendarContract } from "../contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

interface MonthlyCalendarProps {
  month: string;
}

export function MonthlyCalendar({ month }: MonthlyCalendarProps): JSX.Element {
  const days = getAllDaysInMonth(month + "-01");
  const calendarDays = calendarModel.getByMonth(month);
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
    <div
      class="rounded-2xl p-6 w-2/3"
      style="background-color: var(--bg-elevated); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);"
    >
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4" style="min-width: 200px;">
          <button
            type="button"
            class="px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none shrink-0"
            style="color: var(--text-secondary); background-color: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow-sm); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
            onmouseover="this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-tertiary)'; this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-1px)';"
            onmouseout="this.style.color='var(--text-secondary)'; this.style.backgroundColor='var(--bg-elevated)'; this.style.boxShadow='var(--shadow-sm)'; this.style.transform='translateY(0)';"
            hx-get={tsBuildUrl(adminCalendarContract.view, {
              headers: {},
              query: { month: prevMonthStr },
            })}
            hx-target="#calendar-management-content"
            hx-swap="outerHTML transition:true"
          >
            &lt;
          </button>
          <h2
            safe
            class="text-2xl font-semibold flex-1 text-center"
            style="color: var(--text-primary);"
          >
            {`${monthName} ${year}`}
          </h2>
          <button
            type="button"
            class="px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none shrink-0"
            style="color: var(--text-secondary); background-color: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow-sm); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
            onmouseover="this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-tertiary)'; this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-1px)';"
            onmouseout="this.style.color='var(--text-secondary)'; this.style.backgroundColor='var(--bg-elevated)'; this.style.boxShadow='var(--shadow-sm)'; this.style.transform='translateY(0)';"
            hx-get={tsBuildUrl(adminCalendarContract.view, {
              headers: {},
              query: { month: nextMonthStr },
            })}
            hx-target="#calendar-management-content"
            hx-swap="outerHTML transition:true"
          >
            &gt;
          </button>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex gap-4">
          <div
            class="px-3 py-2 rounded-lg flex items-center gap-2"
            style="background-color: var(--bg-tertiary);"
          >
            <div class="w-2 h-2 rounded-full" style="background-color: var(--info);"></div>
            <span class="text-xs" style="color: var(--text-secondary);">
              Workdays:{" "}
            </span>
            <span class="text-sm font-bold" style="color: var(--info);">
              {workdaysCount}
            </span>
          </div>
          <div
            class="px-3 py-2 rounded-lg flex items-center gap-2"
            style="background-color: var(--bg-tertiary);"
          >
            <div class="w-2 h-2 rounded-full" style="background-color: var(--error);"></div>
            <span class="text-xs" style="color: var(--text-secondary);">
              Holidays:{" "}
            </span>
            <span class="text-sm font-bold" style="color: var(--error);">
              {publicHolidaysCount}
            </span>
          </div>
          <div
            class="px-3 py-2 rounded-lg flex items-center gap-2"
            style="background-color: var(--bg-tertiary);"
          >
            <div class="w-2 h-2 rounded-full" style="background-color: var(--text-tertiary);"></div>
            <span class="text-xs" style="color: var(--text-secondary);">
              Weekends:{" "}
            </span>
            <span class="text-sm font-bold" style="color: var(--text-tertiary);">
              {weekendsCount}
            </span>
          </div>
          {undefinedCount > 0 && (
            <div
              class="px-3 py-2 rounded-lg flex items-center gap-2"
              style="background-color: var(--bg-tertiary);"
            >
              <div class="w-2 h-2 rounded-full" style="background-color: var(--warning);"></div>
              <span class="text-xs" style="color: var(--text-secondary);">
                Not Set:{" "}
              </span>
              <span class="text-sm font-bold" style="color: var(--warning);">
                {undefinedCount}
              </span>
            </div>
          )}
          <div class="flex items-center">
            <p class="text-sm" style="color: var(--text-secondary);">
              Click on days to set their type
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1.5">
        {weekDayHeaders.map((day) => (
          <div
            safe
            class="text-center text-[10px] font-medium pb-1"
            style="color: var(--text-tertiary); letter-spacing: 0.05em; text-transform: uppercase;"
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
              hx-post={tsBuildUrl(adminCalendarContract.setDayType, {})}
              hx-target="#calendar-management-content"
              hx-swap="outerHTML transition:true"
              hx-trigger="submit"
              class="m-0"
            >
              <input type="hidden" name="date" value={day.date} />
              <input type="hidden" name="day_type" value={targetType} />
              <button
                type="submit"
                class="relative w-full aspect-square rounded-lg border transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none hover:shadow-md hover:-translate-y-0.5"
                style={`background-color: ${bgColor}; border-color: ${borderColor}; color: ${textColor}; box-shadow: var(--shadow-sm);`}
                title={`${day.date} - ${typeLabel} (Click to set to ${nextTypeLabel})`}
              >
                <span class="text-xs font-medium" style="letter-spacing: -0.01em;">
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
