import { html } from "../../../shared/utils/html";
import { tsBuildUrl } from "../../../shared/utils/paths";
import { authContract } from "../contract";
import { accountDashboardContract } from "../../account/dashboard/contract";
import { AuthContext } from "../../../shared/middleware/auth_stub";
import { userModel, UserRole } from "../../../shared/models/user";

const roleLabels: Record<UserRole, string> = {
  account: "User",
  "office-manager": "Office Manager",
  admin: "Admin",
};

export function renderAuth(req: AuthContext): string {
  const users = userModel.getAll();
  const currentUser = req.currentUser || {
    id: 0,
    email: "",
    role: "account" as UserRole,
    roles: [],
  };
  const currentUserId = req.session?.userId as number | undefined;
  const currentRole = req.session?.userRole as UserRole | undefined;
  const selectedUser = currentUserId ? userModel.getById(currentUserId) : null;
  const availableRoles = selectedUser?.roles || currentUser.roles || [];

  const userOptions = users
    .map((u) => {
      const selected = currentUserId === u.id ? "selected" : "";
      return `<option value="${u.id}" ${selected}>${u.email} ${u.roles.map((r) => `(${roleLabels[r]})`).join(", ")}</option>`;
    })
    .join("");

  const roleOptions = availableRoles
    .map((role) => {
      const selected = currentRole === role ? "selected" : "";
      return `<option value="${role}" ${selected}>${roleLabels[role]}</option>`;
    })
    .join("");

  const setUserUrl = tsBuildUrl(authContract.setUser, {});
  const setRoleUrl = tsBuildUrl(authContract.setRole, {});
  const dashboardUrl = tsBuildUrl(accountDashboardContract.dashboard, {
    headers: {},
    query: {},
  });

  return html`
    <!DOCTYPE html>
    <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Select User - TimeTrack</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="/public/styles/output.css" rel="stylesheet" />
        <style>
          * {
            font-family:
              "Inter",
              -apple-system,
              BlinkMacSystemFont,
              "SF Pro Display",
              "Segoe UI",
              sans-serif;
          }
        </style>
      </head>
      <body class="bg-gray-950 text-gray-100 min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gray-900 rounded-lg p-8 border border-gray-800 shadow-xl">
            <h1
              class="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
            >
              Select User
            </h1>
            <p class="text-sm text-gray-400 text-center mb-8">POC: Choose a user to continue</p>

            <div class="space-y-6">
              <form method="POST" action="${setUserUrl}">
                <div>
                  <label for="user_id" class="block text-sm font-medium mb-2 text-gray-300">
                    User
                  </label>
                  <select
                    id="user_id"
                    name="user_id"
                    onchange="this.form.submit()"
                    class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    ${userOptions}
                  </select>
                </div>
              </form>

              ${availableRoles.length > 1
                ? html`
                    <form method="POST" action="${setRoleUrl}">
                      <div>
                        <label for="role" class="block text-sm font-medium mb-2 text-gray-300">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          onchange="this.form.submit()"
                          class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                          ${roleOptions}
                        </select>
                      </div>
                    </form>
                  `
                : ""}

              <div class="pt-4">
                <a
                  href="${dashboardUrl}"
                  class="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-center"
                >
                  Continue to Dashboard →
                </a>
              </div>
            </div>

            ${currentUser.email
              ? html`
                  <div class="mt-6 pt-6 border-t border-gray-800">
                    <p class="text-xs text-gray-500 text-center">
                      Current: <span class="text-gray-400">${currentUser.email}</span>
                      ${currentUser.role
                        ? html`<span class="text-gray-500">
                            as ${roleLabels[currentUser.role]}</span
                          >`
                        : ""}
                    </p>
                  </div>
                `
              : ""}
          </div>
        </div>
      </body>
    </html>
  `;
}
