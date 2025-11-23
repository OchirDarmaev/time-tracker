import { type Calendar } from "../../../lib/mock_db";
import { getAllDaysInMonth } from "../../../lib/date_utils";

interface YearlySummaryProps {
  year: number;
  currentMonth: string;
  calendarDaysByMonth: Map<string, Calendar[]>;
}

export function YearlySummary({
  year,
  currentMonth,
  calendarDaysByMonth,
}: YearlySummaryProps) {
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

  // Calculate yearly summary for all months in the current year
  const yearlySummary: Array<{
    month: string;
    monthName: string;
    workdays: number;
    holidays: number;
    weekends: number;
    notSet: number;
  }> = [];

  for (let m = 0; m < 12; m++) {
    const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
    const monthDays = getAllDaysInMonth(monthStr + "-01");
    const monthCalendarDays = calendarDaysByMonth.get(monthStr) || [];
    const monthDayTypeMap = new Map(
      monthCalendarDays.map((d) => [d.date, d.day_type])
    );

    let monthWorkdays = 0;
    let monthHolidays = 0;
    let monthWeekends = 0;
    let monthNotSet = 0;

    monthDays.forEach((day) => {
      const dayType = monthDayTypeMap.get(day.date);
      if (dayType === "workday") {
        monthWorkdays++;
      } else if (dayType === "public_holiday") {
        monthHolidays++;
      } else if (dayType === "weekend") {
        monthWeekends++;
      } else {
        monthNotSet++;
      }
    });

    yearlySummary.push({
      month: monthStr,
      monthName: monthNames[m],
      workdays: monthWorkdays,
      holidays: monthHolidays,
      weekends: monthWeekends,
      notSet: monthNotSet,
    });
  }

  return (
    <div class="w-1/3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
      <h2 class="mb-4 text-xl font-semibold text-[var(--text-primary)]">
        {year} Summary
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border)]">
              <th class="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
                Month
              </th>
              <th class="px-3 py-2 text-right font-medium text-[var(--info)]">
                w
              </th>
              <th class="px-3 py-2 text-right font-medium text-[var(--error)]">
                h
              </th>
              <th class="px-3 py-2 text-right font-medium text-[var(--text-tertiary)]">
                w
              </th>
              <th class="px-3 py-2 text-right font-medium text-[var(--text-secondary)]">
                t
              </th>
            </tr>
          </thead>
          <tbody>
            {yearlySummary.map((summary) => {
              const isCurrentMonth = summary.month === currentMonth;
              return (
                <tr
                  class={`border-b border-[var(--border)] ${
                    isCurrentMonth
                      ? "bg-[var(--bg-tertiary)] font-semibold"
                      : ""
                  }`}
                >
                  <td class="px-3 py-2 text-[var(--text-primary)]">
                    <a
                      href={`/partials/calendarManagement?month=${summary.month}`}
                      hx-get={`/partials/calendarManagement?month=${summary.month}`}
                      hx-target="#calendar-management-content"
                      hx-swap="outerHTML"
                      class={`flex items-center gap-2 no-underline hover:underline ${
                        isCurrentMonth
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      <span safe>{summary.monthName}</span>
                      {summary.notSet > 0 && (
                        <span
                          class="h-2 w-2 rounded-full bg-[var(--warning)]"
                          title={`${summary.notSet} day(s) not set`}
                        ></span>
                      )}
                    </a>
                  </td>
                  <td class="px-3 py-2 text-right text-[var(--info)]">
                    {summary.workdays}
                  </td>
                  <td class="px-3 py-2 text-right text-[var(--error)]">
                    {summary.holidays}
                  </td>
                  <td class="px-3 py-2 text-right text-[var(--text-tertiary)]">
                    {summary.weekends}
                  </td>
                  <td class="px-3 py-2 text-right text-[var(--text-primary)]">
                    {summary.workdays +
                      summary.holidays +
                      summary.weekends +
                      summary.notSet}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-[var(--border)]">
              <td class="px-3 py-2 font-semibold text-[var(--text-primary)]">
                Total
              </td>
              <td class="px-3 py-2 text-right font-semibold text-[var(--info)]">
                {yearlySummary.reduce((sum, m) => sum + m.workdays, 0)}
              </td>
              <td class="px-3 py-2 text-right font-semibold text-[var(--error)]">
                {yearlySummary.reduce((sum, m) => sum + m.holidays, 0)}
              </td>
              <td class="px-3 py-2 text-right font-semibold text-[var(--text-tertiary)]">
                {yearlySummary.reduce((sum, m) => sum + m.weekends, 0)}
              </td>
              <td class="px-3 py-2 text-right font-semibold text-[var(--text-primary)]">
                {yearlySummary.reduce(
                  (sum, m) =>
                    sum + m.workdays + m.holidays + m.weekends + m.notSet,
                  0
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
