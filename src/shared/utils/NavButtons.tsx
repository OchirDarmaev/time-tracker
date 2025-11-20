import { accountDashboardContract } from "../../features/account/dashboard/contract";
import { adminProjectsContract } from "../../features/admin/projects/contract";
import { adminCalendarContract } from "../../features/admin/calendar/contract";
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
    {
      href: tsBuildUrl(adminCalendarContract.view, {
        headers: {},
        query: {},
      }) as string,
      label: "Manage Calendar",
      requiredRoles: ["office-manager", "admin"],
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
            "no-underline text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200";
          const inactiveStyle = "color: var(--text-secondary);";
          const activeStyle = isActive
            ? "color: var(--accent); background-color: var(--accent-light); font-weight: 600; box-shadow: var(--shadow-sm);"
            : inactiveStyle;
          const hoverStyle = isActive
            ? ""
            : "hover:color: var(--text-primary); hover:background-color: var(--bg-tertiary);";
          return (
            <a
              safe
              href={item.href}
              class={baseClasses}
              style={`${activeStyle} ${hoverStyle} letter-spacing: -0.01em;`}
            >
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
              class="cursor-not-allowed px-5 py-2.5 text-sm opacity-50"
              style="color: var(--text-tertiary);"
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
