import { DayButton } from "./DayButton";
import { Day, DayType, DayProjectBreakdown, Project } from "./MonthlyCalendar";

export type GridDaysProps = {
  mondayBasedFirstDay: number;
  days: Day[];
  dayHoursMap: Record<string, number>;
  selectedDate: string;
  dayConfigurations: Record<string, DayType>;
  dayProjectBreakdown: Record<string, DayProjectBreakdown[]>;
  projects: Project[];
  hxTarget: string;
};

export function GridDays({
  mondayBasedFirstDay,
  days,
  dayHoursMap,
  selectedDate,
  dayConfigurations,
  dayProjectBreakdown,
  projects,
  hxTarget,
}: GridDaysProps) {
  return (
    <>
      {Array.from({ length: mondayBasedFirstDay }).map((_, index) => (
        <div key={index} class="aspect-square"></div>
      ))}
      {days.map((day) => (
        <DayButton
          key={day.date}
          day={{ ...day, isEmpty: false }}
          dayHoursMap={dayHoursMap}
          selectedDate={selectedDate}
          dayConfigurations={dayConfigurations}
          dayProjectBreakdown={dayProjectBreakdown}
          projects={projects}
          hxTarget={hxTarget}
        />
      ))}
    </>
  );
}
