import { initServer } from '@ts-rest/express';
import { apiContract } from './contracts/api.js';
import { AuthStubRequest } from './middleware/auth_stub.js';
import { userModel, UserRole } from './models/user.js';
import { timeEntryModel } from './models/time_entry.js';
import { projectModel } from './models/project.js';
import { projectUserModel } from './models/project_user.js';
import { formatDate, getMonthFromDate, minutesToHours, getWorkingDaysInMonth, parseDate } from './utils/date_utils.js';
import { validateDate, validateMinutes, validateProjectName } from './utils/validation.js';
import { renderBaseLayout } from './utils/layout.js';

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
  
  const dailyWarning = totalHours < 8;
  const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;
  
  const content = `
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
      
      <div id="entries-container" hx-get="/worker/time/entries?date=${selectedDate}" hx-trigger="load, entries-changed from:body">
        ${renderEntriesTable(entries, projects)}
      </div>
      
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Add Entry</h2>
        <form 
          hx-post="/worker/time/entries"
          hx-target="#entries-container"
          hx-swap="innerHTML"
          hx-trigger="submit"
          hx-on::after-request="document.getElementById('add-entry-form').reset(); htmx.trigger('body', 'entries-changed')"
          id="add-entry-form"
          class="grid grid-cols-4 gap-4"
        >
          <input type="hidden" name="date" value="${selectedDate}" />
          <select name="project_id" required class="border rounded px-3 py-2">
            <option value="">Select Project</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <input 
            type="number" 
            name="hours" 
            step="0.5" 
            min="0.5" 
            max="24" 
            placeholder="Hours" 
            required 
            class="border rounded px-3 py-2"
          />
          <input 
            type="text" 
            name="comment" 
            placeholder="Comment (e.g., #meeting #setup)" 
            class="border rounded px-3 py-2"
          />
          <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Add Entry</button>
        </form>
      </div>
      
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Summary</h2>
        <div id="summary-container" hx-get="/worker/time/summary?date=${selectedDate}" hx-trigger="load, entries-changed from:body">
          ${renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, dailyWarning, monthlyWarning)}
        </div>
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'worker');
}

function renderEntriesTable(entries: any[], projects: any[]): string {
  if (entries.length === 0) {
    return '<p class="text-gray-500">No entries for this date.</p>';
  }
  
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  
  return `
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
        ${entries.map(entry => `
          <tr>
            <td class="border border-gray-300 px-4 py-2">${projectMap.get(entry.project_id) || 'Unknown'}</td>
            <td class="border border-gray-300 px-4 py-2">${minutesToHours(entry.minutes).toFixed(1)}</td>
            <td class="border border-gray-300 px-4 py-2">${entry.comment || ''}</td>
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
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderSummary(totalHours: number, monthlyTotalHours: number, requiredMonthlyHours: number, dailyWarning: boolean, monthlyWarning: boolean): string {
  return `
    <div class="space-y-4">
      <div class="p-4 border rounded ${dailyWarning ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}">
        <div class="flex items-center justify-between">
          <span class="font-semibold">Daily Total: ${totalHours.toFixed(1)} hours</span>
          ${dailyWarning ? '<span class="text-red-600">❗ Less than 8 hours</span>' : '<span class="text-green-600">✓ Complete</span>'}
        </div>
      </div>
      <div class="p-4 border rounded ${monthlyWarning ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}">
        <div class="flex items-center justify-between">
          <span class="font-semibold">Monthly Total: ${monthlyTotalHours.toFixed(1)} / ${requiredMonthlyHours} hours</span>
          ${monthlyWarning ? '<span class="text-yellow-600">⚠️ Below target</span>' : '<span class="text-green-600">✓ On track</span>'}
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
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Reports</h1>
      
      <div class="grid grid-cols-2 gap-8">
        <div>
          <h2 class="text-xl font-semibold mb-4">View by Worker</h2>
          <select 
            id="worker-select"
            hx-get="/manager/reports/worker"
            hx-target="#report-content"
            hx-trigger="change"
            hx-include="[name='worker_id']"
            name="worker_id"
            class="w-full border rounded px-3 py-2 mb-4"
          >
            <option value="">Select Worker</option>
            ${workers.map(w => `<option value="${w.id}">${w.email}</option>`).join('')}
          </select>
        </div>
        
        <div>
          <h2 class="text-xl font-semibold mb-4">View by Project</h2>
          <select 
            id="project-select"
            hx-get="/manager/reports/project"
            hx-target="#report-content"
            hx-trigger="change"
            hx-include="[name='project_id']"
            name="project_id"
            class="w-full border rounded px-3 py-2 mb-4"
          >
            <option value="">Select Project</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
      </div>
      
      <div id="report-content" class="mt-8">
        <p class="text-gray-500">Select a worker or project to view reports.</p>
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'manager');
}

