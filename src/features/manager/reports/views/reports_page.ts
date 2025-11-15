import { html } from "../../../../shared/utils/html.js";
import { AuthStubRequest } from "../../../../shared/middleware/auth_stub.js";
import { projectModel } from "../../../../shared/models/project.js";
import { userModel } from "../../../../shared/models/user.js";
import { renderBaseLayout } from "../../../../shared/utils/layout.js";

export function renderReportsPage(req: AuthStubRequest) {
  const accounts = userModel.getAccounts();
  const projects = projectModel.getAll();

  const content = html`
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          View time tracking reports by account or project
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
        >
          <h2 class="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
            View by Account
          </h2>
          <select
            id="account-select"
            hx-get="/manager/reports/account"
            hx-target="#report-content"
            hx-swap="innerHTML transition:true"
            hx-trigger="change"
            hx-include="[name='account_id']"
            name="account_id"
            class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 w-full"
          >
            <option value="">Select Account</option>
            ${accounts.map((w) => `<option value="${w.id}">${w.email}</option>`).join("")}
          </select>
        </div>

        <div
          class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
        >
          <h2 class="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
            View by Project
          </h2>
          <select
            id="project-select"
            hx-get="/manager/reports/project"
            hx-target="#report-content"
            hx-swap="innerHTML transition:true"
            hx-trigger="change"
            hx-include="[name='project_id']"
            name="project_id"
            class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 w-full"
          >
            <option value="">Select Project</option>
            ${projects.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
          </select>
        </div>
      </div>

      <div id="report-content">
        <div class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Select a account or project to view reports.
          </p>
        </div>
      </div>
    </div>
  `;

  return renderBaseLayout(content, req, "manager");
}
