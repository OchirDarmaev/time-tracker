import { html } from "../../../../shared/utils/html.js";
import { projectModel } from "../../../../shared/models/project.js";
import { projectUserModel } from "../../../../shared/models/project_user.js";
import { userModel } from "../../../../shared/models/user.js";

export function renderProjectWorkers(projectId: number): string {
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
