import { html } from "./html";

export function renderSummary(
  totalHours: number,
  monthlyTotalHours: number,
  requiredMonthlyHours: number,
  monthlyWarning: boolean
): string {
  // Determine daily status color
  let dailyStatus = "success";
  let dailyColorClass = "bg-green-500";
  let badgeClass = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
  if (totalHours < 4) {
    dailyStatus = "error";
    dailyColorClass = "bg-red-500";
    badgeClass = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  } else if (totalHours < 6) {
    dailyStatus = "error";
    dailyColorClass = "bg-red-500";
    badgeClass = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  } else if (totalHours < 8) {
    dailyStatus = "warning";
    dailyColorClass = "bg-yellow-500";
    badgeClass = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
  }

  console.log(dailyStatus, dailyColorClass, badgeClass);

  const dailyPercentage = Math.min((totalHours / 8) * 100, 100);

  return html`
    <div class="flex items-center gap-6">
      <div class="min-w-[140px]">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Daily</span>
          <span
            class="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${badgeClass}"
            >${totalHours.toFixed(1)}h</span
          >
        </div>
        <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden">
          <div class="h-full ${dailyColorClass}" style="width: ${dailyPercentage}%;"></div>
        </div>
      </div>
      <div
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-3 min-w-[200px]"
      >
        <div class="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Monthly</div>
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold text-gray-900 dark:text-gray-100"
            >${monthlyTotalHours.toFixed(1)}</span
          >
          <span class="text-sm text-gray-500 dark:text-gray-400">/ ${requiredMonthlyHours}h</span>
          ${monthlyWarning
            ? '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 ml-auto">Below target</span>'
            : '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 ml-auto">On track</span>'}
        </div>
      </div>
    </div>
  `;
}
