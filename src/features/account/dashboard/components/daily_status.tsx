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
    ? reportedHours >= REQUIRED_DAILY_HOURS
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
      <div
        class="text-xs font-medium mb-2 uppercase tracking-wide"
        style="color: var(--text-tertiary); letter-spacing: 0.05em;"
      >
        Daily Status
      </div>
      <div class="flex items-baseline gap-2.5 flex-wrap">
        <span
          class="text-3xl font-bold"
          style={`color: ${statusColor}; letter-spacing: -0.03em;`}
          safe
        >
          {reportedHours.toFixed(1)}h
        </span>
        {requiresDailyHours ? (
          <span
            class="text-base font-medium"
            style="color: var(--text-tertiary); letter-spacing: -0.01em;"
          >
            / {REQUIRED_DAILY_HOURS}h
          </span>
        ) : (
          ""
        )}
        {requiresDailyHours ? (
          isOverLimit ? (
            <span
              class="text-xs font-semibold px-2 py-1 rounded-lg"
              style="color: var(--orange); background-color: var(--orange-light); border: 1px solid rgba(249, 115, 22, 0.2);"
            >
              ⚠ over limit
            </span>
          ) : isComplete ? (
            <span
              class="text-xs font-semibold px-2 py-1 rounded-lg"
              style="color: var(--success); background-color: var(--success-light); border: 1px solid rgba(16, 185, 129, 0.2);"
            >
              ✓ Complete
            </span>
          ) : (
            <span
              class="text-xs font-medium"
              style="color: var(--text-secondary); letter-spacing: -0.01em;"
              safe
            >
              ({remainingHours.toFixed(1)}h needed)
            </span>
          )
        ) : (
          <span
            class="text-xs font-medium"
            style="color: var(--text-tertiary); letter-spacing: -0.01em;"
          >
            No time required
          </span>
        )}
      </div>
    </div>
  );
}
