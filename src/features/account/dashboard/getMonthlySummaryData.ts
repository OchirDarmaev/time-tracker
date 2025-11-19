import { calendarModel } from "../../../shared/models/calendar";
import { projectModel } from "../../../shared/models/project";
import { timeEntryModel } from "../../../shared/models/time_entry";
import { UserRole } from "../../../shared/models/user";
import { getMonthFromDate } from "../../../shared/utils/date_utils";
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
};

export function getMonthlySummaryData(
  date: string,
  currentUser: { id: number; email: string; role: UserRole; roles: UserRole[] }
): MonthlySummaryData {
  const month = getMonthFromDate(date);
  const monthlyEntries = timeEntryModel.getByUserIdAndMonth(currentUser.id, month);
  const projects = projectModel.getByUserId(currentUser.id);

  const reported = monthlyEntries.reduce(
    (acc, entry) => {
      const project = projects.find((p) => p.id === entry.project_id);
      if (project?.name === HOLIDAY_PROJECT_NAME) {
        acc.public_holidaysHours += entry.hours;
      } else {
        acc.workdaysHours += entry.hours;
      }
      acc.totalHours += entry.hours;

      return acc;
    },
    { workdaysHours: 0, public_holidaysHours: 0, totalHours: 0 }
  );
  // Get calendar days for the month
  const calendarDays = calendarModel.getByMonth(month);

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
  return { reported, expected };
}
