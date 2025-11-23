import NavBar from "../components/NavBar";

export default function DashboardLayout({
  children,
  currentPath,
}: {
  children: unknown;
  currentPath: string;
}) {
  return (
    <div class="flex flex-row">
      <div class="w-64">
        <NavBar currentPath={currentPath} />
      </div>
      <div class="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
