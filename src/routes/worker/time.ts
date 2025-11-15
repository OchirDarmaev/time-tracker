import { Router, Response } from "express";
import { AuthStubRequest, requireRole } from "../../middleware/auth_stub.js";
import { TimeEntry, timeEntryModel } from "../../models/time_entry.js";
import { Project, projectModel } from "../../models/project.js";
import {
  formatDate,
  getMonthFromDate,
  minutesToHours,
  getWorkingDaysInMonth,
  parseDate,
} from "../../utils/date_utils.js";
import { validateDate, validateMinutes } from "../../utils/validation.js";
import { renderBaseLayout } from "../../utils/layout.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { html } from "../../utils/html.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

function renderTimeTrackingPage(req: AuthStubRequest, res: Response) {
  const currentUser = req.currentUser!;
  const today = formatDate(new Date());
  const selectedDate = (req.query.date as string) || today;

  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, selectedDate);
  const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, selectedDate);
  const totalHours = minutesToHours(totalMinutes);

  const month = getMonthFromDate(selectedDate);
  const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
  const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);

  const dateObj = parseDate(selectedDate);
  const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
  const requiredMonthlyHours = workingDays * 8;

  const dailyWarning = totalHours < 8;
  const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;

  // Convert entries to segments format for the time slider
  const segments = entries.map((entry) => ({
    project_id: entry.project_id,
    minutes: entry.minutes,
  }));

  // Calculate total hours from entries, default to 8 if no entries
  const sliderTotalHours = totalHours > 0 ? Math.max(totalHours, 8) : 8;

  // Read time slider component
  const timeSliderPath = join(__dirname, "../../views/components/time_slider.html");
  const timeSliderHtml = readFileSync(timeSliderPath, "utf-8");

  // Prepare projects data for JavaScript
  const projectsJson = JSON.stringify(projects.map((p) => ({ id: p.id, name: p.name })));
  const segmentsJson = JSON.stringify(segments);

  const content = html`
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">My Time Tracking</h1>

      <div class="mb-6">
        <label for="date-picker" class="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          id="date-picker"
          value="${selectedDate}"
          hx-get="/worker/time"
          hx-target="body"
          hx-trigger="change"
          hx-include="this"
          name="date"
          class="border rounded px-3 py-2"
        />
      </div>

      ${timeSliderHtml}

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Summary</h2>
        <div
          id="summary-container"
          hx-get="/worker/time/summary?date=${selectedDate}"
          hx-trigger="load, entries-changed from:body"
        >
          ${renderSummary(
            totalHours,
            monthlyTotalHours,
            requiredMonthlyHours,
            dailyWarning,
            monthlyWarning
          )}
        </div>
      </div>
    </div>
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        if (window.TimeSlider) {
          const projects = ${projectsJson};
          const segments = ${segmentsJson};
          const totalHours = ${sliderTotalHours};

          window.timeSliderInstance = new TimeSlider("time-slider-container", {
            totalHours: totalHours,
            segments: segments,
            projects: projects,
            date: "${selectedDate}",
            onChange: function (data) {
              // Handle time slider changes if needed
              console.log("Time slider changed:", data);
            },
          });
        }
      });
    </script>
  `;

  res.send(renderBaseLayout(content, req, "worker"));
}

