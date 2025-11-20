import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { Project } from "@/shared/models/project.js";
import { adminProjectsContract } from "../contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

export function EditProject(
  project: Project,
  req: AuthContext,
  errorMessage?: string
): JSX.Element {
  return (
    <div id="edit-project" hx-target="this" hx-swap="outerHTML">
      {errorMessage ? (
        <div class="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded">
          <span safe>{errorMessage}</span>
        </div>
      ) : null}
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Project</h1>
        <p class="text-gray-600 dark:text-gray-400">Update project details</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form
          hx-patch={tsBuildUrl(adminProjectsContract.update, {
            params: { id: project.id },
            headers: {},
          })}
          hx-target="body"
          hx-push-url={tsBuildUrl(adminProjectsContract.list, {
            headers: {},
          })}
          class="space-y-6"
        >
          <div>
            <label
              for="project-name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project Name
            </label>
            <input
              type="text"
              id="project-name"
              name="name"
              value={project.name}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label
              for="project-color"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Color
            </label>
            <div class="flex items-center gap-4">
              <input
                type="color"
                id="project-color"
                name="color"
                value={project.color}
                class="w-20 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
              />
            </div>
          </div>

          {!project.isSystem && (
            <div>
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="suppressed"
                  value="true"
                  checked={project.suppressed}
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suppressed (hidden from users)
                </span>
              </label>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Suppressed projects are hidden from users but their history is preserved
              </p>
            </div>
          )}

          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
            <a
              href={tsBuildUrl(adminProjectsContract.list, {
                headers: {},
              })}
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 no-underline"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
