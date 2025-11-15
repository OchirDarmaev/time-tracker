// Report Viewer Web Component

interface HtmxInstance {
  process: (element: ShadowRoot | HTMLElement) => void;
}

interface TimeEntry {
  date: string;
  project_id?: number;
  user_id?: number;
  minutes: number;
}

interface User {
  id: number;
  email: string;
}

interface Project {
  id: number;
  name: string;
}

interface WorkerReportData {
  user: User;
  entries: TimeEntry[];
  projects: Project[];
}

interface ProjectReportData {
  project: Project;
  entries: TimeEntry[];
  workers: User[];
}

type ReportData = WorkerReportData | ProjectReportData;

class ReportViewerComponent extends HTMLElement {
  private shadow: ShadowRoot;

  static get observedAttributes(): string[] {
    return ["type", "data"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();

    // Process HTMX in shadow DOM
    const htmx = (window as Window & { htmx?: HtmxInstance }).htmx;
    if (htmx) {
      htmx.process(this.shadow);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.render();
      const htmx = (window as Window & { htmx?: HtmxInstance }).htmx;
      if (htmx) {
        htmx.process(this.shadow);
      }
    }
  }

  private render(): void {
    const type = this.getAttribute("type") || "worker";
    const dataJson = this.getAttribute("data") || "{}";
    const data: ReportData = JSON.parse(dataJson);

    this.shadow.innerHTML = `
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
        .table-modern tfoot tr {
          background-color: var(--bg-tertiary);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-neutral {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
        }
      </style>
      <div class="card">
        ${this.renderReport(type, data)}
      </div>
    `;
  }

  private renderReport(type: string, data: ReportData): string {
    if (type === "worker") {
      return this.renderWorkerReport(data as WorkerReportData);
    } else if (type === "project") {
      return this.renderProjectReport(data as ProjectReportData);
    }
    return '<p style="color: var(--text-secondary);">Select a worker or project to view reports.</p>';
  }

  private renderWorkerReport(data: WorkerReportData): string {
    if (!data.user || !data.entries || data.entries.length === 0) {
      return `<p style="color: var(--text-secondary);">No time entries for ${data.user?.email || "this worker"}.</p>`;
    }

    // Group entries by date and project
    const grouped: Record<string, Record<number, number>> = {};
    data.entries.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = {};
      }
      if (entry.project_id !== undefined) {
        if (!grouped[entry.date][entry.project_id]) {
          grouped[entry.date][entry.project_id] = 0;
        }
        grouped[entry.date][entry.project_id] += entry.minutes;
      }
    });

    const dates = Object.keys(grouped).sort();
    const projects = data.projects || [];
    let grandTotal = 0;

    dates.forEach((date) => {
      const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
      grandTotal += dayTotal;
    });

    return `
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Report for ${data.user.email}</h3>
        <div class="badge badge-neutral">${(grandTotal / 60).toFixed(1)}h total</div>
      </div>
      <div style="overflow-x: scroll; overflow-y: visible;">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Date</th>
              ${projects.map((p) => `<th>${p.name}</th>`).join("")}
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${dates
              .map((date) => {
                const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
                return `
                <tr id="report-row-${data.user.id}-${date}">
                  <td style="font-weight: 500;">${date}</td>
                  ${projects
                    .map((p) => {
                      const minutes = grouped[date][p.id] || 0;
                      return `<td style="color: ${minutes > 0 ? "var(--text-primary)" : "var(--text-tertiary)"};">${(minutes / 60).toFixed(1)}</td>`;
                    })
                    .join("")}
                  <td style="text-align: right; font-weight: 600; color: var(--accent);">${(dayTotal / 60).toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td style="font-weight: 600;">Total</td>
              ${projects
                .map((p) => {
                  const projectTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][p.id] || 0),
                    0
                  );
                  return `<td style="font-weight: 600; color: var(--accent);">${(projectTotal / 60).toFixed(1)}h</td>`;
                })
                .join("")}
              <td style="text-align: right; font-weight: 700; color: var(--accent);">${(grandTotal / 60).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  private renderProjectReport(data: ProjectReportData): string {
    if (!data.project || !data.entries || data.entries.length === 0) {
      return `<p style="color: var(--text-secondary);">No time entries for project ${data.project?.name || "this project"}.</p>`;
    }

    // Group entries by date and user
    const grouped: Record<string, Record<number, number>> = {};
    data.entries.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = {};
      }
      if (entry.user_id !== undefined) {
        if (!grouped[entry.date][entry.user_id]) {
          grouped[entry.date][entry.user_id] = 0;
        }
        grouped[entry.date][entry.user_id] += entry.minutes;
      }
    });

    const dates = Object.keys(grouped).sort();
    const workers = data.workers || [];
    let grandTotal = 0;

    dates.forEach((date) => {
      const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
      grandTotal += dayTotal;
    });

    return `
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold" style="color: var(--text-primary);">Report for ${data.project.name}</h3>
        <div class="badge badge-neutral">${(grandTotal / 60).toFixed(1)}h total</div>
      </div>
      <div style="overflow-x: scroll; overflow-y: visible;">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Date</th>
              ${workers.map((w) => `<th>${w.email}</th>`).join("")}
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${dates
              .map((date) => {
                const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
                return `
                <tr id="report-row-project-${data.project.id}-${date}">
                  <td style="font-weight: 500;">${date}</td>
                  ${workers
                    .map((w) => {
                      const minutes = grouped[date][w.id] || 0;
                      return `<td style="color: ${minutes > 0 ? "var(--text-primary)" : "var(--text-tertiary)"};">${(minutes / 60).toFixed(1)}</td>`;
                    })
                    .join("")}
                  <td style="text-align: right; font-weight: 600; color: var(--accent);">${(dayTotal / 60).toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td style="font-weight: 600;">Total</td>
              ${workers
                .map((w) => {
                  const workerTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][w.id] || 0),
                    0
                  );
                  return `<td style="font-weight: 600; color: var(--accent);">${(workerTotal / 60).toFixed(1)}h</td>`;
                })
                .join("")}
              <td style="text-align: right; font-weight: 700; color: var(--accent);">${(grandTotal / 60).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }
}

if (!customElements.get("report-viewer")) {
  customElements.define("report-viewer", ReportViewerComponent);
}

