import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { Project } from "@/shared/models/project.js";
import { adminProjectsContract } from "../contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

export function ProjectsList(
  projects: Project[],
  req: AuthContext,
  errorMessage?: string
): JSX.Element {
  return (
    <div id="projects-list" hx-target="this" hx-swap="outerHTML">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Project Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Create and manage projects for time tracking
          </p>
        </div>
        <a
          href={tsBuildUrl(adminProjectsContract.createPage, {
            headers: {},
          })}
          class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all no-underline inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Project
        </a>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Projects ({projects.length})
          </h2>
        </div>
        {projects.length === 0 ? (
          <div class="px-6 py-16 text-center">
            <svg
              class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">No projects</h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new project above.
            </p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project) => (
                  <tr
                    class={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      project.suppressed ? "opacity-60" : ""
                    }`}
                    id={`project-row-${project.id}`}
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-4 h-4 rounded flex-shrink-0"
                          style={`background-color: ${project.color}`}
                        ></div>
                        <span safe class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                          project.suppressed
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {project.suppressed ? "Suppressed" : "Active"}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {project.isSystem ? (
                        <span
                          class="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                          title="System project - cannot be edited or suppressed"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          System
                        </span>
                      ) : (
                        <span class="text-xs text-gray-500 dark:text-gray-500">Custom</span>
                      )}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        {!project.isSystem && (
                          <>
                            <a
                              href={tsBuildUrl(adminProjectsContract.edit, {
                                params: { id: project.id },
                                headers: {},
                              })}
                              class="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors no-underline"
                            >
                              Edit
                            </a>
                            <button
                              hx-patch={tsBuildUrl(adminProjectsContract.toggleSuppress, {
                                params: { id: project.id },
                              })}
                              hx-target="#projects-list"
                              hx-swap="outerHTML"
                              class={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                project.suppressed
                                  ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  : "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              }`}
                            >
                              {project.suppressed ? "Restore" : "Suppress"}
                            </button>
                          </>
                        )}
                        {project.isSystem && (
                          <span class="text-xs text-gray-400 dark:text-gray-500 italic">
                            Read-only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
