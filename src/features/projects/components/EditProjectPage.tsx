import { type Project } from "../../../lib/mock_db";

interface EditProjectProps {
  project: Project;
  errorMessage?: string;
}

export function EditProjectPage({ project, errorMessage }: EditProjectProps) {
  return (
    <div id="edit-project" hx-target="this" hx-swap="outerHTML">
      {errorMessage ? (
        <div class="mb-4 rounded border border-[var(--error)] bg-[rgba(248,113,113,0.12)] p-3 text-[var(--error)]">
          <span safe>{errorMessage}</span>
        </div>
      ) : null}
      <div class="mb-6">
        <h1 class="mb-2 text-2xl font-bold text-[var(--text-primary)]">
          Edit Project
        </h1>
        <p class="text-[var(--text-secondary)]">Update project details</p>
      </div>

      <div class="rounded-lg bg-[var(--bg-secondary)] p-6 shadow">
        <form
          hx-patch={`/projects/${project.id}`}
          hx-target="body"
          hx-push-url="/projects"
          class="space-y-6"
        >
          <div>
            <label
              for="project-name"
              class="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              Project Name
            </label>
            <input
              type="text"
              id="project-name"
              name="name"
              value={project.name}
              required
              class="input-modern w-full rounded-md border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label
              for="project-color"
              class="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              Color
            </label>
            <div class="flex items-center gap-4">
              <input
                type="color"
                id="project-color"
                name="color"
                value={project.color}
                class="h-10 w-20 cursor-pointer rounded-md border border-[var(--border)]"
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
                  class="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg-tertiary)] accent-[var(--accent)] focus:ring-2"
                />
                <span class="text-sm font-medium text-[var(--text-primary)]">
                  Suppressed (hidden from users)
                </span>
              </label>
              <p class="mt-1 text-xs text-[var(--text-tertiary)]">
                Suppressed projects are hidden from users but their history is
                preserved
              </p>
            </div>
          )}

          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              class="btn-primary rounded-md px-4 py-2 text-white focus:ring-2 focus:outline-none"
            >
              Save Changes
            </button>
            <a
              href="/projects"
              class="btn-secondary rounded-md px-4 py-2 no-underline focus:ring-2 focus:outline-none"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
