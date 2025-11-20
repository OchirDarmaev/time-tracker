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
        <div
          class="mb-4 p-3 rounded border"
          style="background-color: rgba(248, 113, 113, 0.12); border-color: var(--error); color: var(--error);"
        >
          <span safe>{errorMessage}</span>
        </div>
      ) : null}
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">
          Edit Project
        </h1>
        <p style="color: var(--text-secondary);">Update project details</p>
      </div>

      <div class="rounded-lg shadow p-6" style="background-color: var(--bg-secondary);">
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
              class="block text-sm font-medium mb-2"
              style="color: var(--text-primary);"
            >
              Project Name
            </label>
            <input
              type="text"
              id="project-name"
              name="name"
              value={project.name}
              required
              class="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 input-modern"
              style="border-color: var(--border); background-color: var(--bg-tertiary); color: var(--text-primary);"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label
              for="project-color"
              class="block text-sm font-medium mb-2"
              style="color: var(--text-primary);"
            >
              Color
            </label>
            <div class="flex items-center gap-4">
              <input
                type="color"
                id="project-color"
                name="color"
                value={project.color}
                class="w-20 h-10 border rounded-md cursor-pointer"
                style="border-color: var(--border);"
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
                  class="w-4 h-4 rounded focus:ring-2"
                  style="border-color: var(--border); background-color: var(--bg-tertiary); accent-color: var(--accent);"
                />
                <span class="text-sm font-medium" style="color: var(--text-primary);">
                  Suppressed (hidden from users)
                </span>
              </label>
              <p class="mt-1 text-xs" style="color: var(--text-tertiary);">
                Suppressed projects are hidden from users but their history is preserved
              </p>
            </div>
          )}

          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              class="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 btn-primary"
            >
              Save Changes
            </button>
            <a
              href={tsBuildUrl(adminProjectsContract.list, {
                headers: {},
              })}
              class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 no-underline btn-secondary"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
