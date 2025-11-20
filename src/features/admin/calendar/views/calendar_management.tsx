import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { parseDate } from "@/shared/utils/date_utils.js";
import { YearlySummary } from "./yearly_summary.js";
import { MonthlyCalendar } from "./monthly_calendar.js";

export function CalendarManagementView(month: string, _authReq: AuthContext): JSX.Element {
  const baseDate = parseDate(month + "-01");
  const year = baseDate.getFullYear();

  return (
    <div id="calendar-management-content" class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
            Manage Calendar
          </h1>
        </div>
      </div>

      <div class="flex gap-6">
        <YearlySummary year={year} currentMonth={month} />
        <MonthlyCalendar month={month} />
      </div>
    </div>
  );
}
