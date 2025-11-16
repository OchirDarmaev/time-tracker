import { readFileSync } from "fs";
import { html } from "../../../../shared/utils/html.js";
import { AuthContext } from "../../../../shared/middleware/auth_stub.js";
import { projectModel } from "../../../../shared/models/project.js";
import { timeEntryModel } from "../../../../shared/models/time_entry.js";
import {
  formatDate,
  minutesToHours,
  getAllDaysInMonth,
  getMonthFromDate,
} from "../../../../shared/utils/date_utils.js";
import { renderTimeSlider } from "../../../../shared/views/components/time_slider_component.js";
import { renderTimeSummary } from "../../../../shared/views/components/time_summary_component.js";
import { renderMonthlyCalendar } from "../../../../shared/views/components/monthly_calendar_component.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tsBuildUrl } from "../../../../shared/utils/paths.js";
import { accountDashboardContract } from "../contract.js";
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

  // Calculate total hours from entries, default to 8 if no entries
  const sliderTotalHours = totalHours > 0 ? Math.max(totalHours, 8) : 8;

  // Read time slider HTML template (still needed for TimeSlider class definition)
  const timeSliderPath = join(__dirname, "../../../../shared/views/components/time_slider.html");
  const timeSliderHtml = readFileSync(timeSliderPath, "utf-8");

  // Calculate remaining hours needed
  const remainingHours = Math.max(0, 8 - totalHours);
  const isComplete = totalHours >= 8 && totalHours <= 8;
  const isOverLimit = totalHours > 8;
  const statusColor = isOverLimit
    ? "text-orange-600 dark:text-orange-400"
    : isComplete
      ? "text-green-600 dark:text-green-400"
      : totalHours >= 4
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  const content = html`
    <div id="time-tracking-content" class="space-y-4">
      <!-- Enhanced Status Bar -->
      <div
        class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm"
      >
        <div class="flex items-start gap-4 flex-wrap">
          <div class="flex-1 min-w-[140px]">
            <div class="text-[10px] font-medium mb-0.5 text-gray-600 dark:text-gray-400">
              Daily Status
            </div>
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-2xl font-bold ${statusColor}">${totalHours.toFixed(1)}h</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">/ 8h</span>
              ${isOverLimit
                ? html`<span class="text-xs text-orange-600 dark:text-orange-400 font-medium"
                    >⚠ over limit</span
                  >`
                : isComplete
                  ? html`<span class="text-xs text-green-600 dark:text-green-400">✓ Complete</span>`
                  : html`<span class="text-xs text-gray-600 dark:text-gray-400"
                      >(${remainingHours.toFixed(1)}h needed)</span
                    >`}
            </div>
          </div>
          <div class="h-12 w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
          <div class="flex-1 min-w-[160px]">
            ${renderTimeSummary({
              hxGet: tsBuildUrl(accountDashboardContract.accountDashboardSummary, {
                date: selectedDate,
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
            hxGet: tsBuildUrl(accountDashboardContract.dashboard, {}),
            hxTarget: "#time-tracking-content",
            dayHoursMap: dayHoursMap,
            dayProjectBreakdown: dayProjectBreakdown,
            projects: projects.map((p) => ({
              id: p.id,
              name: p.name,
              color: p.color,
            })),
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
