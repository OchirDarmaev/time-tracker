import { type Project } from "../../../lib/mock_db";

interface EditProjectProps {
  project: Project;
  errorMessage?: string;
}

export function EditProject({ project, errorMessage }: EditProjectProps) {
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
          hx-patch={`/admin/projects/${project.id}`}
          hx-target="body"
          hx-push-url="/admin/projects"
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
                  checked={project.suppressed === 1}
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
              href="/admin/projects"
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

