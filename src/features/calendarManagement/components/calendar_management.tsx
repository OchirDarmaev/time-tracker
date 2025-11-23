import { parseDate } from "../../../lib/date_utils";
import { type Calendar } from "../../../lib/mock_db";
import { YearlySummary } from "./yearly_summary";
import { MonthlyCalendar } from "./monthly_calendar";

interface CalendarManagementProps {
  month: string;
  calendarDaysByMonth: Map<string, Calendar[]>;
}

export function CalendarManagement({
  month,
  calendarDaysByMonth,
}: CalendarManagementProps) {
  const baseDate = parseDate(month + "-01");
  const year = baseDate.getFullYear();
  const currentMonthDays = calendarDaysByMonth.get(month) || [];

  return (
    <div id="calendar-management-content" class="space-y-6">
      <div class="flex gap-6">
        <YearlySummary
          year={year}
          currentMonth={month}
          calendarDaysByMonth={calendarDaysByMonth}
        />
        <MonthlyCalendar month={month} calendarDays={currentMonthDays} />
      </div>
    </div>
  );
}
