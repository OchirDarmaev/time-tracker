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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Worker time helper functions
function renderTimeTrackingPage(req: AuthStubRequest) {
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

  const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;

  // Convert entries to segments format for the time slider
  const segments = entries.map((entry) => ({
    project_id: entry.project_id,
    minutes: entry.minutes,
  }));

  // Calculate total hours from entries, default to 8 if no entries
  const sliderTotalHours = totalHours > 0 ? Math.max(totalHours, 8) : 8;

  // Read time slider component
  // __dirname in compiled code is dist/, so we need to go to src/views
  const timeSliderPath = join(process.cwd(), "src/views/components/time_slider.html");
  const timeSliderHtml = readFileSync(timeSliderPath, "utf-8");

  // Prepare projects data for JavaScript
  const projectsJson = JSON.stringify(projects.map((p) => ({ id: p.id, name: p.name })));
  const segmentsJson = JSON.stringify(segments);

  const content = `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">Time Tracking</h1>
          <p class="text-sm" style="color: var(--text-secondary);">Track your daily work hours</p>
        </div>
        <div>
          <label for="date-picker" class="block text-xs font-medium mb-2" style="color: var(--text-secondary);">Date</label>
          <input 
            type="date" 
            id="date-picker" 
            value="${selectedDate}"
            hx-get="/worker/time"
            hx-target="body"
            hx-swap="transition:true"
            hx-trigger="change"
            hx-include="this"
            name="date"
            class="input-modern"
            style="width: auto; min-width: 160px;"
          />
        </div>
      </div>
      
      ${timeSliderHtml}
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Summary</h2>
        <div id="summary-container" hx-get="/worker/time/summary?date=${selectedDate}" hx-swap="transition:true" hx-trigger="load, entries-changed from:body">
          ${renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, monthlyWarning)}
        </div>
      </div>
    </div>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        if (window.TimeSlider) {
          const projects = ${projectsJson};
          const segments = ${segmentsJson};
          const totalHours = ${sliderTotalHours};
          
          window.timeSliderInstance = new TimeSlider('time-slider-container', {
            totalHours: totalHours,
            segments: segments,
            projects: projects,
            date: '${selectedDate}',
            onChange: function(data) {
              // Handle time slider changes if needed
              console.log('Time slider changed:', data);
            }
          });
        }
      });
    </script>
  `;

  return renderBaseLayout(content, req, "worker");
}

