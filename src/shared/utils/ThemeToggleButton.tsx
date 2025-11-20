export function ThemeToggleButton(): JSX.Element {
  return (
    <button
      class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
      hx-on:click="window.toggleTheme()"
      title="Toggle theme"
    >
      <span data-theme-icon />
    </button>
  );
}
