import { readFileSync } from "fs";
import { html } from "@/shared/utils/html.js";
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
import { renderTimeSlider } from "@/shared/views/components/time_slider_component.js";
import { renderTimeSummary } from "@/shared/views/components/time_summary_component.js";
import { renderMonthlyCalendar } from "@/shared/views/components/monthly_calendar_component.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tsBuildUrl } from "@/shared/utils/paths.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { ClientInferRequest } from "@ts-rest/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Request = ClientInferRequest<typeof accountDashboardContract.dashboard>;

export function renderTimeTrackingPage(req: Request, authContext: AuthContext) {
  const { currentUser } = authContext;
  const selectedDate = req.query.date || formatDate(new Date());

  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, selectedDate);
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
  // Convert entries to segments format for the time slider
  const segments = entries.map((entry) => ({
    project_id: entry.project_id,
    minutes: entry.minutes,
    comment: entry.comment || null,
  }));

  // Calculate total hours from entries, default to required hours if no entries
  const sliderTotalHours =
    totalHours > 0 ? Math.max(totalHours, REQUIRED_DAILY_HOURS) : REQUIRED_DAILY_HOURS;

  // Read time slider HTML template (still needed for TimeSlider class definition)
  const timeSliderPath = join(__dirname, "../../../../shared/views/components/time_slider.html");
  const timeSliderHtml = readFileSync(timeSliderPath, "utf-8");

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

  const content = html`
    <div
      id="time-tracking-content"
      class="space-y-4"
      hx-get="${dashboardUrl}"
      hx-target="this"
      hx-swap="outerHTML transition:true"
      hx-trigger="entries-changed from:body"
    >
      <!-- Enhanced Status Bar -->
      <div
        class="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm"
      >
        <div class="flex items-start gap-4 flex-wrap">
          <div class="flex-1 min-w-[140px]">
            <div class="text-[10px] font-medium mb-0.5 text-gray-600 dark:text-gray-400">
              Daily Status
            </div>
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-2xl font-bold ${statusColor}">${totalHours.toFixed(1)}h</span>
              ${requiresDailyHours
                ? html`<span class="text-sm text-gray-500 dark:text-gray-400"
                    >/ ${REQUIRED_DAILY_HOURS}h</span
                  >`
                : ""}
              ${requiresDailyHours
                ? isOverLimit
                  ? html`<span class="text-xs text-orange-600 dark:text-orange-400 font-medium"
                      >⚠ over limit</span
                    >`
                  : isComplete
                    ? html`<span class="text-xs text-green-600 dark:text-green-400"
                        >✓ Complete</span
                      >`
                    : html`<span class="text-xs text-gray-600 dark:text-gray-400"
                        >(${remainingHours.toFixed(1)}h needed)</span
                      >`
                : html`<span class="text-xs text-gray-500 dark:text-gray-400"
                    >No time required</span
                  >`}
            </div>
          </div>
          <div class="h-12 w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
          <div class="flex-1 min-w-[160px]">
            ${renderTimeSummary({
              hxGet: tsBuildUrl(accountDashboardContract.accountDashboardSummary, {
                headers: {},
                query: {
                  date: selectedDate,
                },
              }),
              hxTrigger: "load, entries-changed from:body",
            })}
          </div>
        </div>
      </div>
      <div class="flex flex-row gap-4 w-full">
        <div class="w-1/2">
          ${renderMonthlyCalendar({
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
          })}
        </div>
        <div class="w-1/2">
          ${renderTimeSlider({
            totalHours: sliderTotalHours,
            segments: segments,
            projects: projects.map((p) => ({
              id: p.id,
              name: p.name,
              suppressed: p.suppressed || false,
              color: p.color,
              isSystem: p.isSystem || false,
            })),
            date: selectedDate,
            syncUrl: tsBuildUrl(accountDashboardContract.syncDashboardEntries, {}),
          })}
        </div>
      </div>
    </div>

    <!-- Load TimeSlider class definition -->
    ${timeSliderHtml}
  `;

  return content;
}
