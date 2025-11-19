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
    ? "text-orange-600 dark:text-orange-400"
    : isComplete
      ? "text-green-600 dark:text-green-400"
      : requiresDailyHours && reportedHours >= 4
        ? "text-yellow-600 dark:text-yellow-400"
        : requiresDailyHours
          ? "text-red-600 dark:text-red-400"
          : "text-gray-600 dark:text-gray-400";

  return (
    <div class="flex-1 min-w-[140px]">
      <div class="text-[10px] font-medium mb-0.5 text-gray-600 dark:text-gray-400">
        Daily Status
      </div>
      <div class="flex items-baseline gap-2 flex-wrap">
        <span class={`text-2xl font-bold ${statusColor}`} safe>
          {reportedHours.toFixed(1)}h
        </span>
        {requiresDailyHours ? (
          <span class="text-sm text-gray-500 dark:text-gray-400">/ {REQUIRED_DAILY_HOURS}h</span>
        ) : (
          ""
        )}
        {requiresDailyHours ? (
          isOverLimit ? (
            <span class="text-xs text-orange-600 dark:text-orange-400 font-medium">
              ⚠ over limit
            </span>
          ) : isComplete ? (
            <span class="text-xs text-green-600 dark:text-green-400">✓ Complete</span>
          ) : (
            <span class="text-xs text-gray-600 dark:text-gray-400" safe>
              ({remainingHours.toFixed(1)}h needed)
            </span>
          )
        ) : (
          <span class="text-xs text-gray-500 dark:text-gray-400">No time required</span>
        )}
      </div>
    </div>
  );
}
