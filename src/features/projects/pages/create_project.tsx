interface CreateProjectProps {
  errorMessage?: string;
}

export function CreateProject({ errorMessage }: CreateProjectProps) {
  return (
    <div id="create-project" hx-target="this" hx-swap="outerHTML">
      {errorMessage ? (
        <div
          class="mb-6 rounded-r-md border-l-4 border-l-[var(--error)] bg-[rgba(248,113,113,0.12)] p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-[var(--error)]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-[var(--error)]" safe>
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">
          Create New Project
        </h1>
        <p class="text-[var(--text-secondary)]">
          Add a new project for time tracking
        </p>
      </div>

      <div class="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm">
        <form
          hx-post="/projects"
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
              required
              class="input-modern w-full rounded-lg border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] transition-all focus:outline-none focus:ring-2"
              placeholder="e.g., Marketing Campaign, Product Development"
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
                value="#14b8a6"
                oninput="document.getElementById('color-value').textContent = this.value"
                class="h-12 w-20 cursor-pointer rounded-lg border-2 border-[var(--border)] transition-colors"
              />
              <div
                class="flex h-12 flex-1 items-center justify-center rounded-lg border-2 border-[var(--border)] bg-[var(--bg-tertiary)]"
              >
                <span
                  class="font-mono text-xs text-[var(--text-secondary)]"
                  id="color-value"
                >
                  #14b8a6
                </span>
              </div>
            </div>
            <p class="mt-2 text-xs text-[var(--text-tertiary)]">
              Choose a color to help identify this project visually
            </p>
          </div>

          <div class="flex items-center gap-4 border-t border-[var(--border)] pt-4">
            <button
              type="submit"
              class="btn-primary rounded-lg px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:outline-none"
            >
              Create Project
            </button>
            <a
              href="/projects"
              class="btn-secondary rounded-lg px-6 py-2.5 no-underline transition-all focus:ring-2 focus:outline-none"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
