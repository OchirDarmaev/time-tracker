export function ThemeToggleButton(): JSX.Element {
  return (
    <button class="theme-toggle" hx-on:click="window.toggleTheme()" title="Toggle theme">
      <span data-theme-icon />
    </button>
  );
}