function renderWorkerReport(userId: number): string {
  const user = userModel.getById(userId);
  if (!user) {
    return '<p class="text-red-500">Worker not found.</p>';
  }
  
  const entries = timeEntryModel.getByUserId(userId);
  const projects = projectModel.getAll();
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  
  const grouped: Record<string, Record<number, number>> = {};
  entries.forEach(entry => {
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
    return `<p class="text-gray-500">No time entries for ${user.email}.</p>`;
  }
  
  let html = `
    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-4">Report for ${user.email}</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2">Date</th>
            ${projects.map(p => `<th class="border border-gray-300 px-4 py-2">${p.name}</th>`).join('')}
            <th class="border border-gray-300 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  let grandTotal = 0;
  dates.forEach(date => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
    html += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${date}</td>
        ${projects.map(p => {
          const minutes = grouped[date][p.id] || 0;
          return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(minutes).toFixed(1)}</td>`;
        }).join('')}
        <td class="border border-gray-300 px-4 py-2 font-semibold">${minutesToHours(dayTotal).toFixed(1)}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 font-semibold">
            <td class="border border-gray-300 px-4 py-2">Total</td>
            ${projects.map(p => {
              const projectTotal = dates.reduce((sum, date) => sum + (grouped[date][p.id] || 0), 0);
              return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(projectTotal).toFixed(1)}</td>`;
            }).join('')}
            <td class="border border-gray-300 px-4 py-2">${minutesToHours(grandTotal).toFixed(1)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
  
  return html;
}

function renderProjectReport(projectId: number): string {
  const project = projectModel.getById(projectId);
  if (!project) {
    return '<p class="text-red-500">Project not found.</p>';
  }
  
  const entries = timeEntryModel.getByProjectId(projectId);
  const workers = userModel.getWorkers();
  const workerMap = new Map(workers.map(w => [w.id, w.email]));
  
  const grouped: Record<string, Record<number, number>> = {};
  entries.forEach(entry => {
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
    return `<p class="text-gray-500">No time entries for project ${project.name}.</p>`;
  }
  
  let html = `
    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-4">Report for ${project.name}</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2">Date</th>
            ${workers.map(w => `<th class="border border-gray-300 px-4 py-2">${w.email}</th>`).join('')}
            <th class="border border-gray-300 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  let grandTotal = 0;
  dates.forEach(date => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
    html += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${date}</td>
        ${workers.map(w => {
          const minutes = grouped[date][w.id] || 0;
          return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(minutes).toFixed(1)}</td>`;
        }).join('')}
        <td class="border border-gray-300 px-4 py-2 font-semibold">${minutesToHours(dayTotal).toFixed(1)}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 font-semibold">
            <td class="border border-gray-300 px-4 py-2">Total</td>
            ${workers.map(w => {
              const workerTotal = dates.reduce((sum, date) => sum + (grouped[date][w.id] || 0), 0);
              return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(workerTotal).toFixed(1)}</td>`;
            }).join('')}
            <td class="border border-gray-300 px-4 py-2">${minutesToHours(grandTotal).toFixed(1)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
  
  return html;
}

// Admin projects helper functions
function renderProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll(true);
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Manage Projects</h1>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Add New Project</h2>
        <form 
          hx-post="/admin/projects"
          hx-target="#projects-list"
          hx-swap="innerHTML"
          hx-trigger="submit"
          hx-on::after-request="this.reset()"
          class="flex gap-4"
        >
          <input 
            type="text" 
            name="name" 
            placeholder="Project name" 
            required 
            class="border rounded px-3 py-2 flex-1"
          />
          <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Add Project</button>
        </form>
      </div>
      
      <div id="projects-list">
        ${renderProjectsList(projects)}
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'admin_projects');
}

