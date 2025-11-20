import { DayType } from "./monthly-calendar";

const REQUIRED_DAILY_HOURS = 8;

export interface DailyStatusProps {
  dayType: DayType | undefined;
  reportedHours: number;
}

export function DailyStatus(props: DailyStatusProps): JSX.Element {
  const { dayType, reportedHours } = props;

  const requiresDailyHours = dayType === "workday" || dayType === "public_holiday";

  const remainingHours = requiresDailyHours ? Math.max(0, REQUIRED_DAILY_HOURS - reportedHours) : 0;
  const isComplete = requiresDailyHours
    ? reportedHours >= REQUIRED_DAILY_HOURS && reportedHours <= REQUIRED_DAILY_HOURS
    : true;
  const isOverLimit = requiresDailyHours ? reportedHours > REQUIRED_DAILY_HOURS : false;
  const statusColor = isOverLimit
    ? "var(--orange)"
    : isComplete
      ? "var(--success)"
      : requiresDailyHours && reportedHours >= 4
        ? "var(--warning)"
        : requiresDailyHours
          ? "var(--error)"
          : "var(--text-secondary)";

  return (
    <div class="flex-1 min-w-[140px]">
      <div class="text-[10px] font-medium mb-0.5" style="color: var(--text-secondary);">
        Daily Status
      </div>
      <div class="flex items-baseline gap-2 flex-wrap">
        <span class="text-2xl font-bold" style={`color: ${statusColor};`} safe>
          {reportedHours.toFixed(1)}h
        </span>
        {requiresDailyHours ? (
          <span class="text-sm" style="color: var(--text-tertiary);">/ {REQUIRED_DAILY_HOURS}h</span>
        ) : (
          ""
        )}
        {requiresDailyHours ? (
          isOverLimit ? (
            <span class="text-xs font-medium" style="color: var(--orange);">
              ⚠ over limit
            </span>
          ) : isComplete ? (
            <span class="text-xs" style="color: var(--success);">✓ Complete</span>
          ) : (
            <span class="text-xs" style="color: var(--text-secondary);" safe>
              ({remainingHours.toFixed(1)}h needed)
            </span>
          )
        ) : (
          <span class="text-xs" style="color: var(--text-tertiary);">No time required</span>
        )}
      </div>
    </div>
  );
}
