import { html } from "../../../../shared/utils/html.js";
import { AuthStubRequest } from "../../../../shared/middleware/auth_stub.js";
import { projectModel } from "../../../../shared/models/project.js";
import { renderBaseLayout } from "../../../../shared/utils/layout.js";

export function renderUsersProjectsPage(req: AuthStubRequest) {
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
