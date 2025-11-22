interface CreateProjectProps {
  errorMessage?: string;
}

export function CreateProject({ errorMessage }: CreateProjectProps) {
  return (
    <div id="create-project" hx-target="this" hx-swap="outerHTML">
      {errorMessage ? (
        <div
          class="mb-6 p-4 rounded-r-md"
          style="background-color: rgba(248, 113, 113, 0.12); border-left: 4px solid var(--error);"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5"
                style="color: var(--error);"
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
              <p class="text-sm" style="color: var(--error);" safe>
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
          Create New Project
        </h1>
        <p style="color: var(--text-secondary);">Add a new project for time tracking</p>
      </div>

      <div
        class="rounded-xl shadow-sm p-6"
        style="background-color: var(--bg-secondary); border: 1px solid var(--border);"
      >
        <form
          hx-post="/admin/projects"
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
              required
              class="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all input-modern"
              style="border-color: var(--border); background-color: var(--bg-tertiary); color: var(--text-primary);"
              placeholder="e.g., Marketing Campaign, Product Development"
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
                value="#14b8a6"
                oninput="document.getElementById('color-value').textContent = this.value"
                class="w-20 h-12 border-2 rounded-lg cursor-pointer transition-colors"
                style="border-color: var(--border);"
              />
              <div
                class="flex-1 h-12 rounded-lg border-2 flex items-center justify-center"
                style="border-color: var(--border); background-color: var(--bg-tertiary);"
              >
                <span
                  class="text-xs font-mono"
                  style="color: var(--text-secondary);"
                  id="color-value"
                >
                  #14b8a6
                </span>
              </div>
            </div>
            <p class="mt-2 text-xs" style="color: var(--text-tertiary);">
              Choose a color to help identify this project visually
            </p>
          </div>

          <div class="flex items-center gap-4 pt-4" style="border-top: 1px solid var(--border);">
            <button
              type="submit"
              class="px-6 py-2.5 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 transition-all btn-primary"
            >
              Create Project
            </button>
            <a
              href="/admin/projects"
              class="px-6 py-2.5 rounded-lg focus:outline-none focus:ring-2 no-underline transition-all btn-secondary"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

