import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { adminProjectsContract } from "../contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

export function CreateProject(req: AuthContext, errorMessage?: string): JSX.Element {
  return (
    <div id="create-project" hx-target="this" hx-swap="outerHTML">
      {errorMessage ? (
        <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800 dark:text-red-200" safe>
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Project</h1>
        <p class="text-gray-600 dark:text-gray-400">Add a new project for time tracking</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form
          hx-post={tsBuildUrl(adminProjectsContract.create, {})}
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
              required
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., Marketing Campaign, Product Development"
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
                value="#14b8a6"
                oninput="document.getElementById('color-value').textContent = this.value"
                class="w-20 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
              />
              <div class="flex-1 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <span class="text-xs font-mono text-gray-600 dark:text-gray-400" id="color-value">
                  #14b8a6
                </span>
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Choose a color to help identify this project visually
            </p>
          </div>

          <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            >
              Create Project
            </button>
            <a
              href={tsBuildUrl(adminProjectsContract.list, {
                headers: {},
              })}
              class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 no-underline transition-all"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
