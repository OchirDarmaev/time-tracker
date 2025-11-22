import { client } from "../../../lib/client";

export const NavBar = ({ currentPath }: { currentPath: string }) => {
  const dashboardPath = client.dashboard.$url().pathname;

  const navItems = [
    { label: "Dashboard", path: dashboardPath, routePath: "/dashboard" },
    {
      label: "Time Entries",
      path: `${dashboardPath}/entries`,
      routePath: "/dashboard/entries",
    },
    {
      label: "Reports",
      path: `${dashboardPath}/reports`,
      routePath: "/dashboard/reports",
    },
  ];

  return (
    <nav class="bg-gray-900 border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-8">
            <a
              href={dashboardPath}
              class="text-xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
            >
              TimeTrack
            </a>
            <div class="flex space-x-4">
              {navItems.map((item) => {
                const isActive = item.routePath === currentPath;
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
};
