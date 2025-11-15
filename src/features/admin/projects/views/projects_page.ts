import { html } from "../../../../shared/utils/html.js";
import { AuthStubRequest } from "../../../../shared/middleware/auth_stub.js";
import { projectModel } from "../../../../shared/models/project.js";
import { renderBaseLayout } from "../../../../shared/utils/layout.js";
import { renderProjectList } from "../../../../shared/views/components/project_list_component.js";

export function renderProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll(true);

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
          hx-target="#projects-list"
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

      ${renderProjectList({
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          suppressed: p.suppressed || false,
        })),
      })}
    </div>
  `;

  return renderBaseLayout(content, req, "admin_projects");
}
