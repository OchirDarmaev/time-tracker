import { DayType } from "./monthly_calendar";

const REQUIRED_DAILY_HOURS = 8;

export interface DailyStatusProps {
  dayType: DayType | undefined;
  reportedHours: number;
}

export function DailyStatus(props: DailyStatusProps) {
  const { dayType, reportedHours } = props;

  const requiresDailyHours =
    dayType === "workday" || dayType === "public_holiday";

  const remainingHours = requiresDailyHours
    ? Math.max(0, REQUIRED_DAILY_HOURS - reportedHours)
    : 0;
  const isComplete = requiresDailyHours
    ? reportedHours >= REQUIRED_DAILY_HOURS
    : true;
  const isOverLimit = requiresDailyHours
    ? reportedHours > REQUIRED_DAILY_HOURS
    : false;

  const statusColorClass = isOverLimit
    ? "text-[var(--orange)]"
    : isComplete
      ? "text-[var(--success)]"
      : requiresDailyHours && reportedHours >= 4
        ? "text-[var(--warning)]"
        : requiresDailyHours
          ? "text-[var(--error)]"
          : "text-[var(--text-secondary)]";

  return (
    <div class="min-w-[140px] flex-1">
      <div class="mb-2 text-xs font-medium tracking-[0.05em] tracking-wide text-[var(--text-tertiary)] uppercase">
        Daily Status
      </div>
      <div class="flex flex-wrap items-baseline gap-2.5">
        <span
          class={`text-3xl font-bold tracking-[-0.03em] ${statusColorClass}`}
          safe
        >
          {reportedHours.toFixed(1)}h
        </span>
        {requiresDailyHours ? (
          <span class="text-base font-medium tracking-[-0.01em] text-[var(--text-tertiary)]">
            / {REQUIRED_DAILY_HOURS}h
          </span>
        ) : (
          ""
        )}
        {requiresDailyHours ? (
          isOverLimit ? (
            <span class="rounded-lg border border-orange-200/20 bg-[var(--orange-light)] px-2 py-1 text-xs font-semibold text-[var(--orange)]">
              ⚠ over limit
            </span>
          ) : isComplete ? (
            <span class="rounded-lg border border-emerald-200/20 bg-[var(--success-light)] px-2 py-1 text-xs font-semibold text-[var(--success)]">
              ✓ Complete
            </span>
          ) : (
            <span
              class="text-xs font-medium tracking-[-0.01em] text-[var(--text-secondary)]"
              safe
            >
              ({remainingHours.toFixed(1)}h needed)
            </span>
          )
        ) : (
          <span class="text-xs font-medium tracking-[-0.01em] text-[var(--text-tertiary)]">
            No time required
          </span>
        )}
      </div>
    </div>
  );
}
