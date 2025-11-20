import { Project } from "@/shared/models/project.js";
import { adminProjectsContract } from "../contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

export function ProjectsList(projects: Project[]): JSX.Element {
  return (
    <div id="projects-list" hx-target="this" hx-swap="outerHTML">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
            Project Management
          </h1>
          <p style="color: var(--text-secondary);">Create and manage projects for time tracking</p>
        </div>
        <div class="flex items-center gap-3">
          <a
            href={tsBuildUrl(adminProjectsContract.manageUsers, {
              headers: {},
            })}
            class="px-4 py-2.5 font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 transition-all no-underline inline-flex items-center gap-2"
            style="background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border);"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Manage Users
          </a>
          <a
            href={tsBuildUrl(adminProjectsContract.createPage, {
              headers: {},
            })}
            class="px-4 py-2.5 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 transition-all no-underline inline-flex items-center gap-2"
            style="background-color: var(--accent);"
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
      </div>

      <div
        class="rounded-xl shadow-sm overflow-hidden"
        style="background-color: var(--bg-secondary); border: 1px solid var(--border);"
      >
        <div
          class="px-6 py-4"
          style="border-bottom: 1px solid var(--border); background-color: var(--bg-tertiary);"
        >
          <h2 class="text-lg font-semibold" style="color: var(--text-primary);">
            Projects ({projects.length})
          </h2>
        </div>
        {projects.length === 0 ? (
          <div class="px-6 py-16 text-center">
            <svg
              class="mx-auto h-12 w-12"
              style="color: var(--text-tertiary);"
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
            <h3 class="mt-4 text-sm font-medium" style="color: var(--text-primary);">
              No projects
            </h3>
            <p class="mt-2 text-sm" style="color: var(--text-tertiary);">
              Get started by creating a new project above.
            </p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y" style="border-color: var(--border);">
              <thead style="background-color: var(--bg-tertiary);">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style="color: var(--text-secondary);"
                  >
                    Project
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style="color: var(--text-secondary);"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style="color: var(--text-secondary);"
                  >
                    Type
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                    style="color: var(--text-secondary);"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                class="divide-y"
                style="background-color: var(--bg-secondary); border-color: var(--border);"
              >
                {projects.map((project) => (
                  <tr
                    class={`transition-colors ${project.suppressed ? "opacity-60" : ""}`}
                    style="border-color: var(--border);"
                    id={`project-row-${project.id}`}
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-4 h-4 rounded flex-shrink-0"
                          style={`background-color: ${project.color}`}
                        ></div>
                        <span safe class="text-sm font-medium" style="color: var(--text-primary);">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full"
                        style={
                          project.suppressed
                            ? "background-color: var(--bg-tertiary); color: var(--text-secondary);"
                            : "background-color: rgba(74, 222, 128, 0.12); color: var(--success);"
                        }
                      >
                        {project.suppressed ? "Suppressed" : "Active"}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {project.isSystem ? (
                        <span
                          class="inline-flex items-center gap-1.5 text-xs"
                          style="color: var(--text-secondary);"
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
                        <span class="text-xs" style="color: var(--text-tertiary);">
                          Custom
                        </span>
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
                              class="px-3 py-1.5 text-sm rounded-md transition-colors no-underline"
                              style="color: var(--accent);"
                            >
                              Edit
                            </a>
                            <button
                              hx-patch={tsBuildUrl(adminProjectsContract.toggleSuppress, {
                                params: { id: project.id },
                              })}
                              hx-target="#projects-list"
                              hx-swap="outerHTML"
                              class="px-3 py-1.5 text-sm rounded-md transition-colors"
                              style={
                                project.suppressed
                                  ? "color: var(--success);"
                                  : "color: var(--warning);"
                              }
                            >
                              {project.suppressed ? "Restore" : "Suppress"}
                            </button>
                          </>
                        )}
                        {project.isSystem && (
                          <span class="text-xs italic" style="color: var(--text-tertiary);">
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