function renderProjectsList(projects: any[]): string {
  if (projects.length === 0) {
    return '<p class="text-gray-500">No projects found.</p>';
  }
  
  return `
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2">ID</th>
          <th class="border border-gray-300 px-4 py-2">Name</th>
          <th class="border border-gray-300 px-4 py-2">Status</th>
          <th class="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(project => `
          <tr class="${project.suppressed ? 'bg-gray-50' : ''}">
            <td class="border border-gray-300 px-4 py-2">${project.id}</td>
            <td class="border border-gray-300 px-4 py-2">${project.name}</td>
            <td class="border border-gray-300 px-4 py-2">
              ${project.suppressed ? '<span class="text-gray-500">Suppressed</span>' : '<span class="text-green-600">Active</span>'}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <button 
                hx-patch="/admin/projects/${project.id}/suppress"
                hx-target="#projects-list"
                hx-swap="innerHTML"
                class="text-blue-500 hover:text-blue-700 mr-2"
              >
                ${project.suppressed ? 'Activate' : 'Suppress'}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Admin users-projects helper functions
function renderUsersProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll();
  const workers = userModel.getWorkers();
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Manage Workers in Projects</h1>
      
      <div class="mb-6">
        <label for="project-select" class="block text-sm font-medium mb-2">Select Project</label>
        <select 
          id="project-select"
          hx-get="/admin/users-projects/project"
          hx-target="#project-workers"
          hx-trigger="change"
          hx-include="[name='project_id']"
          name="project_id"
          class="w-full border rounded px-3 py-2"
        >
          <option value="">Select a project</option>
          ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
      
      <div id="project-workers">
        <p class="text-gray-500">Select a project to manage workers.</p>
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'admin_users');
}

