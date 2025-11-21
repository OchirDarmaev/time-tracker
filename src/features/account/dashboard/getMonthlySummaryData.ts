import { calendarModel } from "../../../shared/models/calendar";
import { projectModel } from "../../../shared/models/project";
import { timeEntryModel } from "../../../shared/models/time_entry";
import { UserRole } from "../../../shared/models/user";
import { getMonthFromDate, getAllDaysInMonth } from "../../../shared/utils/date_utils";
import { HOLIDAY_PROJECT_NAME, REQUIRED_DAILY_HOURS } from "./router";

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

export function getMonthlySummaryData(
  date: string,
  currentUser: { id: number; email: string; role: UserRole; roles: UserRole[] }
): MonthlySummaryData {
  const month = getMonthFromDate(date);
  const monthlyEntries = timeEntryModel.getByUserIdAndMonth(currentUser.id, month);
  const projects = projectModel.getByUserId(currentUser.id);

  // Get calendar days for the month
  const calendarDays = calendarModel.getByMonth(month);
  const allDaysInMonth = getAllDaysInMonth(date);
  
  // Create a map of date -> day type
  const dayTypeMap = new Map<string, "workday" | "public_holiday" | "weekend">();
  calendarDays.forEach((day) => {
    dayTypeMap.set(day.date, day.day_type);
  });
  
  // Create a map of date -> reported hours (for missing hours calculation)
  const dayHoursMap = new Map<string, number>();
  monthlyEntries.forEach((entry) => {
    const current = dayHoursMap.get(entry.date) || 0;
    dayHoursMap.set(entry.date, current + entry.hours);
  });

  // Categorize reported hours:
  // - public_holidaysHours: only hours logged to "Holiday" project on public holiday days
  // - workdaysHours: all other hours on workdays (excluding Holiday project hours)
  const reported = monthlyEntries.reduce(
    (acc, entry) => {
      const dayType = dayTypeMap.get(entry.date);
      const project = projects.find((p) => p.id === entry.project_id);
      const isHolidayProject = project?.name === HOLIDAY_PROJECT_NAME;
      
      if (dayType === "public_holiday" && isHolidayProject) {
        // Only count Holiday project hours on public holiday days as public_holidaysHours
        acc.public_holidaysHours += entry.hours;
      } else if (dayType === "workday" && !isHolidayProject) {
        // Count all non-Holiday project hours on workdays as workdaysHours
        acc.workdaysHours += entry.hours;
      }
      // Note: Holiday project hours on workdays or non-Holiday hours on public holidays
      // are not counted in either category, but still count in totalHours
      
      acc.totalHours += entry.hours;

      return acc;
    },
    { workdaysHours: 0, public_holidaysHours: 0, totalHours: 0 }
  );

  const expected = calendarDays.reduce(
    (acc, day) => {
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

  // Calculate issues: missing hours and incomplete days
  // Create a map of date -> hours logged to Holiday project
  const dayHolidayProjectHoursMap = new Map<string, number>();
  monthlyEntries.forEach((entry) => {
    const project = projects.find((p) => p.id === entry.project_id);
    if (project?.name === HOLIDAY_PROJECT_NAME) {
      const current = dayHolidayProjectHoursMap.get(entry.date) || 0;
      dayHolidayProjectHoursMap.set(entry.date, current + entry.hours);
    }
  });

  let missingWorkdayHours = 0;
  let missingPublicHolidayHours = 0;
  let incompleteWorkdays = 0;
  let incompletePublicHolidays = 0;
  
  allDaysInMonth.forEach((day) => {
    const dayType = dayTypeMap.get(day.date);
    
    if (dayType === "workday") {
      // For workdays, check total hours (excluding Holiday project)
      const totalHours = dayHoursMap.get(day.date) || 0;
      const holidayProjectHours = dayHolidayProjectHoursMap.get(day.date) || 0;
      const workdayHours = totalHours - holidayProjectHours;
      const missing = REQUIRED_DAILY_HOURS - workdayHours;
      if (missing > 0) {
        missingWorkdayHours += missing;
        incompleteWorkdays++;
      }
    } else if (dayType === "public_holiday") {
      // For public holidays, only check Holiday project hours
      const holidayProjectHours = dayHolidayProjectHoursMap.get(day.date) || 0;
      const missing = REQUIRED_DAILY_HOURS - holidayProjectHours;
      if (missing > 0) {
        missingPublicHolidayHours += missing;
        incompletePublicHolidays++;
      }
    }
  });

  const totalExpectedHours = expected.workdaysHours + expected.public_holidaysHours;
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
