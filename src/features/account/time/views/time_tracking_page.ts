import { readFileSync } from "fs";
import { html } from "../../../../shared/utils/html.js";
import { AuthStubRequest } from "../../../../shared/middleware/auth_stub.js";
import { projectModel } from "../../../../shared/models/project.js";
import { timeEntryModel } from "../../../../shared/models/time_entry.js";
import {
  formatDate,
  minutesToHours,
  getAllDaysInMonth,
  getMonthFromDate,
} from "../../../../shared/utils/date_utils.js";
import { renderBaseLayout } from "../../../../shared/utils/layout.js";
import { renderTimeSlider } from "../../../../shared/views/components/time_slider_component.js";
import { renderTimeSummary } from "../../../../shared/views/components/time_summary_component.js";
import { renderMonthlyCalendar } from "../../../../shared/views/components/monthly_calendar_component.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function renderTimeTrackingPage(req: AuthStubRequest, includeLayout: boolean = true) {
  const currentUser = req.currentUser!;
  const today = formatDate(new Date());
  const selectedDate = (req.query.date as string) || today;

  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, selectedDate);
  const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, selectedDate);
  const totalHours = minutesToHours(totalMinutes);

  // Get hours for all days in the current month for the monthly calendar
  const month = getMonthFromDate(selectedDate);
  const monthEntries = timeEntryModel.getByUserIdAndMonth(currentUser.id, month);
  const allDaysInMonth = getAllDaysInMonth(selectedDate);
  const dayHoursMap: Record<string, number> = {};

  // Initialize all days with 0 hours
  allDaysInMonth.forEach((day) => {
    dayHoursMap[day.date] = 0;
  });

  // Calculate hours for each day from entries
  monthEntries.forEach((entry) => {
    const hours = minutesToHours(entry.minutes);
    dayHoursMap[entry.date] = (dayHoursMap[entry.date] || 0) + hours;
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
  const isComplete = totalHours >= 8;
  const statusColor = isComplete
    ? "text-green-600 dark:text-green-400"
    : totalHours >= 4
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400";

  const content = html`
    <div class="space-y-4">
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
              ${!isComplete
                ? html`<span class="text-xs text-gray-600 dark:text-gray-400"
                    >(${remainingHours.toFixed(1)}h needed)</span
                  >`
                : html`<span class="text-xs text-green-600 dark:text-green-400">✓ Complete</span>`}
            </div>
          </div>
          <div class="h-12 w-px bg-gray-300 dark:bg-gray-600 self-stretch"></div>
          <div class="flex-1 min-w-[160px]">
            ${renderTimeSummary({
              date: selectedDate,
              hxGet: "/account/time/summary",
              hxTrigger: "load, entries-changed from:body",
            })}
          </div>
        </div>
      </div>

      ${renderMonthlyCalendar({
        selectedDate: selectedDate,
        hxGet: "/account/time",
        hxTarget: "main",
        dayHoursMap: dayHoursMap,
      })}
      ${renderTimeSlider({
        totalHours: sliderTotalHours,
        segments: segments,
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          suppressed: p.suppressed || false,
        })),
        date: selectedDate,
        syncUrl: "/account/time/sync",
      })}
    </div>

    <!-- Load TimeSlider class definition -->
    ${timeSliderHtml}
  `;

  if (includeLayout) {
    return renderBaseLayout(content, req, "account");
  } else {
    return content;
  }
}
