import { client } from "../../../lib/client";

interface NavBarProps {
  currentPath: string;
}

export default function NavBar({ currentPath }: NavBarProps) {
  const dashboardPath = client.dashboard.$url().pathname;

  const navItems = [
    { label: "Dashboard", path: dashboardPath, routePath: "/dashboard" },
    {
      label: "Reports",
      path: `/reports`,
      routePath: "/reports",
    },
    {
      label: "Projects",
      path: "/admin/projects",
      routePath: "/admin/projects",
    },
    {
      label: "Calendar",
      path: "/admin/calendar",
      routePath: "/admin/calendar",
    },
  ];

  return (
    <nav class="border-b border-gray-800 bg-gray-900">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center space-x-8">
            <a
              href={client.index.$url().pathname}
              class="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent"
            >
              TimeTrack
            </a>
            <div class="flex space-x-4">
              {navItems.map((item) => {
                const isActive = currentPath.startsWith(item.routePath);
                return (
                  <a
                    key={item.routePath}
                    href={item.path}
                    class={`font-medium text-gray-300 hover:text-white ${isActive ? "text-white" : "text-gray-400"}`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
