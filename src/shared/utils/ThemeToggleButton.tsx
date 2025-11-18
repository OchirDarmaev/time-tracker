import { rootContract } from "../../features/root/contract";
import { tsBuildUrl } from "./paths";

export type Theme = "dark" | "light";

export function ThemeToggleButton(props: { theme: Theme }): JSX.Element {
  const themeIcon = props.theme === "dark" ? "🌙" : "☀️";
  const toggleThemeUrl = tsBuildUrl(rootContract.toggleTheme, {});

  return (
    <form hx-post={toggleThemeUrl} class="inline-block">
      <button
        type="submit"
        class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <span>{themeIcon}</span>
      </button>
    </form>
  );
}
