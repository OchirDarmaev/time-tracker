import { NavBar } from "./nav_bar";

export const DashboardLayout = ({
  children,
  currentPath,
}: {
  children: unknown;
  currentPath: string;
}) => (
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <NavBar currentPath={currentPath} />
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
  </div>
);
