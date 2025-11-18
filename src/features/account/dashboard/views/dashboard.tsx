import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { projectModel } from "@/shared/models/project.js";
import { timeEntryModel } from "@/shared/models/time_entry.js";
import { calendarModel } from "@/shared/models/calendar.js";
import {
  formatDate,
  minutesToHours,
  getAllDaysInMonth,
  getMonthFromDate,
} from "@/shared/utils/date_utils.js";

const REQUIRED_DAILY_HOURS = 8;
import { MonthlyCalendar } from "@/features/account/dashboard/components/monthly-calendar.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { ClientInferRequest } from "@ts-rest/core";
import { getMonthlySummaryData } from "../getMonthlySummaryData";
import { MonthlySummary } from "./MonthlySummary";
import { TimeSlider } from "../components/TimeSlider";
import { getTimeSliderData } from "../getTimeSliderData";

type Request = ClientInferRequest<typeof accountDashboardContract.dashboard>;

export function Dashboard(req: Request, authContext: AuthContext): JSX.Element {
  const { currentUser } = authContext;
  const selectedDate = req.query.date || formatDate(new Date());

  const projects = projectModel.getByUserId(currentUser.id);
  const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, selectedDate);
  const totalHours = minutesToHours(totalMinutes);

  // Get hours for all days in the current month for the monthly calendar
  const month = getMonthFromDate(selectedDate);
  const monthEntries = timeEntryModel.getByUserIdAndMonth(currentUser.id, month);
  const allDaysInMonth = getAllDaysInMonth(selectedDate);
  const dayHoursMap: Record<string, number> = {};
  const dayProjectBreakdown: Record<string, Array<{ project_id: number; minutes: number }>> = {};

  // Get calendar days for the current month
  const calendarDays = calendarModel.getByMonth(month);
  const dayConfigurations: Record<string, "workday" | "public_holiday" | "weekend"> = {};
  calendarDays.forEach((day) => {
    dayConfigurations[day.date] = day.day_type;
  });

  // Get day type for selected date to determine if hours are required
  const selectedDayConfig = calendarModel.getByDate(selectedDate);
  const selectedDayType = selectedDayConfig?.day_type;
  const requiresDailyHours = selectedDayType === "workday" || selectedDayType === "public_holiday";

  // Initialize all days with 0 hours and empty breakdown
  allDaysInMonth.forEach((day) => {
    dayHoursMap[day.date] = 0;
    dayProjectBreakdown[day.date] = [];
  });

  // Calculate hours and project breakdown for each day from entries
  monthEntries.forEach((entry) => {
    const hours = minutesToHours(entry.minutes);
    dayHoursMap[entry.date] = (dayHoursMap[entry.date] || 0) + hours;

    // Add to project breakdown
    if (!dayProjectBreakdown[entry.date]) {
      dayProjectBreakdown[entry.date] = [];
    }
    const existingProject = dayProjectBreakdown[entry.date].find(
      (p) => p.project_id === entry.project_id
    );
    if (existingProject) {
      existingProject.minutes += entry.minutes;
    } else {
      dayProjectBreakdown[entry.date].push({
        project_id: entry.project_id,
        minutes: entry.minutes,
      });
    }
  });

  // Monthly totals are now handled by time-summary component

  // Calculate remaining hours needed (only if day requires hours)
  const remainingHours = requiresDailyHours ? Math.max(0, REQUIRED_DAILY_HOURS - totalHours) : 0;
  const isComplete = requiresDailyHours
    ? totalHours >= REQUIRED_DAILY_HOURS && totalHours <= REQUIRED_DAILY_HOURS
    : true;
  const isOverLimit = requiresDailyHours ? totalHours > REQUIRED_DAILY_HOURS : false;
  const statusColor = isOverLimit
    ? "text-orange-600 dark:text-orange-400"
    : isComplete
      ? "text-green-600 dark:text-green-400"
      : requiresDailyHours && totalHours >= 4
        ? "text-yellow-600 dark:text-yellow-400"
        : requiresDailyHours
          ? "text-red-600 dark:text-red-400"
          : "text-gray-600 dark:text-gray-400";

  // Add HTMX trigger to refresh calendar when entries change
  const dashboardUrl = tsBuildUrl(accountDashboardContract.dashboard, {
    headers: {},
    query: {
      date: req.query.date,
    },
  });

  const { reported, expected } = getMonthlySummaryData(selectedDate, currentUser);
  const timeSliderData = getTimeSliderData(currentUser, selectedDate);

  return (
    <div
      id="time-tracking-content"
      class="space-y-4"
      hx-get={dashboardUrl}
      hx-target="this"
      hx-swap="innerHTML transition:true"
      hx-trigger="entries-changed from:body"
    >
      {/* Enhanced Status Bar */}
      <div class="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
        <div class="flex items-start gap-4 flex-wrap">
          <div class="flex-1 min-w-[140px]">
            <div class="text-[10px] font-medium mb-0.5 text-gray-600 dark:text-gray-400">
              Daily Status
            </div>
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class={`text-2xl font-bold ${statusColor}`} safe>
                ({totalHours.toFixed(1)}h)
              </span>
              {requiresDailyHours ? (
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  / {REQUIRED_DAILY_HOURS}h
                </span>
              ) : (
                ""
              )}
              {requiresDailyHours ? (
                isOverLimit ? (
                  <span class="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ⚠ over limit
                  </span>
                ) : isComplete ? (
                  <span class="text-xs text-green-600 dark:text-green-400">✓ Complete</span>
                ) : (
                  <span class="text-xs text-gray-600 dark:text-gray-400" safe>
                    ({remainingHours.toFixed(1)}h needed)
                  </span>
                )
              ) : (
                <span class="text-xs text-gray-500 dark:text-gray-400">No time required</span>
              )}
            </div>
          </div>
          <div class="h-12 w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
          <div class="flex-1 min-w-[160px]">
            {/* <TimeSummary
              hxGet={tsBuildUrl(accountDashboardContract.accountDashboardSummary, {
                headers: {},
                query: {
                  date: selectedDate,
                },
              })}
              hxTrigger="none"
            /> */}
            <MonthlySummary reported={reported} expected={expected} />
          </div>
        </div>
      </div>
      <div class="flex flex-row gap-4 w-full">
        <div class="w-1/2">
          <MonthlyCalendar
            props={{
              selectedDate: selectedDate,
              hxTarget: "#time-tracking-content",
              dayHoursMap: dayHoursMap,
              dayProjectBreakdown: dayProjectBreakdown,
              projects: projects.map((p) => ({
                id: p.id,
                name: p.name,
                color: p.color,
              })),
              dayConfigurations: dayConfigurations,
            }}
          />
        </div>
        <div class="w-1/2">
          <TimeSlider
            totalHours={timeSliderData.sliderTotalHours}
            segments={timeSliderData.segmentsForSlider}
            projects={timeSliderData.projects}
            date={selectedDate}
            syncUrl={tsBuildUrl(accountDashboardContract.syncDashboardEntries, {})}
          />
        </div>
      </div>
    </div>
  );
}
