import { NavBar } from "./nav_bar";

export const DashboardLayout = ({
  children,
  currentPath,
}: {
  children: unknown;
  currentPath: string;
}) => (
  <div class="bg-gray-950 text-gray-100 min-h-screen">
    <NavBar currentPath={currentPath} />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</div>
  </div>
);
