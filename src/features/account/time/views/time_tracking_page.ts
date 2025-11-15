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
import { renderDatePicker } from "../../../../shared/views/components/date_picker_component.js";
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

  const content = html`
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Time Tracking</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">Track your daily work hours</p>
        </div>
        ${renderDatePicker({
          value: selectedDate,
          hxGet: "/account/time",
          hxTarget: "main",
          hxTrigger: "change",
          label: "Date",
        })}
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
      ${renderTimeSummary({
        date: selectedDate,
        hxGet: "/account/time/summary",
        hxTrigger: "load, entries-changed from:body",
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