function renderEntriesTable(entries: TimeEntry[], projects: Project[]): string {
  if (entries.length === 0) {
    return html`<p class="text-gray-500">No entries for this date.</p>`;
  }

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  return html`
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2">Project</th>
          <th class="border border-gray-300 px-4 py-2">Hours</th>
          <th class="border border-gray-300 px-4 py-2">Comment</th>
          <th class="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map(
            (entry) => `
          <tr>
            <td class="border border-gray-300 px-4 py-2">${projectMap.get(entry.project_id) || "Unknown"}</td>
            <td class="border border-gray-300 px-4 py-2">${minutesToHours(entry.minutes).toFixed(1)}</td>
            <td class="border border-gray-300 px-4 py-2">${entry.comment || ""}</td>
            <td class="border border-gray-300 px-4 py-2">
              <button 
                hx-delete="/worker/time/entries/${entry.id}"
                hx-target="#entries-container"
                hx-swap="innerHTML"
                hx-confirm="Delete this entry?"
                hx-on::after-request="htmx.trigger('body', 'entries-changed')"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderSummary(
  totalHours: number,
  monthlyTotalHours: number,
  requiredMonthlyHours: number,
  dailyWarning: boolean,
  monthlyWarning: boolean
): string {
  return html`
    <div class="space-y-4">
      <div
        class="p-4 border rounded ${dailyWarning
          ? "bg-red-50 border-red-300"
          : "bg-green-50 border-green-300"}"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold">Daily Total: ${totalHours.toFixed(1)} hours</span>
          ${dailyWarning
            ? '<span class="text-red-600">❗ Less than 8 hours</span>'
            : '<span class="text-green-600">✓ Complete</span>'}
        </div>
      </div>
      <div
        class="p-4 border rounded ${monthlyWarning
          ? "bg-yellow-50 border-yellow-300"
          : "bg-green-50 border-green-300"}"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold"
            >Monthly Total: ${monthlyTotalHours.toFixed(1)} / ${requiredMonthlyHours} hours</span
          >
          ${monthlyWarning
            ? '<span class="text-yellow-600">⚠️ Below target</span>'
            : '<span class="text-green-600">✓ On track</span>'}
        </div>
      </div>
    </div>
  `;
}

router.get("/", requireRole("worker"), (req: AuthStubRequest, res: Response) => {
  renderTimeTrackingPage(req, res);
});

router.get("/entries", requireRole("worker"), (req: AuthStubRequest, res: Response) => {
  const currentUser = req.currentUser!;
  const date = (req.query.date as string) || formatDate(new Date());

  if (!validateDate(date)) {
    return res.status(400).send("Invalid date");
  }

  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
  res.send(renderEntriesTable(entries, projects));
});

router.post("/entries", requireRole("worker"), (req: AuthStubRequest, res: Response) => {
  const currentUser = req.currentUser!;
  const { project_id, date, hours, comment } = req.body;

  if (!validateDate(date)) {
    return res.status(400).send("Invalid date");
  }

  const minutes = Math.round(parseFloat(hours) * 60);
  if (!validateMinutes(minutes)) {
    return res.status(400).send("Invalid hours");
  }

  const project = projectModel.getById(parseInt(project_id));
  if (!project) {
    return res.status(400).send("Invalid project");
  }

  // Verify user has access to this project
  const userProjects = projectModel.getByUserId(currentUser.id);
  if (!userProjects.find((p) => p.id === project.id)) {
    return res.status(403).send("Access denied to this project");
  }

  timeEntryModel.create(currentUser.id, project.id, date, minutes, comment || null);

  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
  res.send(renderEntriesTable(entries, projects));
});

router.delete("/entries/:id", requireRole("worker"), (req: AuthStubRequest, res: Response) => {
  const currentUser = req.currentUser!;
  const entryId = parseInt(req.params.id);

  const entry = timeEntryModel.getById(entryId);
  if (!entry) {
    return res.status(404).send("Entry not found");
  }

  if (entry.user_id !== currentUser.id) {
    return res.status(403).send("Access denied");
  }

  timeEntryModel.delete(entryId);

  const date = entry.date;
  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
  res.send(renderEntriesTable(entries, projects));
});

router.get("/summary", requireRole("worker"), (req: AuthStubRequest, res: Response) => {
  const currentUser = req.currentUser!;
  const date = (req.query.date as string) || formatDate(new Date());

  if (!validateDate(date)) {
    return res.status(400).send("Invalid date");
  }

  const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
  const totalHours = minutesToHours(totalMinutes);

  const month = getMonthFromDate(date);
  const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
  const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);

  const dateObj = parseDate(date);
  const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
  const requiredMonthlyHours = workingDays * 8;

  const dailyWarning = totalHours < 8;
  const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;

  res.send(
    renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, dailyWarning, monthlyWarning)
  );
});

export default router;