function renderEntriesTable(entries: TimeEntry[], projects: Project[]): string {
  if (entries.length === 0) {
    return `
      <div class="text-center py-12">
        <p style="color: var(--text-secondary); font-size: 14px;">No entries for this date.</p>
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

  return `
    <table class="table-modern">
      <thead>
        <tr>
          <th>Project</th>
          <th>Hours</th>
          <th>Comment</th>
          <th style="text-align: right;">Actions</th>
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
          <tr id="entry-${entry.id}">
            <td style="font-weight: 500;">${projectMap.get(entry.project_id) || "Unknown"}</td>
            <td style="font-weight: 600; color: var(--accent);">${minutesToHours(entry.minutes).toFixed(1)}h</td>
            <td>
              ${commentWithoutTags ? `<span style="color: var(--text-primary);">${commentWithoutTags}</span>` : ""}
              ${tags.length > 0 ? tags.map((tag) => `<span class="tag" style="margin-left: 6px;">${tag}</span>`).join("") : ""}
            </td>
            <td style="text-align: right;">
              <button 
                hx-delete="/worker/time/entries/${entry.id}"
                hx-target="#entries-container"
                hx-swap="transition:true"
                hx-confirm="Delete this entry?"
                hx-on::after-request="htmx.trigger('body', 'entries-changed')"
                class="btn-danger"
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
  let dailyColor = "var(--success)";
  if (totalHours < 4) {
    dailyStatus = "error";
    dailyColor = "var(--error)";
  } else if (totalHours < 6) {
    dailyStatus = "error";
    dailyColor = "var(--error)";
  } else if (totalHours < 8) {
    dailyStatus = "warning";
    dailyColor = "var(--warning)";
  }

  const dailyPercentage = Math.min((totalHours / 8) * 100, 100);

  return `
    <div class="flex items-center gap-6">
      <div style="min-width: 140px;">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-medium" style="color: var(--text-secondary);">Daily</span>
          <span class="badge badge-${dailyStatus}" style="font-size: 11px;">${totalHours.toFixed(1)}h</span>
        </div>
        <div style="width: 100%; height: 4px; background-color: var(--bg-tertiary); border-radius: 2px; overflow: hidden;">
          <div style="width: ${dailyPercentage}%; height: 100%; background-color: ${dailyColor};"></div>
        </div>
      </div>
      <div class="card" style="padding: 12px 16px; min-width: 200px;">
        <div class="text-xs font-medium mb-1" style="color: var(--text-secondary);">Monthly</div>
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold" style="color: var(--text-primary);">${monthlyTotalHours.toFixed(1)}</span>
          <span class="text-sm" style="color: var(--text-tertiary);">/ ${requiredMonthlyHours}h</span>
          ${monthlyWarning ? '<span class="badge badge-warning" style="margin-left: auto;">Below target</span>' : '<span class="badge badge-success" style="margin-left: auto;">On track</span>'}
        </div>
      </div>
    </div>
  `;
}

// Manager reports helper functions
function renderReportsPage(req: AuthStubRequest) {
  const workers = userModel.getWorkers();
  const projects = projectModel.getAll();

  const content = `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">Reports</h1>
        <p class="text-sm" style="color: var(--text-secondary);">View time tracking reports by worker or project</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-base font-semibold mb-4" style="color: var(--text-primary);">View by Worker</h2>
          <select 
            id="worker-select"
            hx-get="/manager/reports/worker"
            hx-target="#report-content"
            hx-swap="transition:true"
            hx-trigger="change"
            hx-include="[name='worker_id']"
            name="worker_id"
            class="select-modern w-full"
          >
            <option value="">Select Worker</option>
            ${workers.map((w) => `<option value="${w.id}">${w.email}</option>`).join("")}
          </select>
        </div>
        
        <div class="card">
          <h2 class="text-base font-semibold mb-4" style="color: var(--text-primary);">View by Project</h2>
          <select 
            id="project-select"
            hx-get="/manager/reports/project"
            hx-target="#report-content"
            hx-swap="transition:true"
            hx-trigger="change"
            hx-include="[name='project_id']"
            name="project_id"
            class="select-modern w-full"
          >
            <option value="">Select Project</option>
            ${projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div id="report-content">
        <div class="text-center py-12">
          <p style="color: var(--text-secondary); font-size: 14px;">Select a worker or project to view reports.</p>
        </div>
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "manager");
}

function renderWorkerReport(userId: number): string {
  const user = userModel.getById(userId);
  if (!user) {
    return '<div class="card"><p style="color: var(--error);">Worker not found.</p></div>';
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
    return `<div class="card"><p style="color: var(--text-secondary);">No time entries for ${user.email}.</p></div>`;
  }

  let grandTotal = 0;
  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
  });

  let html = `
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Report for ${user.email}</h3>
        <div class="badge badge-neutral">${minutesToHours(grandTotal).toFixed(1)}h total</div>
      </div>
      <div style="overflow-x: scroll; overflow-y: visible;">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Date</th>
              ${projects.map((p) => `<th>${p.name}</th>`).join("")}
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
  `;

  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    html += `
      <tr id="report-row-${userId}-${date}">
        <td style="font-weight: 500;">${date}</td>
        ${projects
          .map((p) => {
            const minutes = grouped[date][p.id] || 0;
            return `<td style="color: ${minutes > 0 ? "var(--text-primary)" : "var(--text-tertiary)"};">${minutesToHours(minutes).toFixed(1)}</td>`;
          })
          .join("")}
        <td style="text-align: right; font-weight: 600; color: var(--accent);">${minutesToHours(dayTotal).toFixed(1)}h</td>
      </tr>
    `;
  });

  html += `
          </tbody>
          <tfoot>
            <tr style="background-color: var(--bg-tertiary);">
              <td style="font-weight: 600;">Total</td>
              ${projects
                .map((p) => {
                  const projectTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][p.id] || 0),
                    0
                  );
                  return `<td style="font-weight: 600; color: var(--accent);">${minutesToHours(projectTotal).toFixed(1)}h</td>`;
                })
                .join("")}
              <td style="text-align: right; font-weight: 700; color: var(--accent);">${minutesToHours(grandTotal).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  return html;
}

