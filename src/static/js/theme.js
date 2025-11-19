/* eslint-disable no-undef */
// --- INITIAL LOAD ---
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");

  updateThemeIcon(theme);
})();

// --- TOGGLE FUNCTION ---
window.toggleTheme = function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark");
  root.classList.toggle("light", !isDark);

  const theme = isDark ? "dark" : "light";
  localStorage.setItem("theme", theme);

  updateThemeIcon(theme);
};

// --- UPDATE ICON ---
function updateThemeIcon(theme) {
  const el = document.querySelector("[data-theme-icon]");
  if (!el) return;
  el.textContent = theme === "dark" ? "🌙" : "☀️";
}

document.addEventListener("DOMContentLoaded", () => updateThemeIcon(localStorage.getItem("theme")));

