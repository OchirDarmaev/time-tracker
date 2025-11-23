import NavBar from "./NavBar";

export default function AppLayout({
  children,
  currentPath,
}: {
  children: unknown;
  currentPath: string;
}) {
  return (
    <div class="flex flex-row">
      <NavBar currentPath={currentPath} />
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
