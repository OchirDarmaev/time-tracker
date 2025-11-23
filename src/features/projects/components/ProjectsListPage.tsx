import { type Project } from "../../../lib/mock_db";

interface ProjectsListProps {
  projects: Project[];
}

export function ProjectsListPage({ projects }: ProjectsListProps) {
  return (
    <div id="projects-list" hx-target="this" hx-swap="outerHTML">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">
            Project Management
          </h1>
          <p class="text-[var(--text-secondary)]">
            Create and manage projects for time tracking
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="/projects/new"
            class="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 font-medium text-white no-underline shadow-sm transition-all hover:shadow-md focus:ring-2 focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

      <div class="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
        <div class="border-b border-[var(--border)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">
            Projects ({projects.length})
          </h2>
        </div>
        {projects.length === 0 ? (
          <div class="px-6 py-16 text-center">
            <svg
              class="mx-auto h-12 w-12 text-[var(--text-tertiary)]"
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
            <h3 class="mt-4 text-sm font-medium text-[var(--text-primary)]">
              No projects
            </h3>
            <p class="mt-2 text-sm text-[var(--text-tertiary)]">
              Get started by creating a new project above.
            </p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y border border-[var(--border)]">
              <thead class="bg-[var(--bg-tertiary)]">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                    Project
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                    Type
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border)] bg-[var(--bg-secondary)]">
                {projects.map((project) => (
                  <tr
                    class={`border-b border-[var(--border)] transition-colors ${project.suppressed ? "opacity-60" : ""}`}
                    id={`project-row-${project.id}`}
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div
                          class={`h-4 w-4 flex-shrink-0 rounded bg-[${project.color}]`}
                        ></div>
                        <span
                          safe
                          class="text-sm font-medium text-[var(--text-primary)]"
                        >
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          project.suppressed
                            ? "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                            : "bg-[rgba(74,222,128,0.12)] text-[var(--success)]"
                        }`}
                      >
                        {project.suppressed ? "Suppressed" : "Active"}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {project.isSystem ? (
                        <span
                          class="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
                          title="System project - cannot be edited or suppressed"
                        >
                          <svg
                            class="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          System
                        </span>
                      ) : (
                        <span class="text-xs text-[var(--text-tertiary)]">
                          Custom
                        </span>
                      )}
                    </td>
                    <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2">
                        {!project.isSystem && (
                          <>
                            <a
                              href={`/projects/${project.id}/edit`}
                              class="rounded-md px-3 py-1.5 text-sm text-[var(--accent)] no-underline transition-colors"
                            >
                              Edit
                            </a>
                            <button
                              hx-patch={`/projects/${project.id}/suppress`}
                              hx-target="#projects-list"
                              hx-swap="outerHTML"
                              class={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                                project.suppressed
                                  ? "text-[var(--success)]"
                                  : "text-[var(--warning)]"
                              }`}
                            >
                              {project.suppressed ? "Restore" : "Suppress"}
                            </button>
                          </>
                        )}
                        {project.isSystem && (
                          <span class="text-xs text-[var(--text-tertiary)] italic">
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
