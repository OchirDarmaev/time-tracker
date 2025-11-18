import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { LogoutButton } from "./LogoutButton";

const roleLabels: Record<string, string> = {
  account: "Account",
  "office-manager": "Office Manager",
  admin: "Admin",
};
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
  ];

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

export function Layout(
  content: string | JSX.Element,
  req: AuthContext,
  activeNav: string = ""
): JSX.Element {
  const currentUser = req.currentUser || { email: "Unknown", role: "account", roles: ["account"] };
  const availableRoles: string[] = currentUser.roles || ["account"];

  return (
    <html class="dark">
      <script>
        {`
        // Theme management - runs immediately to prevent FOUC
        (function() {
            const theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.className = theme;
            
            const updateThemeIcon = () => {
                const icon = document.getElementById('theme-icon');
                if (icon) {
                    icon.textContent = document.documentElement.className === 'dark' ? '🌙' : '☀️';
                }
            };
            
            window.toggleTheme = function() {
                const current = document.documentElement.className;
                const newTheme = current === 'dark' ? 'light' : 'dark';
                document.documentElement.className = newTheme;
                localStorage.setItem('theme', newTheme);
                updateThemeIcon();
            };
            
            updateThemeIcon();
        })();
        `}
      </script>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TimeTrack</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link href="/public/styles/output.css" rel="stylesheet" />

      {/* Top Navigation Bar */}
      <nav
        class="px-6 flex items-center justify-between bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 backdrop-blur-sm sticky top-0 z-100 h-16"
        style={{ viewTransitionName: "nav-bar" }}
      >
        <div class="flex items-center">
          <a
            href="/"
            class="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 no-underline"
          >
            TimeTrack
          </a>
        </div>
        <div class="flex-1 flex items-center justify-start" id="nav-bar-content">
          <div class="flex items-center gap-1 ml-8">
            <NavButtons availableRoles={availableRoles} activeNav={activeNav} />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            onclick="toggleTheme()"
            class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <span id="theme-icon">🌙</span>
          </button>
          <LogoutButton />
        </div>
      </nav>
      {/* Content */}
      <main
        class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen overflow-x-hidden w-full"
        style={{ viewTransitionName: "main-content" }}
      >
        <div class="max-w-5xl mx-auto px-6 py-8 w-full">{content}</div>
      </main>
    </html>
  );
}
