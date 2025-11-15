import { initServer } from "@ts-rest/express";
import { apiContract } from "./contracts/api.js";
import { AuthStubRequest } from "./middleware/auth_stub.js";
import { userModel, UserRole } from "./models/user.js";
import { TimeEntry, timeEntryModel } from "./models/time_entry.js";
import { Project, projectModel } from "./models/project.js";
import { ProjectUser, projectUserModel } from "./models/project_user.js";
import {
  formatDate,
  getMonthFromDate,
  minutesToHours,
  getWorkingDaysInMonth,
  parseDate,
} from "./utils/date_utils.js";
import { validateDate, validateMinutes, validateProjectName } from "./utils/validation.js";
import { renderBaseLayout, renderNavBar } from "./utils/layout.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { html } from "./html.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Worker time helper functions
function renderTimeTrackingPage(req: AuthStubRequest, includeLayout: boolean = true) {
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

function renderEntriesTable(entries: TimeEntry[], projects: Project[]): string {
  if (entries.length === 0) {
    return `
      <div class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400 text-sm">No entries for this date.</p>
      </div>
    `;
  }

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  // Extract tags from comments (words starting with #)
  const extractTags = (comment: string | null): string[] => {
    if (!comment) return [];
    const matches = comment.match(/#\w+/g);
    return matches || [];
  };

  return html`
    <table
      class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
    >
      <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th
            class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Project
          </th>
          <th
            class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Hours
          </th>
          <th
            class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Comment
          </th>
          <th
            class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map((entry) => {
            const tags = extractTags(entry.comment);
            const commentWithoutTags = entry.comment
              ? entry.comment.replace(/#\w+/g, "").trim()
              : "";
            return `
          <tr id="entry-${entry.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
            <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${projectMap.get(entry.project_id) || "Unknown"}</td>
            <td class="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${minutesToHours(entry.minutes).toFixed(1)}h</td>
            <td class="px-5 py-4 text-sm">
              ${commentWithoutTags ? `<span class="text-gray-900 dark:text-gray-100">${commentWithoutTags}</span>` : ""}
              ${tags.length > 0 ? tags.map((tag) => `<span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 ml-1.5">${tag}</span>`).join("") : ""}
            </td>
            <td class="px-5 py-4 text-right">
              <button 
                hx-delete="/worker/time/entries/${entry.id}"
                hx-target="#entries-container"
                hx-swap="innerHTML transition:true"
                hx-confirm="Delete this entry?"
                hx-on::after-request="htmx.trigger('body', 'entries-changed')"
                class="bg-transparent text-red-500 dark:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-400"
              >
                Delete
              </button>
            </td>
          </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderSummary(
  totalHours: number,
  monthlyTotalHours: number,
  requiredMonthlyHours: number,
  monthlyWarning: boolean
): string {
  // Determine daily status color
  let dailyStatus = "success";
  let dailyColorClass = "bg-green-500";
  let badgeClass = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
  if (totalHours < 4) {
    dailyStatus = "error";
    dailyColorClass = "bg-red-500";
    badgeClass = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  } else if (totalHours < 6) {
    dailyStatus = "error";
    dailyColorClass = "bg-red-500";
    badgeClass = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  } else if (totalHours < 8) {
    dailyStatus = "warning";
    dailyColorClass = "bg-yellow-500";
    badgeClass = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
  }

  console.log(dailyStatus, dailyColorClass, badgeClass);

  const dailyPercentage = Math.min((totalHours / 8) * 100, 100);

  return html`
    <div class="flex items-center gap-6">
      <div class="min-w-[140px]">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Daily</span>
          <span
            class="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${badgeClass}"
            >${totalHours.toFixed(1)}h</span
          >
        </div>
        <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden">
          <div class="h-full ${dailyColorClass}" style="width: ${dailyPercentage}%;"></div>
        </div>
      </div>
      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-3 min-w-[200px]"
      >
        <div class="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Monthly</div>
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold text-gray-900 dark:text-gray-100"
            >${monthlyTotalHours.toFixed(1)}</span
          >
          <span class="text-sm text-gray-500 dark:text-gray-400">/ ${requiredMonthlyHours}h</span>
          ${monthlyWarning
            ? '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 ml-auto">Below target</span>'
            : '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 ml-auto">On track</span>'}
        </div>
      </div>
    </div>
  `;
}

// Manager reports helper functions
function renderReportsPage(req: AuthStubRequest) {
  const workers = userModel.getWorkers();
  const projects = projectModel.getAll();

  const content = html`
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          View time tracking reports by worker or project
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
        >
          <h2 class="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
            View by Worker
          </h2>
          <select
            id="worker-select"
            hx-get="/manager/reports/worker"
            hx-target="#report-content"
            hx-swap="innerHTML transition:true"
            hx-trigger="change"
            hx-include="[name='worker_id']"
            name="worker_id"
            class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 w-full"
          >
            <option value="">Select Worker</option>
            ${workers.map((w) => `<option value="${w.id}">${w.email}</option>`).join("")}
          </select>
        </div>

        <div
          class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
        >
          <h2 class="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
            View by Project
          </h2>
          <select
            id="project-select"
            hx-get="/manager/reports/project"
            hx-target="#report-content"
            hx-swap="innerHTML transition:true"
            hx-trigger="change"
            hx-include="[name='project_id']"
            name="project_id"
            class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 w-full"
          >
            <option value="">Select Project</option>
            ${projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
      </div>

      <div id="report-content">
        <div class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Select a worker or project to view reports.
          </p>
        </div>
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "manager");
}

function renderWorkerReport(userId: number): string {
  const user = userModel.getById(userId);
  if (!user) {
    return '<div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"><p class="text-red-500 dark:text-red-400">Worker not found.</p></div>';
  }

  const entries = timeEntryModel.getByUserId(userId);
  const projects = projectModel.getAll();

  const grouped: Record<string, Record<number, number>> = {};
  entries.forEach((entry) => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = {};
    }
    if (!grouped[entry.date][entry.project_id]) {
      grouped[entry.date][entry.project_id] = 0;
    }
    grouped[entry.date][entry.project_id] += entry.minutes;
  });

  const dates = Object.keys(grouped).sort();

  if (dates.length === 0) {
    return `<div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"><p class="text-gray-600 dark:text-gray-400">No time entries for ${user.email}.</p></div>`;
  }

  let grandTotal = 0;
  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
  });

  let html2 = html`
    <div
      class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Report for ${user.email}
        </h3>
        <div
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          ${minutesToHours(grandTotal).toFixed(1)}h total
        </div>
      </div>
      <div class="overflow-x-scroll overflow-y-visible">
        <table
          class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th
                class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Date
              </th>
              ${projects
                .map(
                  (p) =>
                    `<th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">${p.name}</th>`
                )
                .join("")}
              <th
                class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    html2 += html`
      <tr id="report-row-${userId}-${date}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
        <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${date}</td>
        ${projects
          .map((p) => {
            const minutes = grouped[date][p.id] || 0;
            return `<td class="px-5 py-4 text-sm ${minutes > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}">${minutesToHours(minutes).toFixed(1)}</td>`;
          })
          .join("")}
        <td class="px-5 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
          ${minutesToHours(dayTotal).toFixed(1)}h
        </td>
      </tr>
    `;
  });

  html2 += html`
          </tbody>
          <tfoot>
            <tr class="bg-gray-200 dark:bg-gray-700">
              <td class="px-5 py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Total</td>
              ${projects
                .map((p) => {
                  const projectTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][p.id] || 0),
                    0
                  );
                  return `<td class="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${minutesToHours(projectTotal).toFixed(1)}h</td>`;
                })
                .join("")}
              <td class="px-5 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">${minutesToHours(grandTotal).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  return html2;
}

