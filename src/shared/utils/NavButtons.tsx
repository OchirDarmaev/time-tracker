import { accountDashboardContract } from "../../features/account/dashboard/contract";
import { adminProjectsContract } from "../../features/admin/projects/contract";
import { roleLabels } from "./layout";
import { tsBuildUrl } from "./paths";

// accountTimeContract.accountTime.path;
export function NavButtons({
  availableRoles,
  activeNav,
}: {
  availableRoles: string[];
  activeNav: string;
}): JSX.Element {
  const navItems = [
    {
      href: tsBuildUrl(accountDashboardContract.dashboard, {
        headers: {},
        query: {},
      }),
      label: "Dashboard",
      requiredRoles: ["account"],
      activeNav: "account",
    },
    {
      href: tsBuildUrl(adminProjectsContract.list, {
        headers: {},
        query: {},
      }) as string,
      label: "Manage Projects",
      requiredRoles: ["admin"],
      activeNav: "admin",
    },
  ];
  // todo <div hx-boost="true">
  // <a href="/blog">Blog</a>
  // </div>

  return (
    <>
      {navItems.map((item) => {
        const hasAccess = item.requiredRoles.some((role) => availableRoles.includes(role));
        const isActive = activeNav === item.activeNav;

        if (hasAccess) {
          const baseClasses =
            "text-gray-600 dark:text-gray-400 no-underline text-sm font-medium px-3 py-2 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700";
          const activeClasses = isActive
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
            : "";
          return (
            <a safe href={item.href} class={`${baseClasses} ${activeClasses}`}>
              {item.label}
            </a>
          );
        } else {
          const requiredRolesText = item.requiredRoles
            .map((r) => `'${roleLabels[r] || r}'`)
            .join(" or ");
          const tooltipText = `role ${requiredRolesText} required`;
          return (
            <span
              class="text-gray-500 dark:text-gray-500 cursor-not-allowed px-3 py-2 text-sm"
              title={tooltipText}
              safe
            >
              {item.label}
            </span>
          );
        }
      })}
    </>
  );
}
