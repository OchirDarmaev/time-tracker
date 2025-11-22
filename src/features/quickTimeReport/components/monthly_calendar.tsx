import { getAllDaysInMonth, formatDate } from "../../../lib/date_utils";
import { quickTimeReporturl } from "../quickTimeReporturl";
import { GridDays } from "./GridDays";

export const REQUIRED_DAILY_HOURS = 8;

export interface Project {
  id: number;
  name: string;
  color?: string;
}

export interface DayProjectBreakdown {
  project_id: number;
  hours: number;
}

export type DayType = "workday" | "public_holiday" | "weekend";

export type Day = {
  date: string;
  dayNumber: number;
  dayName: string;
  isWeekend: boolean;
};

export type GridDay = Day & {
  isEmpty: boolean;
};

export interface MonthlyCalendarProps {
  selectedDate: string;
  hxTarget: string;
  dayHoursMap: Record<string, number>;
  dayProjectBreakdown: Record<string, DayProjectBreakdown[]>;
  projects: Project[];
  dayConfigurations?: Record<string, DayType>;
}

const DEFAULT_PROJECT_COLOR = "var(--project-default)";

export function getProjectColor(
  projectId: number,
  projects: Project[]
): string {
  const project = projects.find((p) => p.id === projectId);
  return project?.color || DEFAULT_PROJECT_COLOR;
}

export function MonthlyCalendar({ props }: { props: MonthlyCalendarProps }) {
  const {
    selectedDate,
    hxTarget,
    dayHoursMap,
    dayProjectBreakdown,
    projects,
    dayConfigurations = {},
  } = props;
  const days = getAllDaysInMonth(selectedDate);

  const today = formatDate(new Date());
  const baseDate = new Date(selectedDate + "T00:00:00");
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const prevMonthDate = new Date(year, month - 1, 1);
  const nextMonthDate = new Date(year, month + 1, 1);
  const prevMonthDateStr = formatDate(prevMonthDate);
  const nextMonthDateStr = formatDate(nextMonthDate);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month];
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const weekDayHeaders = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div class="mb-6">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-(--text-secondary) focus:outline-none"
            hx-get={quickTimeReporturl({
              query: {
                date: prevMonthDateStr,
              },
            })}
            hx-target={hxTarget}
            hx-swap="outerHTML"
            hx-trigger="click"
            hx-scroll="false"
          >
            &lt;
          </button>
          <h3 safe class="text-2xl font-semibold text-[var(--text-primary)]">
            {`${monthName} ${year}`}
          </h3>
          <button
            type="button"
            class="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-[var(--text-secondary)] focus:outline-none"
            hx-get={quickTimeReporturl({
              query: {
                date: nextMonthDateStr,
              },
            })}
            hx-target={hxTarget}
            hx-swap="outerHTML"
            hx-trigger="click"
            hx-scroll="false"
          >
            &gt;
          </button>
        </div>
        <div class="flex justify-center">
          <button
            type="button"
            class="rounded border border-[var(--accent)] bg-[var(--accent-light)] px-5 py-2.5 text-sm font-medium text-[var(--accent)] focus:outline-none"
            hx-get={quickTimeReporturl({
              query: {
                date: today,
              },
            })}
            hx-target={hxTarget}
            hx-swap="outerHTML"
            hx-trigger="click"
            hx-scroll="false"
          >
            Today
          </button>
        </div>
      </div>
      <div class="grid grid-cols-7 gap-3">
        {weekDayHeaders.map((day) => (
          <div
            safe
            class="pb-3 text-center text-xs font-medium text-[var(--text-tertiary)] uppercase"
          >
            {day}
          </div>
        ))}
        <GridDays
          mondayBasedFirstDay={mondayBasedFirstDay}
          days={days}
          dayHoursMap={dayHoursMap}
          selectedDate={selectedDate}
          dayConfigurations={dayConfigurations}
          dayProjectBreakdown={dayProjectBreakdown}
          projects={projects}
          hxTarget={hxTarget}
        />
      </div>
    </div>
  );
}
