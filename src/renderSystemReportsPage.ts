import { html } from "./utils/html";
import { AuthStubRequest } from "./middleware/auth_stub";
import { renderSystemReports } from "./renderSystemReports";
import { renderBaseLayout } from "./utils/layout";

// Admin system reports helper functions

export function renderSystemReportsPage(req: AuthStubRequest) {
  const content = html`
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">System Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Overview of all time tracking data</p>
      </div>

      <div
        id="reports-data"
        hx-get="/admin/system-reports/data"
        hx-swap="innerHTML transition:true"
        hx-trigger="load"
      >
        ${renderSystemReports()}
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "admin_reports");
}
