import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { projectModel } from "@/shared/models/project.js";
import { timeEntryModel } from "@/shared/models/time_entry.js";
import { calendarModel } from "@/shared/models/calendar.js";
import { formatDate, getAllDaysInMonth, getMonthFromDate } from "@/shared/utils/date_utils.js";

import { MonthlyCalendar } from "@/features/account/dashboard/components/monthly-calendar.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { ClientInferRequest } from "@ts-rest/core";
import { getMonthlySummaryData } from "../getMonthlySummaryData";
import { MonthlySummary } from "./MonthlySummary";
import { TimeSlider } from "../components/TimeSlider";
import { getTimeSliderData } from "../getTimeSliderData";

type Request = ClientInferRequest<typeof accountDashboardContract.dashboard>;

export function Dashboard(req: Request, authContext: AuthContext): JSX.Element {
  const { currentUser } = authContext;
  const selectedDate = req.query.date || formatDate(new Date());

  const projects = projectModel.getByUserId(currentUser.id);

  // Get hours for all days in the current month for the monthly calendar
  const month = getMonthFromDate(selectedDate);
  const monthEntries = timeEntryModel.getByUserIdAndMonth(currentUser.id, month);
  const allDaysInMonth = getAllDaysInMonth(selectedDate);
  const dayHoursMap: Record<string, number> = {};
  const dayProjectBreakdown: Record<string, Array<{ project_id: number; hours: number }>> = {};

  // Get calendar days for the current month
  const calendarDays = calendarModel.getByMonth(month);
  const dayConfigurations: Record<string, "workday" | "public_holiday" | "weekend"> = {};
  calendarDays.forEach((day) => {
    dayConfigurations[day.date] = day.day_type;
  });

  // Get day type for selected date to determine if hours are required
  const selectedDayConfig = calendarModel.getByDate(selectedDate);

  // Initialize all days with 0 hours and empty breakdown
  allDaysInMonth.forEach((day) => {
    dayHoursMap[day.date] = 0;
    dayProjectBreakdown[day.date] = [];
  });

  // Calculate hours and project breakdown for each day from entries
  monthEntries.forEach((entry) => {
    const hours = entry.hours;
    dayHoursMap[entry.date] = (dayHoursMap[entry.date] || 0) + hours;

    // Add to project breakdown
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

  const { reported, expected } = getMonthlySummaryData(selectedDate, currentUser);
  const timeSliderData = getTimeSliderData(currentUser, selectedDate);

  return (
    <div
      id="time-tracking-content"
      class="space-y-8"
      style={{ viewTransitionName: "time-tracking-content" }}
    >
      {/* Enhanced Status Bar */}
      <div
        class="rounded-2xl p-6"
        style="background-color: var(--bg-elevated); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);"
      >
        <MonthlySummary reported={reported} expected={expected} />
      </div>
      <div class="flex flex-row gap-8 w-full">
        <div class="w-1/2">
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
        <div class="w-1/2">
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