function renderProjectReport(projectId: number): string {
  const project = projectModel.getById(projectId);
  if (!project) {
    return '<div class="card"><p style="color: var(--error);">Project not found.</p></div>';
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
    return `<div class="card"><p style="color: var(--text-secondary);">No time entries for project ${project.name}.</p></div>`;
  }

  let grandTotal = 0;
  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
  });

  let html = `
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Report for ${project.name}</h3>
        <div class="badge badge-neutral">${minutesToHours(grandTotal).toFixed(1)}h total</div>
      </div>
      <div style="overflow-x: scroll; overflow-y: visible;">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Date</th>
              ${workers.map((w) => `<th>${w.email}</th>`).join("")}
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
  `;

  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    html += `
      <tr id="report-row-project-${projectId}-${date}">
        <td style="font-weight: 500;">${date}</td>
        ${workers
          .map((w) => {
            const minutes = grouped[date][w.id] || 0;
            return `<td style="color: ${minutes > 0 ? "var(--text-primary)" : "var(--text-tertiary)"};">${minutesToHours(minutes).toFixed(1)}</td>`;
          })
          .join("")}
        <td style="text-align: right; font-weight: 600; color: var(--accent);">${minutesToHours(dayTotal).toFixed(1)}h</td>
      </tr>
    `;
  });

  html += `
          </tbody>
          <tfoot>
            <tr style="background-color: var(--bg-tertiary);">
              <td style="font-weight: 600;">Total</td>
              ${workers
                .map((w) => {
                  const workerTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][w.id] || 0),
                    0
                  );
                  return `<td style="font-weight: 600; color: var(--accent);">${minutesToHours(workerTotal).toFixed(1)}h</td>`;
                })
                .join("")}
              <td style="text-align: right; font-weight: 700; color: var(--accent);">${minutesToHours(grandTotal).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  return html;
}

// Admin projects helper functions
function renderProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll(true);

  const content = `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">Projects</h1>
        <p class="text-sm" style="color: var(--text-secondary);">Manage all projects in the system</p>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Add New Project</h2>
        <form 
          hx-post="/admin/projects"
          hx-target="#projects-list"
          hx-swap="transition:true"
          hx-trigger="submit"
          hx-on::after-request="this.reset()"
          class="flex gap-4"
        >
          <input 
            type="text" 
            name="name" 
            placeholder="Project name" 
            required 
            class="input-modern flex-1"
          />
          <button type="submit" class="btn-primary">Add Project</button>
        </form>
      </div>
      
      <div id="projects-list">
        ${renderProjectsList(projects)}
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "admin_projects");
}

