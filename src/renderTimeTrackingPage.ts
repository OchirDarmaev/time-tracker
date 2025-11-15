import { readFileSync } from "fs";
import { join } from "path/posix";
import { html } from "./html";
import { AuthStubRequest } from "./middleware/auth_stub";
import { projectModel } from "./models/project";
import { timeEntryModel } from "./models/time_entry";
import { formatDate, minutesToHours } from "./utils/date_utils";
import { renderBaseLayout } from "./utils/layout";

// Worker time helper functions

export function renderTimeTrackingPage(req: AuthStubRequest, includeLayout: boolean = true) {
  const currentUser = req.currentUser!;
  const today = formatDate(new Date());
  const selectedDate = (req.query.date as string) || today;

  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, selectedDate);
  const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, selectedDate);
  const totalHours = minutesToHours(totalMinutes);

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
  const timeSliderPath = join(process.cwd(), "src/views/components/time_slider.html");
  const timeSliderHtml = readFileSync(timeSliderPath, "utf-8");

  // Prepare projects data for JavaScript
  const projectsJson = JSON.stringify(
    projects.map((p) => ({ id: p.id, name: p.name, suppressed: p.suppressed || false }))
  );
  const segmentsJson = JSON.stringify(segments);

  const content = html`
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Time Tracking</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">Track your daily work hours</p>
        </div>
        <date-picker
          value="${selectedDate}"
          hx-get="/worker/time"
          hx-target="main"
          hx-swap="innerHTML"
          hx-trigger="change"
          label="Date"
        ></date-picker>
      </div>

      <time-slider
        total-hours="${sliderTotalHours}"
        segments="${segmentsJson.replace(/"/g, "&quot;")}"
        projects="${projectsJson.replace(/"/g, "&quot;")}"
        date="${selectedDate}"
        sync-url="/worker/time/sync"
      ></time-slider>

      <time-summary
        date="${selectedDate}"
        data-hx-get="/worker/time/summary"
        data-hx-trigger="load, entries-changed from:body"
      ></time-summary>
    </div>

    <!-- Load TimeSlider class definition -->
    ${timeSliderHtml}
  `;

  if (includeLayout) {
    return renderBaseLayout(content, req, "worker");
  } else {
    return content;
  }
}
