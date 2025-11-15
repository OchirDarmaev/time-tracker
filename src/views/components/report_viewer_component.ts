// Report Viewer Web Component

import { html } from "../../html";

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
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }
    `;
    this.shadow.appendChild(style);
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

    this.shadow.innerHTML = html`
      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      >
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
    return '<p class="text-gray-600 dark:text-gray-400">Select a worker or project to view reports.</p>';
  }

  private renderWorkerReport(data: WorkerReportData): string {
    if (!data.user || !data.entries || data.entries.length === 0) {
      return `<p class="text-gray-600 dark:text-gray-400">No time entries for ${data.user?.email || "this worker"}.</p>`;
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
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Report for ${data.user.email}</h3>
        <div class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">${(grandTotal / 60).toFixed(1)}h total</div>
      </div>
      <div class="overflow-x-scroll overflow-y-visible">
        <table class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Date</th>
              ${projects.map((p) => `<th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">${p.name}</th>`).join("")}
              <th class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            ${dates
              .map((date) => {
                const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
                return `
                <tr id="report-row-${data.user.id}-${date}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
                  <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${date}</td>
                  ${projects
                    .map((p) => {
                      const minutes = grouped[date][p.id] || 0;
                      return `<td class="px-5 py-4 text-sm ${minutes > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}">${(minutes / 60).toFixed(1)}</td>`;
                    })
                    .join("")}
                  <td class="px-5 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${(dayTotal / 60).toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr class="bg-gray-200 dark:bg-gray-700">
              <td class="px-5 py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Total</td>
              ${projects
                .map((p) => {
                  const projectTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][p.id] || 0),
                    0
                  );
                  return `<td class="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${(projectTotal / 60).toFixed(1)}h</td>`;
                })
                .join("")}
              <td class="px-5 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">${(grandTotal / 60).toFixed(1)}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  private renderProjectReport(data: ProjectReportData): string {
    if (!data.project || !data.entries || data.entries.length === 0) {
      return `<p class="text-gray-600 dark:text-gray-400">No time entries for project ${data.project?.name || "this project"}.</p>`;
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
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Report for ${data.project.name}</h3>
        <div class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">${(grandTotal / 60).toFixed(1)}h total</div>
      </div>
      <div class="overflow-x-scroll overflow-y-visible">
        <table class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Date</th>
              ${workers.map((w) => `<th class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">${w.email}</th>`).join("")}
              <th class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            ${dates
              .map((date) => {
                const dayTotal = Object.values(grouped[date]).reduce((sum, mins) => sum + mins, 0);
                return `
                <tr id="report-row-project-${data.project.id}-${date}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
                  <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${date}</td>
                  ${workers
                    .map((w) => {
                      const minutes = grouped[date][w.id] || 0;
                      return `<td class="px-5 py-4 text-sm ${minutes > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}">${(minutes / 60).toFixed(1)}</td>`;
                    })
                    .join("")}
                  <td class="px-5 py-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${(dayTotal / 60).toFixed(1)}h</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr class="bg-gray-200 dark:bg-gray-700">
              <td class="px-5 py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">Total</td>
              ${workers
                .map((w) => {
                  const workerTotal = dates.reduce(
                    (sum, date) => sum + (grouped[date][w.id] || 0),
                    0
                  );
                  return `<td class="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${(workerTotal / 60).toFixed(1)}h</td>`;
                })
                .join("")}
              <td class="px-5 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">${(grandTotal / 60).toFixed(1)}h</td>
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
