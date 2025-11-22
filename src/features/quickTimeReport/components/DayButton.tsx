import { quickTimeReporturl } from "../quickTimeReporturl";
import CircleDiagram from "./CircleDiagram";
import { DayType, GridDay } from "./monthly_calendar";
import { DayProjectBreakdown } from "./monthly_calendar";
import { Project } from "./monthly_calendar";

export type DayButtonProps = {
  day: GridDay;
  dayHoursMap: Record<string, number>;
  selectedDate: string;
  dayConfigurations: Record<string, DayType>;
  dayProjectBreakdown: Record<string, DayProjectBreakdown[]>;
  projects: Project[];
  hxTarget: string;
};

export function DayButton({
  day,
  dayHoursMap,
  selectedDate,
  dayConfigurations,
  dayProjectBreakdown,
  projects,
  hxTarget,
}: DayButtonProps) {
  if (day.isEmpty) {
    return <div class="aspect-square"></div>;
  }

  const hours = dayHoursMap[day.date] || 0;
  const isSelected = day.date === selectedDate;
  const hasHours = hours > 0;
  const dayType = dayConfigurations[day.date];
  const isPublicHoliday = dayType === "public_holiday";
  const isWeekend = dayType === "weekend";
  const isWorkday = dayType === "workday";

  const breakdown = dayProjectBreakdown[day.date] || [];
  const circleDiagram = hasHours ? (
    <CircleDiagram
      breakdown={breakdown}
      projects={projects}
      totalHours={hours}
      size={48}
    />
  ) : null;

  let textColorClass = "text-[var(--text-primary)]";
  let bgColorClass = "bg-transparent";

  if (isPublicHoliday) {
    textColorClass = "text-[var(--error)]";
  } else if (isWeekend) {
    textColorClass = "text-[var(--text-tertiary)]";
  } else if (isWorkday) {
    textColorClass = "text-[var(--info)]";
  } else if (day.isWeekend) {
    textColorClass = "text-[var(--text-tertiary)]";
  }

  if (isSelected) {
    bgColorClass = "bg-[var(--accent-light)]";
  }

  let title = `${hours.toFixed(1)}h`;
  if (isPublicHoliday) {
    title += " - Public Holiday";
  } else if (isWeekend) {
    title += " - Weekend";
  } else if (isWorkday) {
    title += " - Workday";
  }

  return (
    <button
      type="button"
      class={`relative flex aspect-square items-center justify-center rounded focus:outline-none ${bgColorClass} ${textColorClass} ${isSelected ? "border-2 border-(--accent)" : ""} `}
      hx-get={quickTimeReporturl({
        query: {
          date: day.date,
        },
      })}
      hx-target={hxTarget}
      hx-swap="outerHTML"
      hx-trigger="click"
      hx-scroll="false"
      title={title}
    >
      {circleDiagram}
      <span class="relative z-10 text-sm font-bold">{day.dayNumber}</span>
    </button>
  );
}