function renderProjectWorkers(projectId: number): string {
  const project = projectModel.getById(projectId);
  if (!project) {
    return '<p class="text-red-500">Project not found.</p>';
  }
  
  const projectUsers = projectUserModel.getByProjectId(projectId, true);
  const allWorkers = userModel.getWorkers();
  const assignedWorkerIds = new Set(projectUsers.map(pu => pu.user_id));
  const availableWorkers = allWorkers.filter(w => !assignedWorkerIds.has(w.id));
  
  return `
    <div class="mt-4">
      <h2 class="text-xl font-semibold mb-4">Workers assigned to ${project.name}</h2>
      
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Add Worker</h3>
        <form 
          hx-post="/admin/users-projects"
          hx-target="#project-workers"
          hx-swap="innerHTML"
          hx-trigger="submit"
          hx-on::after-request="this.reset()"
          class="flex gap-4"
        >
          <input type="hidden" name="project_id" value="${projectId}" />
          <select name="user_id" required class="border rounded px-3 py-2 flex-1">
            <option value="">Select worker</option>
            ${availableWorkers.map(w => `<option value="${w.id}">${w.email}</option>`).join('')}
          </select>
          <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Add Worker</button>
        </form>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold mb-2">Assigned Workers</h3>
        ${projectUsers.length === 0 ? '<p class="text-gray-500">No workers assigned to this project.</p>' : `
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 px-4 py-2">Worker Email</th>
                <th class="border border-gray-300 px-4 py-2">Status</th>
                <th class="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${projectUsers.map(pu => {
                const worker = userModel.getById(pu.user_id);
                return `
                  <tr class="${pu.suppressed ? 'bg-gray-50' : ''}">
                    <td class="border border-gray-300 px-4 py-2">${worker?.email || 'Unknown'}</td>
                    <td class="border border-gray-300 px-4 py-2">
                      ${pu.suppressed ? '<span class="text-gray-500">Suppressed</span>' : '<span class="text-green-600">Active</span>'}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <button 
                        hx-delete="/admin/users-projects/${pu.id}"
                        hx-target="#project-workers"
                        hx-swap="innerHTML"
                        hx-confirm="Remove this worker from the project?"
                        class="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

// Admin system reports helper functions
function renderSystemReportsPage(req: AuthStubRequest) {
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">System Reports</h1>
      
      <div id="reports-data" hx-get="/admin/system-reports/data" hx-trigger="load">
        ${renderSystemReports()}
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'admin_reports');
}

function renderSystemReports(): string {
  const allEntries = timeEntryModel.getAll();
  const workers = userModel.getWorkers();
  const projects = projectModel.getAll();
  
  const workerTotals: Record<number, number> = {};
  workers.forEach(w => {
    const entries = timeEntryModel.getByUserId(w.id);
    workerTotals[w.id] = entries.reduce((sum, e) => sum + e.minutes, 0);
  });
  
  const projectTotals: Record<number, number> = {};
  projects.forEach(p => {
    const entries = timeEntryModel.getByProjectId(p.id);
    projectTotals[p.id] = entries.reduce((sum, e) => sum + e.minutes, 0);
  });
  
  const totalSystemHours = minutesToHours(allEntries.reduce((sum, e) => sum + e.minutes, 0));
  
  return `
    <div class="space-y-8">
      <div class="p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 class="text-xl font-semibold mb-2">Total System Hours</h2>
        <p class="text-2xl font-bold">${totalSystemHours.toFixed(1)} hours</p>
      </div>
      
      <div>
        <h2 class="text-xl font-semibold mb-4">Hours by Worker</h2>
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">Worker</th>
              <th class="border border-gray-300 px-4 py-2">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            ${workers.map(w => {
              const hours = minutesToHours(workerTotals[w.id] || 0);
              return `
                <tr>
                  <td class="border border-gray-300 px-4 py-2">${w.email}</td>
                  <td class="border border-gray-300 px-4 py-2">${hours.toFixed(1)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      
      <div>
        <h2 class="text-xl font-semibold mb-4">Hours by Project</h2>
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">Project</th>
              <th class="border border-gray-300 px-4 py-2">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => {
              const hours = minutesToHours(projectTotals[p.id] || 0);
              return `
                <tr>
                  <td class="border border-gray-300 px-4 py-2">${p.name}</td>
                  <td class="border border-gray-300 px-4 py-2">${hours.toFixed(1)}</td>
                </tr>
              `;
            }).join('')}
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
    }
    const referer = authReq.get('Referer') || '/';
    res.redirect(referer);
    
    return {
      status: 302,
      body: undefined,
    };
  },
  
  setRole: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const role = body.role;
    if (role && ['worker', 'office-manager', 'admin'].includes(role)) {
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
    const referer = authReq.get('Referer') || '/';
    res.redirect(referer);
      return {
      status: 302,
      body: undefined,
    };
  },
  
  // Root redirect
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.roles.includes('admin')) {
        res.redirect('/admin/projects');
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes('office-manager')) {
        res.redirect('/manager/reports');
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes('worker')) {
        res.redirect('/worker/time');
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.redirect('/');
    return {
      status: 302,
      body: undefined,
    };
  },
  
  // Worker time routes
  workerTime: async ({ query, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: { body: 'Unauthorized' },
      };
    }
    if (!authReq.currentUser.roles.includes('worker')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const html = renderTimeTrackingPage(authReq);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  workerTimeEntries: async ({ query, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: { body: 'Unauthorized' },
      };
    }
    if (!authReq.currentUser.roles.includes('worker')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const currentUser = authReq.currentUser;
    const date = (query?.date as string) || formatDate(new Date());
    
    if (!validateDate(date)) {
      res.status(400).send('Invalid date');
      return {
        status: 400,
        body: { body: 'Invalid date' },
      };
    }
    
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  createTimeEntry: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: { body: 'Unauthorized' },
      };
    }
    if (!authReq.currentUser.roles.includes('worker')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const currentUser = authReq.currentUser;
    const { project_id, date, hours, comment } = body;
    
    if (!validateDate(date)) {
      res.status(400).send('Invalid date');
      return {
        status: 400,
        body: { body: 'Invalid date' },
      };
    }
    
    const minutes = Math.round(parseFloat(hours) * 60);
    if (!validateMinutes(minutes)) {
      res.status(400).send('Invalid hours');
      return {
        status: 400,
        body: { body: 'Invalid hours' },
      };
    }
    
    const project = projectModel.getById(parseInt(project_id));
    if (!project) {
      res.status(400).send('Invalid project');
      return {
        status: 400,
        body: { body: 'Invalid project' },
      };
    }
    
    const userProjects = projectModel.getByUserId(currentUser.id);
    if (!userProjects.find(p => p.id === project.id)) {
      res.status(403).send('Access denied to this project');
      return {
        status: 403,
        body: { body: 'Access denied to this project' },
      };
    }
    
    timeEntryModel.create(currentUser.id, project.id, date, minutes, comment || null);
    
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  deleteTimeEntry: async ({ params, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: { body: 'Unauthorized' },
      };
    }
    if (!authReq.currentUser.roles.includes('worker')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const currentUser = authReq.currentUser;
    const entryId = parseInt(params.id);
    
    const entry = timeEntryModel.getById(entryId);
    if (!entry) {
      res.status(404).send('Entry not found');
      return {
        status: 404,
        body: { body: 'Entry not found' },
      };
    }
    
    if (entry.user_id !== currentUser.id) {
      res.status(403).send('Access denied');
      return {
        status: 403,
        body: { body: 'Access denied' },
      };
    }
    
    timeEntryModel.delete(entryId);
    
    const date = entry.date;
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  workerTimeSummary: async ({ query, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: { body: 'Unauthorized' },
      };
    }
    if (!authReq.currentUser.roles.includes('worker')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const currentUser = authReq.currentUser;
    const date = (query?.date as string) || formatDate(new Date());
    
    if (!validateDate(date)) {
      res.status(400).send('Invalid date');
      return {
        status: 400,
        body: { body: 'Invalid date' },
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
    
    const dailyWarning = totalHours < 8;
    const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;
    
    const html = renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, dailyWarning, monthlyWarning);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  // Manager reports routes
  managerReports: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('office-manager') && !authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const html = renderReportsPage(authReq);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  managerReportsWorker: async ({ query, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('office-manager') && !authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const userId = parseInt(query?.worker_id as string);
    if (!userId) {
      res.status(200).send('<p class="text-gray-500">Select a worker to view reports.</p>');
      return {
        status: 200,
        body: undefined,
      };
    }
    const html = renderWorkerReport(userId);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  managerReportsProject: async ({ query, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('office-manager') && !authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      res.status(200).send('<p class="text-gray-500">Select a project to view reports.</p>');
      return {
        status: 200,
        body: undefined,
      };
    }
    const html = renderProjectReport(projectId);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  // Admin projects routes
  adminProjects: async ({ req , res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const html = renderProjectsPage(authReq);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  createProject: async ({ body, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const { name } = body;
    
    if (!validateProjectName(name)) {
      res.status(400).send('Invalid project name');
      return {
        status: 400,
        body: { body: 'Invalid project name' },
      };
    }
    
    try {
      projectModel.create(name.trim());
      const projects = projectModel.getAll(true);
      const html = renderProjectsList(projects);
      res.status(200).send(html);
      return {
        status: 200,
        body: undefined,
      };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        res.status(400).send('Project name already exists');
        return {
          status: 400,
          body: { body: 'Project name already exists' },
        };
      }
      res.status(500).send('Error creating project');
      return {
        status: 500,
        body: { body: 'Error creating project' },
      };
    }
  },
  
  toggleProjectSuppress: async ({ params, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const id = parseInt(params.id);
    projectModel.toggleSuppress(id);
    const projects = projectModel.getAll(true);
    const html = renderProjectsList(projects);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  // Admin users-projects routes
  adminUsersProjects: async ({ req , res }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const html = renderUsersProjectsPage(authReq);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  adminUsersProjectsProject: async ({ query, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      res.status(200).send('<p class="text-gray-500">Select a project to manage workers.</p>');
      return {
        status: 200,
        body: undefined,
      };
    }
    const html = renderProjectWorkers(projectId);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  assignWorkerToProject: async ({ body, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const { project_id, user_id } = body;
    const projectId = parseInt(project_id as string);
    const userId = user_id;
    
    if (!projectId || !userId) {
      res.status(400).send('Invalid project or user ID');
      return {
        status: 400,
        body: { body: 'Invalid project or user ID' },
      };
    }
    
    try {
      projectUserModel.create(userId, projectId);
      const html = renderProjectWorkers(projectId);
      res.status(200).send(html);
      return {
        status: 200,
        body: undefined,
      };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        res.status(400).send('Worker already assigned to this project');
        return {
          status: 400,
          body: { body: 'Worker already assigned to this project' },
        };
      }
      res.status(500).send('Error assigning worker');
      return {
        status: 500,
        body: { body: 'Error assigning worker' },
      };
    }
  },
  
  removeWorkerFromProject: async ({ params, req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const id = parseInt(params.id);
    
    const allProjects = projectModel.getAll(true);
    let projectUser: any = null;
    for (const project of allProjects) {
      const projectUsers = projectUserModel.getByProjectId(project.id, true);
      const found = projectUsers.find(pu => pu.id === id);
      if (found) {
        projectUser = found;
        break;
      }
    }
    
    if (!projectUser) {
      res.status(404).send('Assignment not found');
      return {
        status: 404,
        body: { body: 'Assignment not found' },
      };
    }
    
    projectUserModel.delete(id);
    const html = renderProjectWorkers(projectUser.project_id);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  // Admin system reports routes
  adminSystemReports: async ({ req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const html = renderSystemReportsPage(authReq);
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
  
  adminSystemReportsData: async ({ req, res  }) => {
    const authReq = req as unknown as AuthStubRequest;
    
    if (!authReq.currentUser) {
      res.status(401).send('Unauthorized');
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes('admin')) {
      res.status(403).send('Forbidden');
      return {
        status: 403,
        body: { body: 'Forbidden' },
      };
    }
    
    const html = renderSystemReports();
    res.status(200).send(html);
    return {
      status: 200,
      body: undefined,
    };
  },
});

