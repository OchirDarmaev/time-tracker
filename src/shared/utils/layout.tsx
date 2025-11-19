import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { NavButtons } from "./NavButtons";

export const roleLabels: Record<string, string> = {
  account: "Account",
  "office-manager": "Office Manager",
  admin: "Admin",
};
export function Layout(
  content: string | JSX.Element,
  req: AuthContext,
  activeNav: string = ""
): JSX.Element {
  const currentUser = req.currentUser || { email: "Unknown", role: "account", roles: ["account"] };
  const availableRoles: string[] = currentUser.roles || ["account"];

  return (
    <html>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TimeTrack</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link href="/static/styles/output.css" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
      <script src="/static/js/theme.min.js"></script>
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
          <ThemeToggleButton />
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
