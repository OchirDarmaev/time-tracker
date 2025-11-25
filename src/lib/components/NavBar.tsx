import { client } from "../client";

interface NavBarProps {
  currentPath: string;
}

export default function NavBar({ currentPath }: NavBarProps) {
  const dashboardPath = client.dashboard.$url().pathname;
  const logoutPath = client.auth.logout.$url().pathname;

  const navItems = [
    { label: "Dashboard", path: dashboardPath, routePath: "/dashboard" },
    {
      label: "Reports",
      path: `/reports`,
      routePath: "/reports",
    },
    {
      label: "Projects",
      path: "/projects",
      routePath: "/projects",
    },
    {
      label: "Users Management",
      path: "/users",
      routePath: "/users",
    },
    {
      label: "Calendar",
      path: "/calendar",
      routePath: "/calendar",
    },
  ];

  return (
    <nav class="flex h-screen w-64 flex-col border-r border-(--border) bg-(--bg-secondary) px-6 py-8">
      <a
        href={client.index.$url().pathname}
        class="mb-12 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent transition-opacity hover:opacity-80"
      >
        TimeTrack
      </a>
      <div class="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.routePath);
          return (
            <a
              key={item.routePath}
              href={item.path}
              class={`group relative flex items-center rounded-sm px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-(--accent-light) text-(--accent) shadow-sm"
                  : "text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
              }`}
            >
              <span class="relative z-10">{item.label}</span>
            </a>
          );
        })}
      </div>
      <div class="mt-auto pb-4">
        <form method="post" action={logoutPath}>
          <button
            type="submit"
            class="w-full rounded-sm px-4 py-3 text-sm font-medium text-(--text-secondary) transition-all duration-200 hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
