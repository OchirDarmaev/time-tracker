import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { AuthContext } from "../middleware/auth_stub.js";
import { userModel } from "../models/user.js";
import { html } from "./html.js";
import { tsBuildUrl } from "./paths.js";
import { accountDashboardContract } from "../../features/account/dashboard/contract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const roleLabels: Record<string, string> = {
  account: "Account",
  "office-manager": "Office Manager",
  admin: "Admin",
};
// accountTimeContract.accountTime.path;
function getNavButtons(availableRoles: string[], activeNav: string): string {
  const navItems = [
    {
      href: tsBuildUrl(accountDashboardContract.dashboard, {}),
      label: "Dashboard",
      requiredRoles: ["account"],
      activeNav: "account",
    },
  ];

  return navItems
    .map((item) => {
      const hasAccess = item.requiredRoles.some((role) => availableRoles.includes(role));
      const isActive = activeNav === item.activeNav;
      // const activeClass = isActive ? "active" : "";

      if (hasAccess) {
        const baseClasses =
          "text-gray-600 dark:text-gray-400 no-underline text-sm font-medium px-3 py-2 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700";
        const activeClasses = isActive
          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
          : "";
        return `<a href="${item.href}" class="${baseClasses} ${activeClasses}">${item.label}</a>`;
      } else {
        const requiredRolesText = item.requiredRoles
          .map((r) => `'${roleLabels[r] || r}'`)
          .join(" or ");
        const tooltipText = `role ${requiredRolesText} required`;
        return html`<span
          class="text-gray-500 dark:text-gray-500 cursor-not-allowed px-3 py-2 text-sm"
          title="${tooltipText}"
          >${item.label}</span
        >`;
      }
    })
    .join("");
}

export function renderBaseLayout(content: string, req: AuthContext, activeNav: string = "") {
  const layoutPath = join(__dirname, "../views/layouts/base.html");
  let layout = readFileSync(layoutPath, "utf-8");

  const currentUser = req.currentUser || { email: "Unknown", role: "account", roles: ["account"] };
  const users = userModel.getAll();
  const userOptions = users
    .map((u) => {
      const selected = req.session?.userId === u.id ? "selected" : "";
      const rolesJson = JSON.stringify(u.roles);
      return `<option value="${u.id}" data-roles='${rolesJson}' ${selected}>${u.email}</option>`;
    })
    .join("");

  // Get available roles for current user - use currentUser.roles directly (set by middleware)
  const availableRoles: string[] = currentUser.roles || ["account"];
  const allRolesDisplay =
    availableRoles.map((role) => roleLabels[role] || role).join(", ") || "None";

  // Generate nav bar components
  const navButtons = getNavButtons(availableRoles, activeNav);
  // const userId = "id" in currentUser ? currentUser.id : undefined;
  // const projectSelector = getProjectSelector(availableRoles, userId);
  const emptyProjectSelector = "";

  // Replace all placeholders
  layout = layout.replace(/\{\{user_options\}\}/g, userOptions || "");
  layout = layout.replace(/\{\{current_user_email\}\}/g, currentUser.email || "Unknown");
  layout = layout.replace(/\{\{all_roles\}\}/g, allRolesDisplay);
  layout = layout.replace("{{nav_buttons}}", navButtons);
  layout = layout.replace("{{role_selector}}", "");
  layout = layout.replace("{{project_selector}}", emptyProjectSelector);
  layout = layout.replace("{{content}}", content);

  return layout;
}

export function renderNavBar(req: AuthContext, activeNav: string = ""): string {
  const currentUser = req.currentUser || { email: "Unknown", role: "account", roles: ["account"] };
  const availableRoles: string[] = currentUser.roles || ["account"];

  const navButtons = getNavButtons(availableRoles, activeNav);

  return html` <div class="flex items-center gap-1">${navButtons}</div> `;
}
