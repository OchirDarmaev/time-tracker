import { Router, Response } from "express";
import { AuthStubRequest, requireRole } from "../../middleware/auth_stub.js";
import { timeEntryModel } from "../../models/time_entry.js";
import { userModel } from "../../models/user.js";
import { projectModel } from "../../models/project.js";
import { minutesToHours } from "../../utils/date_utils.js";
import { renderBaseLayout } from "../../utils/layout.js";

const router = Router();

function renderSystemReportsPage(req: AuthStubRequest, res: Response) {
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">System Reports</h1>
      
      <div id="reports-data" hx-get="/admin/system-reports/data" hx-trigger="load">
        ${renderSystemReports()}
      </div>
    </div>
  `;

  res.send(renderBaseLayout(content, req, "admin_reports"));
}

function renderSystemReports(): string {
  const allEntries = timeEntryModel.getAll();
  const workers = userModel.getWorkers();
  const projects = projectModel.getAll();

  // Calculate totals by worker
  const workerTotals: Record<number, number> = {};
  workers.forEach((w) => {
    const entries = timeEntryModel.getByUserId(w.id);
    workerTotals[w.id] = entries.reduce((sum, e) => sum + e.minutes, 0);
  });

  // Calculate totals by project
  const projectTotals: Record<number, number> = {};
  projects.forEach((p) => {
    const entries = timeEntryModel.getByProjectId(p.id);
    projectTotals[p.id] = entries.reduce((sum, e) => sum + e.minutes, 0);
  });

  // Calculate total system hours
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
            ${workers
              .map((w) => {
                const hours = minutesToHours(workerTotals[w.id] || 0);
                return `
                <tr>
                  <td class="border border-gray-300 px-4 py-2">${w.email}</td>
                  <td class="border border-gray-300 px-4 py-2">${hours.toFixed(1)}</td>
                </tr>
              `;
              })
              .join("")}
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
            ${projects
              .map((p) => {
                const hours = minutesToHours(projectTotals[p.id] || 0);
                return `
                <tr>
                  <td class="border border-gray-300 px-4 py-2">${p.name}</td>
                  <td class="border border-gray-300 px-4 py-2">${hours.toFixed(1)}</td>
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

router.get("/", requireRole("admin"), (req: AuthStubRequest, res: Response) => {
  renderSystemReportsPage(req, res);
});

router.get("/data", requireRole("admin"), (req: AuthStubRequest, res: Response) => {
  res.send(renderSystemReports());
});

export default router;
