import { MonthlySummaryData } from "../getMonthlySummaryData";
import { REQUIRED_DAILY_HOURS } from "../router";

function getWarningBadge(hours: number, required: number): JSX.Element | "" {
  if (required === 0) return "";
  if (hours > required) {
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
  if (hours > required) {
    return "text-yellow-600 dark:text-yellow-400";
  }
  return "text-gray-900 dark:text-gray-100";
}

export function MonthlySummary({ reported, expected }: MonthlySummaryData): JSX.Element {
  const workdayHours = reported.workdaysHours;
  const requiredWorkdayHours = expected.workdaysHours;
  const publicHolidayHours = reported.public_holidaysHours;
  const requiredPublicHolidayHours = expected.public_holidaysHours;

  // Calculate overtime and warnings
  const totalExpectedHours = expected.workdaysHours + expected.public_holidaysHours;
  const overtimeHours = Math.max(0, reported.totalHours - totalExpectedHours);

  // Public holiday specific calculations
  const publicHolidayOvertimeHours = Math.max(
    0,
    reported.public_holidaysHours - expected.public_holidaysHours
  );
  const publicHolidayHasWarning = reported.public_holidaysHours > expected.public_holidaysHours;

  // Calculate total monthly hours
  const totalMonthlyHours = reported.totalHours;
  const totalRequiredHours = totalExpectedHours;
  const totalHoursColor = getHoursColor(totalMonthlyHours, totalRequiredHours);
  const hasTotalMismatch = totalMonthlyHours !== totalRequiredHours;

  const overtimeColor =
    overtimeHours > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400";

  const totalDays = (workdayHours + publicHolidayHours) / REQUIRED_DAILY_HOURS;

  return (
    <div class="grid grid-cols-4 gap-4 w-full">
      {/* Monthly Total - Most Important */}
      <div class="min-w-0">
        <div
          class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 tracking-wide"
          safe
        >
          Monthly Total: {totalDays.toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span class={`text-lg font-bold ${totalHoursColor}`} safe title="Total reported hours">
            {`${totalMonthlyHours.toFixed(1)}h`}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400" safe title="Total required hours">
            {`/ ${totalRequiredHours.toFixed(1)}h`}
          </span>
          {hasTotalMismatch ? getWarningBadge(totalMonthlyHours, totalRequiredHours) : ""}
        </div>
      </div>

      {/* Workdays */}
      <div class="min-w-0">
        <div
          class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 tracking-wide"
          safe
        >
          Workdays: {(workdayHours / REQUIRED_DAILY_HOURS).toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span
            class={`text-xs font-semibold ${getHoursColor(workdayHours, requiredWorkdayHours)}`}
            safe
            title="Workday reported hours"
          >
            {`${workdayHours.toFixed(1)}h`}
          </span>
          <span
            class="text-[10px] text-gray-500 dark:text-gray-400"
            safe
            title="Workday required hours"
          >
            {`/ ${requiredWorkdayHours.toFixed(1)}h`}
          </span>
          {getWarningBadge(workdayHours, requiredWorkdayHours)}
        </div>
      </div>

      {/* Public Holidays */}
      <div class="min-w-0">
        <div
          class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 tracking-wide"
          safe
        >
          Public Holidays: {(publicHolidayHours / REQUIRED_DAILY_HOURS).toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span
            class={`text-xs font-semibold ${getHoursColor(
              publicHolidayHours,
              requiredPublicHolidayHours
            )}`}
            safe
            title="Public holiday reported hours"
          >
            {`${publicHolidayHours.toFixed(1)}h`}
          </span>
          <span
            class="text-[10px] text-gray-500 dark:text-gray-400"
            safe
            title="Public holiday required hours"
          >
            {`/ ${requiredPublicHolidayHours.toFixed(1)}h`}
          </span>
          {getWarningBadge(publicHolidayHours, requiredPublicHolidayHours)}
          {publicHolidayHasWarning && publicHolidayOvertimeHours > 0 ? (
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              safe
            >
              {`⚠ + ${publicHolidayOvertimeHours.toFixed(1)}h`}
            </span>
          ) : (
            ""
          )}
        </div>
      </div>

      {/* Overtime - Derived Metric */}
      <div class="min-w-0">
        <div class="text-[10px] font-medium mb-1 text-gray-600 dark:text-gray-400 tracking-wide">
          Overtime
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span class={`text-sm font-bold ${overtimeColor}`} safe>
            {`${overtimeHours.toFixed(1)}h`}
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