function renderProjectReport(projectId: number): string {
  const project = projectModel.getById(projectId);
  if (!project) {
    return '<div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"><p class="text-red-500 dark:text-red-400">Project not found.</p></div>';
  }

  const entries = timeEntryModel.getByProjectId(projectId);
  const workers = userModel.getWorkers();

  const grouped: Record<string, Record<number, number>> = {};
  entries.forEach((entry) => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = {};
    }
    if (!grouped[entry.date][entry.user_id]) {
      grouped[entry.date][entry.user_id] = 0;
    }
    grouped[entry.date][entry.user_id] += entry.minutes;
  });

  const dates = Object.keys(grouped).sort();

  if (dates.length === 0) {
    return `<div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"><p class="text-gray-600 dark:text-gray-400">No time entries for project ${project.name}.</p></div>`;
  }

  let grandTotal = 0;
  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
  });

  let html2 = html`
    <div
      class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Report for ${project.name}
        </h3>
        <div
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        >
          ${minutesToHours(grandTotal).toFixed(1)}h total
        </div>
      </div>
      <div class="overflow-x-scroll overflow-y-visible">
        <table
          class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th
                class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Date
              </th>
              ${workers
                .map(
                  (w) =>
                    `<th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">${w.email}</th>`
                )
                .join("")}
              <th
                class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    html2 += html`
      <tr
        id="report-row-project-${projectId}-${date}"
        class="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${date}</td>
        ${workers
          .map((w) => {
            const minutes = grouped[date][w.id] || 0;
            return `<td class="px-5 py-4 text-sm ${minutes > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}">${minutesToHours(minutes).toFixed(1)}</td>`;
          })
          .join("")}
        <td class="px-5 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
          ${minutesToHours(dayTotal).toFixed(1)}h
        </td>
      </tr>
    `;
  });

  html2 += html`
          </tbody>
          <tfoot>
            <tr class="bg-gray-200 dark:bg-gray-700">
              <td class="px-5 py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Total</td>
              ${workers
                .map((w) => {
                  const workerTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][w.id] || 0),
                    0
                  );
                  return `<td class="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${minutesToHours(workerTotal).toFixed(1)}h</td>`;
                })
                .join("")}
              <td class="px-5 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">${minutesToHours(grandTotal).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  return html2;
}

