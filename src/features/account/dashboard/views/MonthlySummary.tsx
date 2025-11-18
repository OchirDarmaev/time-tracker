import { minutesToHours } from "@/shared/utils/date_utils.js";
import { MonthlySummaryData } from "../getMonthlySummaryData";

function getWarningBadge(hours: number, required: number): JSX.Element | "" {
  if (required === 0) return "";
  if (hours !== required) {
    return (
      <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
        ⚠ Mismatch
      </span>
    );
  }
  return "";
}

function getHoursColor(hours: number, required: number): string {
  if (required === 0) return "text-gray-600 dark:text-gray-400";
  if (hours !== required) {
    return "text-yellow-600 dark:text-yellow-400";
  }
  return "text-gray-900 dark:text-gray-100";
}

export function MonthlySummary({ reported, expected }: MonthlySummaryData): JSX.Element {
  // Convert minutes to hours
  const workdayHours = minutesToHours(reported.workdaysMinutes);
  const requiredWorkdayHours = minutesToHours(expected.workdaysMinutes);
  const publicHolidayHours = minutesToHours(reported.public_holidaysMinutes);
  const requiredPublicHolidayHours = minutesToHours(expected.public_holidaysMinutes);

  // Calculate overtime and warnings
  const totalExpectedMinutes = expected.workdaysMinutes + expected.public_holidaysMinutes;
  const overtimeMinutes = Math.max(0, reported.totalMinutes - totalExpectedMinutes);
  const overtimeHours = minutesToHours(overtimeMinutes);

  // Public holiday specific calculations
  const publicHolidayOvertimeMinutes = Math.max(
    0,
    reported.public_holidaysMinutes - expected.public_holidaysMinutes
  );
  const publicHolidayOvertimeHours = minutesToHours(publicHolidayOvertimeMinutes);
  const publicHolidayHasWarning = reported.public_holidaysMinutes > expected.public_holidaysMinutes;

  // Calculate total monthly hours
  const totalMonthlyHours = minutesToHours(reported.totalMinutes);
  const totalRequiredHours = minutesToHours(totalExpectedMinutes);
  const totalHoursColor = getHoursColor(totalMonthlyHours, totalRequiredHours);
  const hasTotalMismatch = totalMonthlyHours !== totalRequiredHours;

  const overtimeColor =
    overtimeHours > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400";

  return (
    <div class="space-y-3">
      {/* Monthly Total - Most Important */}
      <div>
        <div class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Monthly Total
        </div>
        <div class="flex items-baseline gap-2 flex-wrap">
          <span class={`text-lg font-bold ${totalHoursColor}`} safe>
            {`${totalMonthlyHours.toFixed(1)}h`}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400" safe>
            / {`${totalRequiredHours.toFixed(1)}h`}
          </span>
          {hasTotalMismatch ? getWarningBadge(totalMonthlyHours, totalRequiredHours) : ""}
        </div>
      </div>

      {/* Breakdown by Type */}
      <div class="space-y-1.5 pt-1 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-baseline justify-between gap-2 flex-wrap">
          <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Workday
          </span>
          <div class="flex items-baseline gap-1.5 flex-wrap">
            <span
              class={`text-xs font-semibold ${getHoursColor(workdayHours, requiredWorkdayHours)}`}
              safe
            >
              {`${workdayHours.toFixed(1)}h`}
            </span>
            <span safe class="text-[10px] text-gray-500 dark:text-gray-400">
              / {`${requiredWorkdayHours.toFixed(1)}h`}
            </span>
            {getWarningBadge(workdayHours, requiredWorkdayHours)}
          </div>
        </div>
        <div class="flex items-baseline justify-between gap-2 flex-wrap">
          <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Public Holiday
          </span>
          <div class="flex items-baseline gap-1.5 flex-wrap">
            <span
              class={`text-xs font-semibold ${getHoursColor(
                publicHolidayHours,
                requiredPublicHolidayHours
              )}`}
              safe
            >
              {`${publicHolidayHours.toFixed(1)}h`}
            </span>
            <span safe class="text-[10px] text-gray-500 dark:text-gray-400">
              {`/ ${requiredPublicHolidayHours.toFixed(1)}h`}
            </span>
            {getWarningBadge(publicHolidayHours, requiredPublicHolidayHours)}
            {publicHolidayHasWarning && publicHolidayOvertimeHours > 0 ? (
              <span
                safe
                class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              >
                {`⚠ + ${publicHolidayOvertimeHours.toFixed(1)}h`}
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      {/* Overtime - Derived Metric */}
      <div class="pt-1 border-t border-gray-200 dark:border-gray-700">
        <div class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Overtime
        </div>
        <div class="flex items-baseline gap-2 flex-wrap">
          <span class={`text-sm font-bold ${overtimeColor}`} safe>
            {`${overtimeHours.toFixed(1)}h `}
          </span>
          {overtimeHours > 0 ? (
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              Overtime
            </span>
          ) : (
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400">
              No overtime
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
