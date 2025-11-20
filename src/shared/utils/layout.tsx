import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { NavButtons } from "./NavButtons";
import { Meta } from "./meta";

export const roleLabels: Record<string, string> = {
  account: "Account",
  "office-manager": "Office Manager",
  admin: "Admin",
};

interface LayoutProps {
  content: string | JSX.Element;
  req: AuthContext;
  activeNav?: string;
}

export function Layout({ content, req, activeNav = "" }: LayoutProps): JSX.Element {
  const currentUser = req.currentUser || { email: "Unknown", role: "account", roles: ["account"] };
  const availableRoles: string[] = currentUser.roles || ["account"];

  return (
    <html>
      <Meta title="TimeTrack" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link href="/static/styles/output.css" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
      <script src="/static/js/theme.min.js"></script>
      {/* Top Navigation Bar */}
      <nav
        class="px-8 flex items-center justify-between sticky top-0 z-100 h-20"
        style={{ viewTransitionName: "nav-bar" }}
      >
        <div class="flex items-center">
          <a
            href="/"
            class="text-xl font-semibold tracking-tight no-underline transition-all duration-200"
            style="color: var(--text-primary); letter-spacing: -0.02em;"
          >
            TimeTrack
          </a>
        </div>
        <div class="flex-1 flex items-center justify-start" id="nav-bar-content">
          <div class="flex items-center gap-2 ml-12">
            <NavButtons availableRoles={availableRoles} activeNav={activeNav} />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <ThemeToggleButton />
          <LogoutButton />
        </div>
      </nav>
      {/* Content */}
      <main
        class="min-h-screen overflow-x-hidden w-full"
        style={{
          viewTransitionName: "main-content",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div class="max-w-7xl mx-auto px-8 py-12 w-full">{content}</div>
      </main>
    </html>
  );
}
