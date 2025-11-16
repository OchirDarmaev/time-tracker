import { html } from "../../../../shared/utils/html.js";

export function renderSummary(
  _totalHours: number,
  monthlyTotalHours: number,
  requiredMonthlyHours: number,
  monthlyWarning: boolean,
  monthlyOverLimit: boolean
): string {
  const statusBadge = monthlyOverLimit
    ? html`<span
        class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        >⚠ Over limit</span
      >`
    : monthlyWarning
      ? html`<span
          class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
          >Below target</span
        >`
      : html`<span
          class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          >On track</span
        >`;

  const hoursColor = monthlyOverLimit
    ? "text-orange-600 dark:text-orange-400"
    : monthlyWarning
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-gray-900 dark:text-gray-100";

  return html`
    <div>
      <div class="text-[10px] font-medium mb-0.5 text-gray-600 dark:text-gray-400">Monthly</div>
      <div class="flex items-baseline gap-1.5 flex-wrap">
        <span class="text-sm font-bold ${hoursColor}">${monthlyTotalHours.toFixed(1)}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">/ ${requiredMonthlyHours}h</span>
        ${statusBadge}
      </div>
    </div>
  `;
}
