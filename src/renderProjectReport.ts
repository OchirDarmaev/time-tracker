import { html } from "./utils/html";
import { projectModel } from "./models/project";
import { timeEntryModel } from "./models/time_entry";
import { userModel } from "./models/user";
import { minutesToHours } from "./utils/date_utils";

export function renderProjectReport(projectId: number): string {
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