// Admin projects helper functions
function renderProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll(true);
  const projectsJson = JSON.stringify(
    projects.map((p) => ({ id: p.id, name: p.name, suppressed: p.suppressed || false }))
  );

  const content = html`
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Projects</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Manage all projects in the system</p>
      </div>

      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Project</h2>
        <form
          hx-post="/admin/projects"
          hx-target="project-list"
          hx-swap="outerHTML"
          hx-trigger="submit"
          hx-on::after-request="this.reset()"
          class="flex gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Project name"
            required
            class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3.5 py-2.5 text-sm w-full focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 focus:bg-gray-100 dark:focus:bg-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 flex-1"
          />
          <button
            type="submit"
            class="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer shadow-sm hover:shadow-md"
          >
            Add Project
          </button>
        </form>
      </div>

      <project-list projects="${projectsJson.replace(/"/g, "&quot;")}"></project-list>
    </div>
  `;

  return renderBaseLayout(content, req, "admin_projects");
}

// Admin users-projects helper functions
function renderUsersProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll();

  const content = html`
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Assign Workers</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Manage worker assignments to projects
        </p>
      </div>

      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
        <label
          for="project-select"
          class="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100"
          >Select Project</label
        >
        <select
          id="project-select"
          hx-get="/admin/users-projects/project"
          hx-target="#project-workers"
          hx-swap="innerHTML transition:true"
          hx-trigger="change"
          hx-include="[name='project_id']"
          name="project_id"
          class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 w-full"
        >
          <option value="">Select a project</option>
          ${projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
      </div>

      <div id="project-workers">
        <div
          class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
        >
          <p class="text-gray-600 dark:text-gray-400 text-center py-6">
            Select a project to manage workers.
          </p>
        </div>
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "admin_users");
}

function renderProjectWorkers(projectId: number): string {
  const project = projectModel.getById(projectId);
  if (!project) {
    return '<p class="text-red-500">Project not found.</p>';
  }

  const projectUsers = projectUserModel.getByProjectId(projectId, true);
  const allWorkers = userModel.getWorkers();
  const assignedWorkerIds = new Set(projectUsers.map((pu) => pu.user_id));
  const availableWorkers = allWorkers.filter((w) => !assignedWorkerIds.has(w.id));

  return html`
    <div class="space-y-6">
      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Workers assigned to ${project.name}
        </h2>

        <div class="mb-6">
          <h3 class="text-sm font-medium mb-3 text-gray-600 dark:text-gray-400">Add Worker</h3>
          <form
            hx-post="/admin/users-projects"
            hx-target="#project-workers"
            hx-swap="innerHTML transition:true"
            hx-trigger="submit"
            hx-on::after-request="this.reset()"
            class="flex gap-4"
          >
            <input type="hidden" name="project_id" value="${projectId}" />
            <select
              name="user_id"
              required
              class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 flex-1"
            >
              <option value="">Select worker</option>
              ${availableWorkers.map((w) => `<option value="${w.id}">${w.email}</option>`).join("")}
            </select>
            <button
              type="submit"
              class="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer shadow-sm hover:shadow-md"
            >
              Add Worker
            </button>
          </form>
        </div>
      </div>

      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
        <h3 class="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Assigned Workers
        </h3>
        ${projectUsers.length === 0
          ? '<p class="text-gray-600 dark:text-gray-400 text-center py-6">No workers assigned to this project.</p>'
          : `
          <table class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
            <thead class="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Worker Email</th>
                <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Status</th>
                <th class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${projectUsers
                .map((pu) => {
                  const worker = userModel.getById(pu.user_id);
                  return `
                  <tr id="project-user-${pu.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700 ${pu.suppressed ? "opacity-60" : ""}">
                    <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${worker?.email || "Unknown"}</td>
                    <td class="px-5 py-4">
                      ${pu.suppressed ? '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Suppressed</span>' : '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Active</span>'}
                    </td>
                    <td class="px-5 py-4 text-right">
                      <button 
                        hx-delete="/admin/users-projects/${pu.id}"
                        hx-target="#project-workers"
                        hx-swap="innerHTML transition:true"
                        hx-confirm="Remove this worker from the project?"
                        class="bg-transparent text-red-500 dark:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-400"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

// Admin system reports helper functions
function renderSystemReportsPage(req: AuthStubRequest) {
  const content = html`
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">System Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Overview of all time tracking data</p>
      </div>

      <div
        id="reports-data"
        hx-get="/admin/system-reports/data"
        hx-swap="innerHTML transition:true"
        hx-trigger="load"
      >
        ${renderSystemReports()}
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "admin_reports");
}

function renderSystemReports(): string {
  const allEntries = timeEntryModel.getAll();
  const workers = userModel.getWorkers();
  const projects = projectModel.getAll();

  const workerTotals: Record<number, number> = {};
  workers.forEach((w) => {
    const entries = timeEntryModel.getByUserId(w.id);
    workerTotals[w.id] = entries.reduce((sum, e) => sum + e.minutes, 0);
  });

  const projectTotals: Record<number, number> = {};
  projects.forEach((p) => {
    const entries = timeEntryModel.getByProjectId(p.id);
    projectTotals[p.id] = entries.reduce((sum, e) => sum + e.minutes, 0);
  });

  const totalSystemHours = minutesToHours(allEntries.reduce((sum, e) => sum + e.minutes, 0));

  return html`
    <div class="space-y-6">
      <div
        class="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 border border-indigo-500 dark:border-indigo-400 rounded-lg p-5 shadow-sm"
      >
        <div class="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
          Total System Hours
        </div>
        <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          ${totalSystemHours.toFixed(1)}
        </div>
        <div class="text-sm mt-1 text-gray-500 dark:text-gray-400">hours tracked</div>
      </div>

      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Hours by Worker</h2>
        <table
          class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th
                class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Worker
              </th>
              <th
                class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Total Hours
              </th>
            </tr>
          </thead>
          <tbody>
            ${workers
              .map((w) => {
                const hours = minutesToHours(workerTotals[w.id] || 0);
                return `
                <tr id="system-worker-${w.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
                  <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${w.email}</td>
                  <td class="px-5 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${hours.toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>

      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Hours by Project
        </h2>
        <table
          class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th
                class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Project
              </th>
              <th
                class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
              >
                Total Hours
              </th>
            </tr>
          </thead>
          <tbody>
            ${projects
              .map((p) => {
                const hours = minutesToHours(projectTotals[p.id] || 0);
                return `
                <tr id="system-project-${p.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
                  <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${p.name}</td>
                  <td class="px-5 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${hours.toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

const s = initServer();

export const router = s.router(apiContract, {
  setUser: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const userId = body.user_id;
    if (userId) {
      authReq.session!.userId = userId;
      const user = userModel.getById(userId);
      if (user && user.roles.length > 0) {
        // Set to the first role, or keep current role if user has it
        const currentRole = authReq.session!.userRole as UserRole | undefined;
        if (currentRole && user.roles.includes(currentRole)) {
          authReq.session!.userRole = currentRole;
        } else {
          authReq.session!.userRole = user.roles[0];
        }
      }
      // Save session explicitly to ensure it's persisted
      return new Promise((resolve) => {
        authReq.session!.save(() => {
          const referer = authReq.get("Referer") || "/";
          res.setHeader("Location", referer);
          resolve({
            status: 302,
            body: undefined,
          });
        });
      });
    }
    const referer = authReq.get("Referer") || "/";
    res.setHeader("Location", referer);

    return {
      status: 302,
      body: undefined,
    };
  },

  setRole: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const role = body.role;
    if (role && ["worker", "office-manager", "admin"].includes(role)) {
      const userId = authReq.session!.userId as number | undefined;
      if (userId) {
        const user = userModel.getById(userId);
        // Only set role if user has this role
        if (user && user.roles.includes(role as UserRole)) {
          authReq.session!.userRole = role as UserRole;
        }
      } else {
        authReq.session!.userRole = role as UserRole;
      }
    }
    const referer = authReq.get("Referer") || "/";
    res.setHeader("Location", referer);
    return {
      status: 302,
      body: undefined,
    };
  },

  getNavBar: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;
    const activeNav = (query?.active_nav as string) || "";
    const html = renderNavBar(authReq, activeNav);
    return {
      status: 200,
      body: html,
    };
  },

  // Root redirect
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.roles.includes("admin")) {
        res.setHeader("Location", "/admin/projects");
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes("office-manager")) {
        res.setHeader("Location", "/manager/reports");
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes("worker")) {
        res.setHeader("Location", "/worker/time");
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.setHeader("Location", "/");
    return {
      status: 302,
      body: undefined,
    };
  },

  // Worker time routes
  workerTime: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    // Check if this is an HTMX request - if so, return only the content
    const isHtmxRequest = authReq.headers["hx-request"] === "true";

    if (isHtmxRequest) {
      // Return only the content for HTMX requests
      const content = renderTimeTrackingPage(authReq, false);
      return {
        status: 200,
        body: content,
      };
    } else {
      // Return full page for regular requests
      const html = renderTimeTrackingPage(authReq, true);
      return {
        status: 200,
        body: html,
      };
    }
  },

  workerTimeEntries: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const date = (query?.date as string) || formatDate(new Date());

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: html,
    };
  },

  createTimeEntry: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const { project_id, date, hours, comment } = body;

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    const minutes = Math.round(parseFloat(hours) * 60);
    if (!validateMinutes(minutes)) {
      return {
        status: 400,
        body: { body: "Invalid hours" },
      };
    }

    const project = projectModel.getById(parseInt(project_id));
    if (!project) {
      return {
        status: 400,
        body: { body: "Invalid project" },
      };
    }

    const userProjects = projectModel.getByUserId(currentUser.id);
    if (!userProjects.find((p) => p.id === project.id)) {
      return {
        status: 403,
        body: { body: "Access denied to this project" },
      };
    }

    timeEntryModel.create(currentUser.id, project.id, date, minutes, comment || null);

    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: html,
    };
  },

  deleteTimeEntry: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const entryId = parseInt(params.id);

    const entry = timeEntryModel.getById(entryId);
    if (!entry) {
      return {
        status: 404,
        body: { body: "Entry not found" },
      };
    }

    if (entry.user_id !== currentUser.id) {
      return {
        status: 403,
        body: { body: "Access denied" },
      };
    }

    timeEntryModel.delete(entryId);

    const date = entry.date;
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: html,
    };
  },

  syncTimeEntries: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { success: false },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { success: false },
      };
    }

    const currentUser = authReq.currentUser;
    const { date, segments } = body;

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { success: false },
      };
    }

    // Verify user has access to all projects
    const userProjects = projectModel.getByUserId(currentUser.id);
    const projectIds = new Set(userProjects.map((p) => p.id));

    for (const segment of segments) {
      if (!projectIds.has(segment.project_id)) {
        return {
          status: 403,
          body: { success: false },
        };
      }
      if (!validateMinutes(segment.minutes)) {
        return {
          status: 400,
          body: { success: false },
        };
      }
    }

    // Delete all existing entries for this date and user
    const existingEntries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    for (const entry of existingEntries) {
      timeEntryModel.delete(entry.id);
    }

    // Create new entries from segments
    for (const segment of segments) {
      timeEntryModel.create(
        currentUser.id,
        segment.project_id,
        date,
        segment.minutes,
        segment.comment || null
      );
    }

    return {
      status: 200,
      body: { success: true },
    };
  },

  workerTimeSummary: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const date = (query?.date as string) || formatDate(new Date());

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
    const totalHours = minutesToHours(totalMinutes);

    const month = getMonthFromDate(date);
    const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
    const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);

    const dateObj = parseDate(date);
    const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
    const requiredMonthlyHours = workingDays * 8;

    const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;

    const html = renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, monthlyWarning);
    return {
      status: 200,
      body: html,
    };
  },

  // Manager reports routes
  managerReports: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderReportsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  managerReportsWorker: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const userId = parseInt(query?.worker_id as string);
    if (!userId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a worker to view reports.</p>',
      };
    }
    const html = renderWorkerReport(userId);
    return {
      status: 200,
      body: html,
    };
  },

  managerReportsProject: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a project to view reports.</p>',
      };
    }
    const html = renderProjectReport(projectId);
    return {
      status: 200,
      body: html,
    };
  },

  // Admin projects routes
  adminProjects: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderProjectsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  createProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const { name } = body;

    if (!validateProjectName(name)) {
      return {
        status: 400,
        body: { body: "Invalid project name" },
      };
    }

    try {
      projectModel.create(name.trim());
      const projects = projectModel.getAll(true);
      const projectsJson = JSON.stringify(
        projects.map((p) => ({ id: p.id, name: p.name, suppressed: p.suppressed || false }))
      );
      const html = `<project-list projects="${projectsJson.replace(/"/g, "&quot;")}"></project-list>`;
      return {
        status: 200,
        body: html,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Project name already exists" },
        };
      }
      return {
        status: 500,
        body: { body: "Error creating project" },
      };
    }
  },

  toggleProjectSuppress: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const id = parseInt(params.id);
    projectModel.toggleSuppress(id);
    const projects = projectModel.getAll(true);
    const projectsJson = JSON.stringify(
      projects.map((p) => ({ id: p.id, name: p.name, suppressed: p.suppressed || false }))
    );
    const html = `<project-list projects="${projectsJson.replace(/"/g, "&quot;")}"></project-list>`;
    return {
      status: 200,
      body: html,
    };
  },

  // Admin users-projects routes
  adminUsersProjects: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderUsersProjectsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  adminUsersProjectsProject: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a project to manage workers.</p>',
      };
    }
    const html = renderProjectWorkers(projectId);
    return {
      status: 200,
      body: html,
    };
  },

  assignWorkerToProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const { project_id, user_id } = body;
    const projectId = parseInt(project_id as string);
    const userId = user_id;

    if (!projectId || !userId) {
      return {
        status: 400,
        body: { body: "Invalid project or user ID" },
      };
    }

    try {
      projectUserModel.create(userId, projectId);
      const html = renderProjectWorkers(projectId);
      return {
        status: 200,
        body: html,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Worker already assigned to this project" },
        };
      }
      return {
        status: 500,
        body: { body: "Error assigning worker" },
      };
    }
  },

  removeWorkerFromProject: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const id = parseInt(params.id);

    const allProjects = projectModel.getAll(true);
    let projectUser: ProjectUser | null = null;
    for (const project of allProjects) {
      const projectUsers = projectUserModel.getByProjectId(project.id, true);
      const found = projectUsers.find((pu) => pu.id === id);
      if (found) {
        projectUser = found;
        break;
      }
    }

    if (!projectUser) {
      return {
        status: 404,
        body: { body: "Assignment not found" },
      };
    }

    projectUserModel.delete(id);
    const html = renderProjectWorkers(projectUser.project_id);
    return {
      status: 200,
      body: html,
    };
  },

  // Admin system reports routes
  adminSystemReports: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderSystemReportsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  adminSystemReportsData: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderSystemReports();
    return {
      status: 200,
      body: html,
    };
  },
});
