/// <reference types="@kitajs/html/htmx" />

export interface TimeSummaryProps {
  hxGet: string;
  hxTrigger?: string;
}

export function renderTimeSummary(props: TimeSummaryProps): JSX.Element {
  const hxGet = props.hxGet;
  const hxTrigger = props.hxTrigger || "load";

  // Build the URL with date parameter if provided
  const url = hxGet;

  // Determine the trigger attribute
  let triggerAttr = "";
  if (hxGet && hxTrigger) {
    // If trigger includes entries-changed, ensure load is also included
    if (hxTrigger.includes("entries-changed")) {
      if (hxTrigger.includes("load")) {
        triggerAttr = hxTrigger;
      } else {
        triggerAttr = `load, ${hxTrigger}`;
      }
    } else {
      triggerAttr = hxTrigger;
    }
  }

  return (
    <div
      id="summary-content"
      class="block w-full max-w-full box-border min-h-[140px]"
      hx-get={url || undefined}
      hx-target={url ? "this" : undefined}
      hx-swap={url ? "innerHTML" : undefined}
      hx-trigger={triggerAttr || undefined}
    >
      <div class="space-y-3">
        {/* Monthly Total Skeleton */}
        <div>
          <div class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Monthly Total
          </div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-lg font-bold text-gray-300 dark:text-gray-600">0.0h</span>
            <span class="text-xs text-gray-400 dark:text-gray-600">/ 0.0h</span>
            {/* Reserve space for warning badge */}
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-transparent text-transparent pointer-events-none">
              ⚠ Mismatch
            </span>
          </div>
        </div>

        {/* Breakdown Skeleton */}
        <div class="space-y-1.5 pt-1 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-baseline justify-between gap-2 flex-wrap">
            <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Workday
            </span>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-xs font-semibold text-gray-300 dark:text-gray-600">0.0h</span>
              <span class="text-[10px] text-gray-400 dark:text-gray-600">/ 0.0h</span>
              {/* Reserve space for warning badge */}
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-transparent text-transparent pointer-events-none">
                ⚠ Mismatch
              </span>
            </div>
          </div>
          <div class="flex items-baseline justify-between gap-2 flex-wrap">
            <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Public Holiday
            </span>
            <div class="flex items-baseline gap-1.5 flex-wrap">
              <span class="text-xs font-semibold text-gray-300 dark:text-gray-600">0.0h</span>
              <span class="text-[10px] text-gray-400 dark:text-gray-600">/ 0.0h</span>
              {/* Reserve space for warning badge */}
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-transparent text-transparent pointer-events-none">
                ⚠ Mismatch
              </span>
              {/* Reserve space for public holiday overtime indicator */}
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-transparent text-transparent pointer-events-none">
                ⚠ +0.0h
              </span>
            </div>
          </div>
        </div>

        {/* Overtime Skeleton */}
        <div class="pt-1 border-t border-gray-200 dark:border-gray-700">
          <div class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Overtime
          </div>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-sm font-bold text-gray-300 dark:text-gray-600">0.0h</span>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-400 dark:text-gray-600">
              No overtime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
