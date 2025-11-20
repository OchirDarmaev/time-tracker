import { MonthlySummaryData } from "../getMonthlySummaryData";
import { REQUIRED_DAILY_HOURS } from "../router";

function getWarningBadge(hours: number, required: number): JSX.Element | "" {
  if (required === 0) return "";
  if (hours > required) {
    return (
      <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium" style="background-color: rgba(251, 191, 36, 0.12); color: var(--warning);">
        ⚠ Mismatch
      </span>
    );
  }
  return "";
}

function getHoursColor(hours: number, required: number): string {
  if (required === 0) return "var(--text-secondary)";
  if (hours > required) {
    return "var(--warning)";
  }
  return "var(--text-primary)";
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
    overtimeHours > 0 ? "var(--orange)" : "var(--text-secondary)";

  const totalDays = (workdayHours + publicHolidayHours) / REQUIRED_DAILY_HOURS;

  return (
    <div class="grid grid-cols-4 gap-4 w-full">
      {/* Monthly Total - Most Important */}
      <div class="min-w-0">
        <div
          class="text-[10px] font-medium mb-1 tracking-wide"
          style="color: var(--text-secondary);"
          safe
        >
          Monthly Total: {totalDays.toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span class="text-lg font-bold" style={`color: ${totalHoursColor};`} safe title="Total reported hours">
            {`${totalMonthlyHours.toFixed(1)}h`}
          </span>
          <span class="text-xs" style="color: var(--text-tertiary);" safe title="Total required hours">
            {`/ ${totalRequiredHours.toFixed(1)}h`}
          </span>
          {hasTotalMismatch ? getWarningBadge(totalMonthlyHours, totalRequiredHours) : ""}
        </div>
      </div>

      {/* Workdays */}
      <div class="min-w-0">
        <div
          class="text-[10px] font-medium mb-1 tracking-wide"
          style="color: var(--text-secondary);"
          safe
        >
          Workdays: {(workdayHours / REQUIRED_DAILY_HOURS).toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span
            class="text-xs font-semibold"
            style={`color: ${getHoursColor(workdayHours, requiredWorkdayHours)};`}
            safe
            title="Workday reported hours"
          >
            {`${workdayHours.toFixed(1)}h`}
          </span>
          <span
            class="text-[10px]"
            style="color: var(--text-tertiary);"
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
          class="text-[10px] font-medium mb-1 tracking-wide"
          style="color: var(--text-secondary);"
          safe
        >
          Public Holidays: {(publicHolidayHours / REQUIRED_DAILY_HOURS).toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span
            class="text-xs font-semibold"
            style={`color: ${getHoursColor(
              publicHolidayHours,
              requiredPublicHolidayHours
            )};`}
            safe
            title="Public holiday reported hours"
          >
            {`${publicHolidayHours.toFixed(1)}h`}
          </span>
          <span
            class="text-[10px]"
            style="color: var(--text-tertiary);"
            safe
            title="Public holiday required hours"
          >
            {`/ ${requiredPublicHolidayHours.toFixed(1)}h`}
          </span>
          {getWarningBadge(publicHolidayHours, requiredPublicHolidayHours)}
          {publicHolidayHasWarning && publicHolidayOvertimeHours > 0 ? (
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium"
              style="background-color: rgba(248, 113, 113, 0.12); color: var(--error);"
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
        <div class="text-[10px] font-medium mb-1 tracking-wide" style="color: var(--text-secondary);">
          Overtime
        </div>
        <div class="flex items-baseline gap-2 flex-wrap min-h-[24px]">
          <span class="text-sm font-bold" style={`color: ${overtimeColor};`} safe>
            {`${overtimeHours.toFixed(1)}h`}
          </span>
          {overtimeHours > 0 ? (
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium" style="background-color: rgba(249, 115, 22, 0.12); color: var(--orange);">
              Overtime
            </span>
          ) : (
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
              No overtime
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
