import { calendarModel, projectModel, timeEntryModel } from "../../lib/models";
import { getMonthFromDate, getAllDaysInMonth } from "../../lib/date_utils";
import type { Calendar, TimeEntry, Project } from "../../lib/mock_db";

export const REQUIRED_DAILY_HOURS = 8;
export const HOLIDAY_PROJECT_NAME = "Holiday";

export type MonthlySummaryData = {
  reported: {
    workdaysHours: number;
    public_holidaysHours: number;
    totalHours: number;
  };
  expected: {
    workdaysHours: number;
    public_holidaysHours: number;
  };
  issues: {
    missingWorkdayHours: number;
    missingPublicHolidayHours: number;
    incompleteWorkdays: number;
    incompletePublicHolidays: number;
    overtimeHours: number;
  };
};

export async function getMonthlySummaryData(
  date: string,
  currentUser: { id: number; email: string; role: string }
): Promise<MonthlySummaryData> {
  const month = getMonthFromDate(date);
  const monthlyEntries = await timeEntryModel.getByUserIdAndMonth(
    currentUser.id,
    month
  );
  const projects = await projectModel.getByUserId(currentUser.id);

  const calendarDays = await calendarModel.getByMonth(month);
  const allDaysInMonth = getAllDaysInMonth(date);

  const dayTypeMap = new Map<
    string,
    "workday" | "public_holiday" | "weekend"
  >();
  calendarDays.forEach((day: Calendar) => {
    dayTypeMap.set(day.date, day.day_type);
  });

  const dayHoursMap = new Map<string, number>();
  monthlyEntries.forEach((entry: TimeEntry) => {
    const current = dayHoursMap.get(entry.date) || 0;
    dayHoursMap.set(entry.date, current + entry.hours);
  });

  const reported = monthlyEntries.reduce(
    (
      acc: {
        workdaysHours: number;
        public_holidaysHours: number;
        totalHours: number;
      },
      entry: TimeEntry
    ) => {
      const dayType = dayTypeMap.get(entry.date);
      const project = projects.find(
        (p: Project & { suppressed: number }) => p.id === entry.project_id
      );
      const isHolidayProject = project?.name === HOLIDAY_PROJECT_NAME;

      if (dayType === "public_holiday" && isHolidayProject) {
        acc.public_holidaysHours += entry.hours;
      } else if (dayType === "workday" && !isHolidayProject) {
        acc.workdaysHours += entry.hours;
      }

      acc.totalHours += entry.hours;

      return acc;
    },
    { workdaysHours: 0, public_holidaysHours: 0, totalHours: 0 }
  );

  const expected = calendarDays.reduce(
    (
      acc: { workdaysHours: number; public_holidaysHours: number },
      day: Calendar
    ) => {
      if (day.day_type === "workday") {
        acc.workdaysHours += REQUIRED_DAILY_HOURS;
      } else if (day.day_type === "public_holiday") {
        acc.public_holidaysHours += REQUIRED_DAILY_HOURS;
      }
      return acc;
    },
    {
      workdaysHours: 0,
      public_holidaysHours: 0,
    }
  );

  const dayHolidayProjectHoursMap = new Map<string, number>();
  monthlyEntries.forEach((entry: TimeEntry) => {
    const project = projects.find(
      (p: Project & { suppressed: number }) => p.id === entry.project_id
    );
    if (project?.name === HOLIDAY_PROJECT_NAME) {
      const current = dayHolidayProjectHoursMap.get(entry.date) || 0;
      dayHolidayProjectHoursMap.set(entry.date, current + entry.hours);
    }
  });

  let missingWorkdayHours = 0;
  let missingPublicHolidayHours = 0;
  let incompleteWorkdays = 0;
  let incompletePublicHolidays = 0;

  allDaysInMonth.forEach(
    (day: {
      date: string;
      dayNumber: number;
      dayName: string;
      isWeekend: boolean;
    }) => {
      const dayType = dayTypeMap.get(day.date);

      if (dayType === "workday") {
        const totalHours = dayHoursMap.get(day.date) || 0;
        const holidayProjectHours =
          dayHolidayProjectHoursMap.get(day.date) || 0;
        const workdayHours = totalHours - holidayProjectHours;
        const missing = REQUIRED_DAILY_HOURS - workdayHours;
        if (missing > 0) {
          missingWorkdayHours += missing;
          incompleteWorkdays++;
        }
      } else if (dayType === "public_holiday") {
        const holidayProjectHours =
          dayHolidayProjectHoursMap.get(day.date) || 0;
        const missing = REQUIRED_DAILY_HOURS - holidayProjectHours;
        if (missing > 0) {
          missingPublicHolidayHours += missing;
          incompletePublicHolidays++;
        }
      }
    }
  );

  const totalExpectedHours =
    expected.workdaysHours + expected.public_holidaysHours;
  const overtimeHours = Math.max(0, reported.totalHours - totalExpectedHours);

  return {
    reported,
    expected,
    issues: {
      missingWorkdayHours,
      missingPublicHolidayHours,
      incompleteWorkdays,
      incompletePublicHolidays,
      overtimeHours,
    },
  };
}
