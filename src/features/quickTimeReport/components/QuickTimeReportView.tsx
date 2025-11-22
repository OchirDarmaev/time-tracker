import { getAllDaysInMonth, getMonthFromDate } from "../../../lib/date_utils";
import {
  projectModel,
  timeEntryModel,
  calendarModel,
} from "../../../lib/models";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { getMonthlySummaryData } from "../getMonthlySummaryData";
import MonthlySummary from "./MonthlySummary";
import TimeSlider from "./TimeSlider";
import { getTimeSliderData } from "../getTimeSliderData";

export default async function QuickTimeReportView({
  currentUser,
  selectedDate,
}: {
  currentUser: { id: number; email: string; role: string };
  selectedDate: string;
}) {
  const projects = await projectModel.getByUserId(currentUser.id);

  const month = getMonthFromDate(selectedDate);
  const monthEntries = await timeEntryModel.getByUserIdAndMonth(
    currentUser.id,
    month
  );
  const allDaysInMonth = getAllDaysInMonth(selectedDate);
  const dayHoursMap: Record<string, number> = {};
  const dayProjectBreakdown: Record<
    string,
    Array<{ project_id: number; hours: number }>
  > = {};

  const calendarDays = await calendarModel.getByMonth(month);
  const dayConfigurations: Record<
    string,
    "workday" | "public_holiday" | "weekend"
  > = {};
  calendarDays.forEach((day) => {
    dayConfigurations[day.date] = day.day_type;
  });

  const selectedDayConfig = await calendarModel.getByDate(selectedDate);

  allDaysInMonth.forEach((day) => {
    dayHoursMap[day.date] = 0;
    dayProjectBreakdown[day.date] = [];
  });

  monthEntries.forEach((entry) => {
    const hours = entry.hours;
    dayHoursMap[entry.date] = (dayHoursMap[entry.date] || 0) + hours;

    if (!dayProjectBreakdown[entry.date]) {
      dayProjectBreakdown[entry.date] = [];
    }
    const existingProject = dayProjectBreakdown[entry.date].find(
      (p) => p.project_id === entry.project_id
    );
    if (existingProject) {
      existingProject.hours += entry.hours;
    } else {
      dayProjectBreakdown[entry.date].push({
        project_id: entry.project_id,
        hours: entry.hours,
      });
    }
  });

  const selectedDayType = selectedDayConfig?.day_type;

  const monthlySummaryData = await getMonthlySummaryData(
    selectedDate,
    currentUser
  );
  const timeSliderData = await getTimeSliderData(currentUser, selectedDate);

  return (
    <div id="time-tracking-content" class="space-y-8">
      <div class="flex w-full flex-row gap-8">
        <div class="w-1/3">
          <MonthlySummary {...monthlySummaryData} />
        </div>
        <div class="w-1/3">
          <MonthlyCalendar
            props={{
              selectedDate: selectedDate,
              hxTarget: "#time-tracking-content",
              dayHoursMap: dayHoursMap,
              dayProjectBreakdown: dayProjectBreakdown,
              projects: projects.map((p) => ({
                id: p.id,
                name: p.name,
                color: p.color,
              })),
              dayConfigurations: dayConfigurations,
            }}
          />
        </div>
        <div class="w-1/3">
          <TimeSlider
            dayType={selectedDayType}
            reportedHours={timeSliderData.sliderTotalHours}
            segments={timeSliderData.segmentsForSlider}
            projects={timeSliderData.projects}
            date={selectedDate}
            hxTarget="#time-tracking-content"
          />
        </div>
      </div>
    </div>
  );
}
