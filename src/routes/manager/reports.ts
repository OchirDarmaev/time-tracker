import { Router, Response } from "express";
import { AuthStubRequest, requireRole } from "../../middleware/auth_stub.js";
import { timeEntryModel } from "../../models/time_entry.js";
import { userModel } from "../../models/user.js";
import { projectModel } from "../../models/project.js";
import { minutesToHours } from "../../utils/date_utils.js";
import { renderBaseLayout } from "../../utils/layout.js";

const router = Router();

function renderReportsPage(req: AuthStubRequest, res: Response) {
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
            ${workers.map((w) => `<option value="${w.id}">${w.email}</option>`).join("")}
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
            ${projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div id="report-content" class="mt-8">
        <p class="text-gray-500">Select a worker or project to view reports.</p>
      </div>
    </div>
  `;

  res.send(renderBaseLayout(content, req, "manager"));
}

function renderWorkerReport(userId: number): string {
  const user = userModel.getById(userId);
  if (!user) {
    return '<p class="text-red-500">Worker not found.</p>';
  }

  const entries = timeEntryModel.getByUserId(userId);
  const projects = projectModel.getAll();

  // Group by date and project
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
    return `<p class="text-gray-500">No time entries for ${user.email}.</p>`;
  }

  let html = `
    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-4">Report for ${user.email}</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2">Date</th>
            ${projects.map((p) => `<th class="border border-gray-300 px-4 py-2">${p.name}</th>`).join("")}
            <th class="border border-gray-300 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  let grandTotal = 0;
  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
    html += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${date}</td>
        ${projects
          .map((p) => {
            const minutes = grouped[date][p.id] || 0;
            return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(minutes).toFixed(1)}</td>`;
          })
          .join("")}
        <td class="border border-gray-300 px-4 py-2 font-semibold">${minutesToHours(dayTotal).toFixed(1)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 font-semibold">
            <td class="border border-gray-300 px-4 py-2">Total</td>
            ${projects
              .map((p) => {
                const projectTotal = dates.reduce(
                  (sum, date) => sum + (grouped[date][p.id] || 0),
                  0
                );
                return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(projectTotal).toFixed(1)}</td>`;
              })
              .join("")}
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

  // Group by date and user
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
    return `<p class="text-gray-500">No time entries for project ${project.name}.</p>`;
  }

  let html = `
    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-4">Report for ${project.name}</h3>
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2">Date</th>
            ${workers.map((w) => `<th class="border border-gray-300 px-4 py-2">${w.email}</th>`).join("")}
            <th class="border border-gray-300 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  let grandTotal = 0;
  dates.forEach((date) => {
    const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
    grandTotal += dayTotal;
    html += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${date}</td>
        ${workers
          .map((w) => {
            const minutes = grouped[date][w.id] || 0;
            return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(minutes).toFixed(1)}</td>`;
          })
          .join("")}
        <td class="border border-gray-300 px-4 py-2 font-semibold">${minutesToHours(dayTotal).toFixed(1)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
        <tfoot>
          <tr class="bg-gray-100 font-semibold">
            <td class="border border-gray-300 px-4 py-2">Total</td>
            ${workers
              .map((w) => {
                const workerTotal = dates.reduce(
                  (sum, date) => sum + (grouped[date][w.id] || 0),
                  0
                );
                return `<td class="border border-gray-300 px-4 py-2">${minutesToHours(workerTotal).toFixed(1)}</td>`;
              })
              .join("")}
            <td class="border border-gray-300 px-4 py-2">${minutesToHours(grandTotal).toFixed(1)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  return html;
}

router.get("/", requireRole("office-manager", "admin"), (req: AuthStubRequest, res: Response) => {
  renderReportsPage(req, res);
});

router.get(
  "/worker",
  requireRole("office-manager", "admin"),
  (req: AuthStubRequest, res: Response) => {
    const userId = parseInt(req.query.worker_id as string);
    if (!userId) {
      return res.send('<p class="text-gray-500">Select a worker to view reports.</p>');
    }
    res.send(renderWorkerReport(userId));
  }
);

router.get(
  "/project",
  requireRole("office-manager", "admin"),
  (req: AuthStubRequest, res: Response) => {
    const projectId = parseInt(req.query.project_id as string);
    if (!projectId) {
      return res.send('<p class="text-gray-500">Select a project to view reports.</p>');
    }
    res.send(renderProjectReport(projectId));
  }
);

export default router;
