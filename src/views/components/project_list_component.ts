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
      <style>
        :host {
          display: block;
        }
        .card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        .table-modern {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background-color: var(--bg-secondary);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .table-modern thead {
          background-color: var(--bg-tertiary);
        }
        .table-modern th {
          padding: 16px 20px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }
        .table-modern td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 14px;
        }
        .table-modern tbody tr:hover {
          background-color: var(--bg-tertiary);
        }
        .table-modern tbody tr:last-child td {
          border-bottom: none;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-success {
          background-color: rgba(74, 222, 128, 0.12);
          color: var(--success);
        }
        .badge-neutral {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
        }
        .btn-secondary {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background-color: var(--bg-secondary);
          border-color: var(--accent);
        }
      </style>
      <div class="card" id="projects-list">
        ${this.renderProjectsList(projects)}
      </div>
    `;
  }

  private renderProjectsList(projects: Project[]): string {
    if (projects.length === 0) {
      return '<p style="color: var(--text-secondary);">No projects found.</p>';
    }

    return `
      <table class="table-modern">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map(
              (project) => `
            <tr id="project-${project.id}" style="${project.suppressed ? "opacity: 0.6;" : ""}">
              <td style="color: var(--text-tertiary); font-size: 13px;">#${project.id}</td>
              <td style="font-weight: 500;">${project.name}</td>
              <td>
                ${project.suppressed ? '<span class="badge badge-neutral">Suppressed</span>' : '<span class="badge badge-success">Active</span>'}
              </td>
              <td style="text-align: right;">
                <button 
                  hx-patch="/admin/projects/${project.id}/suppress"
                  hx-target="closest project-list"
                  hx-swap="outerHTML"
                  class="btn-secondary"
                  style="font-size: 13px; padding: 6px 12px;"
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

