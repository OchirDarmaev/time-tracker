import { MonthlySummaryData } from "../getMonthlySummaryData";
import { REQUIRED_DAILY_HOURS } from "../router";

type StatusType = "good" | "warning" | "critical";

function getStatus(
  reported: number,
  expected: number,
  missingHours: number,
  incompleteDays: number
): StatusType {
  if (expected === 0) return "good";
  // Warn if reported hours exceed expected
  if (reported > expected) return "warning";
  // Good if exactly right (no missing hours and no incomplete days)
  if (missingHours === 0 && incompleteDays === 0) return "good";
  // Warning if close (within 90% of expected)
  if (reported >= expected * 0.9) return "warning";
  // Critical if significantly below expected
  return "critical";
}

function getStatusIcon(status: StatusType): string {
  if (status === "good") return "✓";
  if (status === "warning") return "⚠";
  return "✗";
}

function getStatusColor(status: StatusType): string {
  if (status === "good") return "text-[var(--success)]";
  if (status === "warning") return "text-[var(--warning)]";
  return "text-[var(--error)]";
}

function getStatusBg(status: StatusType): string {
  if (status === "good") return "bg-[var(--success)]/10";
  if (status === "warning") return "bg-[var(--warning)]/10";
  return "bg-[var(--error)]/10";
}

