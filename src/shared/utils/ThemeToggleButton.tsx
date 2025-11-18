export function ThemeToggleButton(): JSX.Element {
  return (
    <button
      class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
      hx-on:click="window.toggleTheme()"
    >
      <span data-theme-icon />
    </button>
  );
}
