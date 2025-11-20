import { MonthlySummaryData } from "../getMonthlySummaryData";
import { REQUIRED_DAILY_HOURS } from "../router";

function getWarningBadge(hours: number, required: number): JSX.Element | "" {
  if (required === 0) return "";
  if (hours > required) {
    return (
      <span
        class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
        style="background-color: var(--warning-light); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.2);"
      >
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

  const overtimeColor = overtimeHours > 0 ? "var(--orange)" : "var(--text-secondary)";

  const totalDays = (workdayHours + publicHolidayHours) / REQUIRED_DAILY_HOURS;

  return (
    <div class="grid grid-cols-4 gap-6 w-full">
      {/* Monthly Total - Most Important */}
      <div class="min-w-0">
        <div
          class="text-xs font-medium mb-2 tracking-wide uppercase"
          style="color: var(--text-tertiary); letter-spacing: 0.05em;"
          safe
        >
          Monthly Total: {totalDays.toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2.5 flex-wrap min-h-[32px]">
          <span
            class="text-2xl font-bold"
            style={`color: ${totalHoursColor}; letter-spacing: -0.02em;`}
            safe
            title="Total reported hours"
          >
            {`${totalMonthlyHours.toFixed(1)}h`}
          </span>
          <span
            class="text-sm font-medium"
            style="color: var(--text-tertiary); letter-spacing: -0.01em;"
            safe
            title="Total required hours"
          >
            {`/ ${totalRequiredHours.toFixed(1)}h`}
          </span>
          {hasTotalMismatch ? getWarningBadge(totalMonthlyHours, totalRequiredHours) : ""}
        </div>
      </div>

      {/* Workdays */}
      <div class="min-w-0">
        <div
          class="text-xs font-medium mb-2 tracking-wide uppercase"
          style="color: var(--text-tertiary); letter-spacing: 0.05em;"
          safe
        >
          Workdays: {(workdayHours / REQUIRED_DAILY_HOURS).toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2.5 flex-wrap min-h-[32px]">
          <span
            class="text-xl font-bold"
            style={`color: ${getHoursColor(workdayHours, requiredWorkdayHours)}; letter-spacing: -0.02em;`}
            safe
            title="Workday reported hours"
          >
            {`${workdayHours.toFixed(1)}h`}
          </span>
          <span
            class="text-sm font-medium"
            style="color: var(--text-tertiary); letter-spacing: -0.01em;"
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
          class="text-xs font-medium mb-2 tracking-wide uppercase"
          style="color: var(--text-tertiary); letter-spacing: 0.05em;"
          safe
        >
          Public Holidays: {(publicHolidayHours / REQUIRED_DAILY_HOURS).toFixed(1)} days
        </div>
        <div class="flex items-baseline gap-2.5 flex-wrap min-h-[32px]">
          <span
            class="text-xl font-bold"
            style={`color: ${getHoursColor(
              publicHolidayHours,
              requiredPublicHolidayHours
            )}; letter-spacing: -0.02em;`}
            safe
            title="Public holiday reported hours"
          >
            {`${publicHolidayHours.toFixed(1)}h`}
          </span>
          <span
            class="text-sm font-medium"
            style="color: var(--text-tertiary); letter-spacing: -0.01em;"
            safe
            title="Public holiday required hours"
          >
            {`/ ${requiredPublicHolidayHours.toFixed(1)}h`}
          </span>
          {getWarningBadge(publicHolidayHours, requiredPublicHolidayHours)}
          {publicHolidayHasWarning && publicHolidayOvertimeHours > 0 ? (
            <span
              class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
              style="background-color: var(--error-light); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2);"
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
        <div
          class="text-xs font-medium mb-2 tracking-wide uppercase"
          style="color: var(--text-tertiary); letter-spacing: 0.05em;"
        >
          Overtime
        </div>
        <div class="flex items-baseline gap-2.5 flex-wrap min-h-[32px]">
          <span
            class="text-xl font-bold"
            style={`color: ${overtimeColor}; letter-spacing: -0.02em;`}
            safe
          >
            {`${overtimeHours.toFixed(1)}h`}
          </span>
          {overtimeHours > 0 ? (
            <span
              class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
              style="background-color: var(--orange-light); color: var(--orange); border: 1px solid rgba(249, 115, 22, 0.2);"
            >
              Overtime
            </span>
          ) : (
            <span
              class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
              style="background-color: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-subtle);"
            >
              No overtime
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