export function MonthlySummary({ reported, expected, issues }: MonthlySummaryData): JSX.Element {
  const workdayStatus = getStatus(
    reported.workdaysHours,
    expected.workdaysHours,
    issues.missingWorkdayHours,
    issues.incompleteWorkdays
  );
  const publicHolidayStatus = getStatus(
    reported.public_holidaysHours,
    expected.public_holidaysHours,
    issues.missingPublicHolidayHours,
    issues.incompletePublicHolidays
  );

  // Check if there's over-reporting
  const workdayOverReported = reported.workdaysHours > expected.workdaysHours;
  const holidayOverReported = reported.public_holidaysHours > expected.public_holidaysHours;
  const totalOverReported =
    reported.workdaysHours + reported.public_holidaysHours >
    expected.workdaysHours + expected.public_holidaysHours;

  const overallStatus: StatusType =
    workdayStatus === "critical" || publicHolidayStatus === "critical"
      ? "critical"
      : workdayStatus === "warning" || publicHolidayStatus === "warning" || totalOverReported
        ? "warning"
        : "good";

  // Calculate days from hours
  const workdaysReportedDays = reported.workdaysHours / REQUIRED_DAILY_HOURS;
  const workdaysExpectedDays = expected.workdaysHours / REQUIRED_DAILY_HOURS;
  const holidaysReportedDays = reported.public_holidaysHours / REQUIRED_DAILY_HOURS;
  const holidaysExpectedDays = expected.public_holidaysHours / REQUIRED_DAILY_HOURS;
  const totalReportedHours = reported.workdaysHours + reported.public_holidaysHours;
  const totalExpectedHours = expected.workdaysHours + expected.public_holidaysHours;
  const totalReportedDays = totalReportedHours / REQUIRED_DAILY_HOURS;
  const totalExpectedDays = totalExpectedHours / REQUIRED_DAILY_HOURS;

  return (
    <div class="space-y-2">
      {/* Summary Table */}
      <div class="border rounded p-2" style="border-color: var(--border-subtle);">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b" style="border-color: var(--border-subtle);">
                <th class="text-left py-1 px-2 font-medium text-[var(--text-secondary)]">
                  Category
                </th>
                <th class="text-right py-1 px-2 font-medium text-[var(--text-secondary)]">
                  Reported Hours
                </th>
                <th class="text-right py-1 px-2 font-medium text-[var(--text-secondary)]">
                  Expected Hours
                </th>
                <th class="text-right py-1 px-2 font-medium text-[var(--text-secondary)]">
                  Reported Days
                </th>
                <th class="text-right py-1 px-2 font-medium text-[var(--text-secondary)]">
                  Expected Days
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b" style="border-color: var(--border-subtle);">
                <td class="py-1 px-2 text-[var(--text-primary)]">Workdays</td>
                <td class="py-1 px-2 text-right text-[var(--text-primary)]" safe>
                  {reported.workdaysHours.toFixed(1)}h
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-tertiary)]" safe>
                  {expected.workdaysHours.toFixed(1)}h
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-primary)]" safe>
                  {workdaysReportedDays.toFixed(1)}
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-tertiary)]" safe>
                  {workdaysExpectedDays.toFixed(1)}
                </td>
              </tr>
              <tr class="border-b" style="border-color: var(--border-subtle);">
                <td class="py-1 px-2 text-[var(--text-primary)]">Holidays</td>
                <td class="py-1 px-2 text-right text-[var(--text-primary)]" safe>
                  {reported.public_holidaysHours.toFixed(1)}h
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-tertiary)]" safe>
                  {expected.public_holidaysHours.toFixed(1)}h
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-primary)]" safe>
                  {holidaysReportedDays.toFixed(1)}
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-tertiary)]" safe>
                  {holidaysExpectedDays.toFixed(1)}
                </td>
              </tr>
              <tr class="font-medium">
                <td class="py-1 px-2 text-[var(--text-primary)]">Total</td>
                <td class="py-1 px-2 text-right text-[var(--text-primary)]" safe>
                  {totalReportedHours.toFixed(1)}h
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-tertiary)]" safe>
                  {totalExpectedHours.toFixed(1)}h
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-primary)]" safe>
                  {totalReportedDays.toFixed(1)}
                </td>
                <td class="py-1 px-2 text-right text-[var(--text-tertiary)]" safe>
                  {totalExpectedDays.toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Overall Status */}
      <div class={`rounded p-2 ${getStatusBg(overallStatus)}`}>
        <div class="flex items-center gap-2">
          <span class={`text-lg font-bold ${getStatusColor(overallStatus)}`} safe>
            {getStatusIcon(overallStatus)}
          </span>
          <div class="flex-1">
            <div class="text-sm font-medium text-[var(--text-primary)]" safe>
              {overallStatus === "good"
                ? "All hours reported correctly"
                : overallStatus === "warning" && totalOverReported
                  ? "Over-reported hours detected"
                  : overallStatus === "warning"
                    ? "Almost complete - minor issues"
                    : "Action required - missing hours"}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Workdays Status */}
        <div class="border rounded p-2" style="border-color: var(--border-subtle);">
          <div class="flex items-center justify-between mb-1">
            <div class="text-sm font-medium text-[var(--text-primary)]">Workdays</div>
            <div class={`flex items-center gap-1 ${getStatusColor(workdayStatus)}`}>
              <span class="text-sm font-bold" safe>
                {getStatusIcon(workdayStatus)}
              </span>
              <span class="text-xs font-medium" safe>
                {workdayStatus === "good"
                  ? "Complete"
                  : workdayStatus === "warning" && workdayOverReported
                    ? "Over-reported"
                    : workdayStatus === "warning"
                      ? "Partial"
                      : "Incomplete"}
              </span>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-bold text-[var(--text-primary)]" safe>
                {reported.workdaysHours.toFixed(1)}h
              </span>
              <span class="text-xs text-[var(--text-tertiary)]" safe>
                / {expected.workdaysHours.toFixed(1)}h
              </span>
            </div>
            {issues.missingWorkdayHours > 0 && (
              <div class="text-xs">
                <span class="text-[var(--error)] font-medium" safe>
                  Missing {issues.missingWorkdayHours.toFixed(1)}h
                </span>
                {issues.incompleteWorkdays > 0 && (
                  <span class="text-[var(--text-secondary)] ml-1" safe>
                    ({issues.incompleteWorkdays} {issues.incompleteWorkdays === 1 ? "day" : "days"})
                  </span>
                )}
              </div>
            )}
            {workdayOverReported && (
              <div class="text-xs text-[var(--warning)]" safe>
                Over-reported by {(reported.workdaysHours - expected.workdaysHours).toFixed(1)}h
              </div>
            )}
            {issues.missingWorkdayHours === 0 &&
              issues.incompleteWorkdays === 0 &&
              !workdayOverReported && <div class="text-xs text-[var(--success)]">Complete</div>}
          </div>
        </div>

        {/* Public Holidays Status */}
        <div class="border rounded p-2" style="border-color: var(--border-subtle);">
          <div class="flex items-center justify-between mb-1">
            <div class="text-sm font-medium text-[var(--text-primary)]">Public Holidays</div>
            <div class={`flex items-center gap-1 ${getStatusColor(publicHolidayStatus)}`}>
              <span class="text-sm font-bold" safe>
                {getStatusIcon(publicHolidayStatus)}
              </span>
              <span class="text-xs font-medium" safe>
                {publicHolidayStatus === "good"
                  ? "Complete"
                  : publicHolidayStatus === "warning" && holidayOverReported
                    ? "Over-reported"
                    : publicHolidayStatus === "warning"
                      ? "Partial"
                      : "Incomplete"}
              </span>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex items-baseline gap-1">
              <span class="text-lg font-bold text-[var(--text-primary)]" safe>
                {reported.public_holidaysHours.toFixed(1)}h
              </span>
              <span class="text-xs text-[var(--text-tertiary)]" safe>
                / {expected.public_holidaysHours.toFixed(1)}h
              </span>
            </div>
            {issues.missingPublicHolidayHours > 0 && (
              <div class="text-xs">
                <span class="text-[var(--error)] font-medium" safe>
                  Missing {issues.missingPublicHolidayHours.toFixed(1)}h
                </span>
                {issues.incompletePublicHolidays > 0 && (
                  <span class="text-[var(--text-secondary)] ml-1" safe>
                    ({issues.incompletePublicHolidays}{" "}
                    {issues.incompletePublicHolidays === 1 ? "day" : "days"})
                  </span>
                )}
              </div>
            )}
            {holidayOverReported && (
              <div class="text-xs text-[var(--warning)]" safe>
                Over-reported by{" "}
                {(reported.public_holidaysHours - expected.public_holidaysHours).toFixed(1)}h
              </div>
            )}
            {issues.missingPublicHolidayHours === 0 &&
              issues.incompletePublicHolidays === 0 &&
              !holidayOverReported && <div class="text-xs text-[var(--success)]">Complete</div>}
            {expected.public_holidaysHours === 0 && (
              <div class="text-xs text-[var(--text-secondary)]">No holidays</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Items */}
      {(issues.missingWorkdayHours > 0 ||
        issues.missingPublicHolidayHours > 0 ||
        issues.overtimeHours > 0) && (
        <div class="border rounded p-2" style="border-color: var(--border-subtle);">
          <div class="text-xs font-medium text-[var(--text-primary)] mb-1">What to do:</div>
          <ul class="space-y-1 text-xs text-[var(--text-secondary)]">
            {issues.missingWorkdayHours > 0 && (
              <li>
                <span safe>
                  {`• Report ${issues.missingWorkdayHours.toFixed(1)}h for workdays`}
                </span>
                {issues.incompleteWorkdays > 0 && (
                  <span>
                    {" "}
                    ({issues.incompleteWorkdays} {issues.incompleteWorkdays === 1 ? "day" : "days"})
                  </span>
                )}
              </li>
            )}
            {issues.missingPublicHolidayHours > 0 && (
              <li>
                <span safe>
                  {`• Report ${issues.missingPublicHolidayHours.toFixed(1)}h for public holidays`}
                </span>
                {issues.incompletePublicHolidays > 0 && (
                  <span>
                    {" "}
                    ({issues.incompletePublicHolidays}{" "}
                    {issues.incompletePublicHolidays === 1 ? "day" : "days"})
                  </span>
                )}
              </li>
            )}
            {issues.overtimeHours > 0 && (
              <li class="text-[var(--warning)]" safe>
                • {issues.overtimeHours.toFixed(1)}h overtime
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