function renderProjectsList(projects: Project[]): string {
  if (projects.length === 0) {
    return '<div class="card"><p style="color: var(--text-secondary);">No projects found.</p></div>';
  }

  return `
    <div class="card">
      <table class="table-modern">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map(
              (project) => `
            <tr id="project-${project.id}" style="${project.suppressed ? "opacity: 0.6;" : ""}">
              <td style="color: var(--text-tertiary); font-size: 13px;">#${project.id}</td>
              <td style="font-weight: 500;">${project.name}</td>
              <td>
                ${project.suppressed ? '<span class="badge badge-neutral">Suppressed</span>' : '<span class="badge badge-success">Active</span>'}
              </td>
              <td style="text-align: right;">
                <button 
                  hx-patch="/admin/projects/${project.id}/suppress"
                  hx-target="#projects-list"
                  hx-swap="transition:true"
                  class="btn-secondary"
                  style="font-size: 13px; padding: 6px 12px;"
                >
                  ${project.suppressed ? "Activate" : "Suppress"}
                </button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// Admin users-projects helper functions
function renderUsersProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll();

  const content = `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">Assign Workers</h1>
        <p class="text-sm" style="color: var(--text-secondary);">Manage worker assignments to projects</p>
      </div>
      
      <div class="card">
        <label for="project-select" class="block text-sm font-medium mb-3" style="color: var(--text-primary);">Select Project</label>
        <select 
          id="project-select"
          hx-get="/admin/users-projects/project"
          hx-target="#project-workers"
          hx-swap="transition:true"
          hx-trigger="change"
          hx-include="[name='project_id']"
          name="project_id"
          class="select-modern w-full"
        >
          <option value="">Select a project</option>
          ${projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
      </div>
      
      <div id="project-workers">
        <div class="card">
          <p style="color: var(--text-secondary); text-align: center; padding: 24px;">Select a project to manage workers.</p>
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

  return `
    <div class="space-y-6">
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Workers assigned to ${project.name}</h2>
        
        <div class="mb-6">
          <h3 class="text-sm font-medium mb-3" style="color: var(--text-secondary);">Add Worker</h3>
          <form 
            hx-post="/admin/users-projects"
            hx-target="#project-workers"
            hx-swap="transition:true"
            hx-trigger="submit"
            hx-on::after-request="this.reset()"
            class="flex gap-4"
          >
            <input type="hidden" name="project_id" value="${projectId}" />
            <select name="user_id" required class="select-modern flex-1">
              <option value="">Select worker</option>
              ${availableWorkers.map((w) => `<option value="${w.id}">${w.email}</option>`).join("")}
            </select>
            <button type="submit" class="btn-primary">Add Worker</button>
          </form>
        </div>
      </div>
      
      <div class="card">
        <h3 class="text-base font-semibold mb-4" style="color: var(--text-primary);">Assigned Workers</h3>
        ${
          projectUsers.length === 0
            ? '<p style="color: var(--text-secondary); text-align: center; padding: 24px;">No workers assigned to this project.</p>'
            : `
          <table class="table-modern">
            <thead>
              <tr>
                <th>Worker Email</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${projectUsers
                .map((pu) => {
                  const worker = userModel.getById(pu.user_id);
                  return `
                  <tr id="project-user-${pu.id}" style="${pu.suppressed ? "opacity: 0.6;" : ""}">
                    <td style="font-weight: 500;">${worker?.email || "Unknown"}</td>
                    <td>
                      ${pu.suppressed ? '<span class="badge badge-neutral">Suppressed</span>' : '<span class="badge badge-success">Active</span>'}
                    </td>
                    <td style="text-align: right;">
                      <button 
                        hx-delete="/admin/users-projects/${pu.id}"
                        hx-target="#project-workers"
                        hx-swap="transition:true"
                        hx-confirm="Remove this worker from the project?"
                        class="btn-danger"
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
        `
        }
      </div>
    </div>
  `;
}

// Admin system reports helper functions
function renderSystemReportsPage(req: AuthStubRequest) {
  const content = `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">System Reports</h1>
        <p class="text-sm" style="color: var(--text-secondary);">Overview of all time tracking data</p>
      </div>
      
      <div id="reports-data" hx-get="/admin/system-reports/data" hx-swap="transition:true" hx-trigger="load">
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

  return `
    <div class="space-y-6">
      <div class="card" style="background: linear-gradient(135deg, rgba(107, 117, 216, 0.08) 0%, rgba(107, 117, 216, 0.04) 100%); border-color: var(--accent);">
        <div class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Total System Hours</div>
        <div class="text-4xl font-bold" style="color: var(--accent);">${totalSystemHours.toFixed(1)}</div>
        <div class="text-sm mt-1" style="color: var(--text-tertiary);">hours tracked</div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Hours by Worker</h2>
        <table class="table-modern">
          <thead>
            <tr>
              <th>Worker</th>
              <th style="text-align: right;">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            ${workers
              .map((w) => {
                const hours = minutesToHours(workerTotals[w.id] || 0);
                return `
                <tr id="system-worker-${w.id}">
                  <td style="font-weight: 500;">${w.email}</td>
                  <td style="text-align: right; font-weight: 600; color: var(--accent);">${hours.toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">Hours by Project</h2>
        <table class="table-modern">
          <thead>
            <tr>
              <th>Project</th>
              <th style="text-align: right;">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            ${projects
              .map((p) => {
                const hours = minutesToHours(projectTotals[p.id] || 0);
                return `
                <tr id="system-project-${p.id}">
                  <td style="font-weight: 500;">${p.name}</td>
                  <td style="text-align: right; font-weight: 600; color: var(--accent);">${hours.toFixed(1)}h</td>
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

    const html = renderTimeTrackingPage(authReq);

    return {
      status: 200,
      body: html,
    };
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
      const html = renderProjectsList(projects);
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
    const html = renderProjectsList(projects);
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
