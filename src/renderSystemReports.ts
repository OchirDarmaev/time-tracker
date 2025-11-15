import { html } from "./utils/html";
import { projectModel } from "./models/project";
import { timeEntryModel } from "./models/time_entry";
import { userModel } from "./models/user";
import { minutesToHours } from "./utils/date_utils";

export function renderSystemReports(): string {
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
