// Project List Web Component
// Uses light DOM (no shadow) for simpler HTMX integration

interface Project {
  id: number;
  name: string;
  suppressed?: boolean;
}

interface HtmxInstance {
  process: (element: ShadowRoot | HTMLElement) => void;
}

class ProjectListComponent extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["projects"];
  }

  constructor() {
    super();
    this.className = "block";
  }

  connectedCallback(): void {
    this.render();

    // Process HTMX
    const htmx = (window as Window & { htmx?: HtmxInstance }).htmx;
    if (htmx) {
      htmx.process(this);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.render();
      const htmx = (window as Window & { htmx?: HtmxInstance }).htmx;
      if (htmx) {
        htmx.process(this);
      }
    }
  }

  private render(): void {
    const projectsJson = this.getAttribute("projects") || "[]";
    const projects: Project[] = JSON.parse(projectsJson);

    this.innerHTML = `
      <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm" id="projects-list">
        ${this.renderProjectsList(projects)}
      </div>
    `;
  }

  private renderProjectsList(projects: Project[]): string {
    if (projects.length === 0) {
      return '<p class="text-gray-600 dark:text-gray-400">No projects found.</p>';
    }

    return `
      <table class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
        <thead class="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">ID</th>
            <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Name</th>
            <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Status</th>
            <th class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map(
              (project) => `
            <tr id="project-${project.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700 ${project.suppressed ? "opacity-60" : ""}">
              <td class="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">#${project.id}</td>
              <td class="px-5 py-4 text-gray-900 dark:text-gray-100 font-medium text-sm">${project.name}</td>
              <td class="px-5 py-4">
                ${project.suppressed ? '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Suppressed</span>' : '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Active</span>'}
              </td>
              <td class="px-5 py-4 text-right">
                <button 
                  hx-patch="/admin/projects/${project.id}/suppress"
                  hx-target="closest project-list"
                  hx-swap="outerHTML"
                  class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500"
                >
                  ${project.suppressed ? "Activate" : "Suppress"}
                </button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // Public method to update projects
  public updateProjects(projects: Project[]): void {
    this.setAttribute("projects", JSON.stringify(projects));
  }
}

if (!customElements.get("project-list")) {
  customElements.define("project-list", ProjectListComponent);
}
