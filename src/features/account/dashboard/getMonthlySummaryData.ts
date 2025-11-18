import { calendarModel } from "../../../shared/models/calendar";
import { projectModel } from "../../../shared/models/project";
import { timeEntryModel } from "../../../shared/models/time_entry";
import { UserRole } from "../../../shared/models/user";
import { getMonthFromDate } from "../../../shared/utils/date_utils";
import { HOLIDAY_PROJECT_NAME, REQUIRED_DAILY_HOURS } from "./router";

export type MonthlySummaryData = {
  reported: {
    workdaysMinutes: number;
    public_holidaysMinutes: number;
    totalMinutes: number;
  };
  expected: {
    workdaysMinutes: number;
    public_holidaysMinutes: number;
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
        acc.public_holidaysMinutes += entry.minutes;
      } else {
        acc.workdaysMinutes += entry.minutes;
      }
      acc.totalMinutes += entry.minutes;

      return acc;
    },
    { workdaysMinutes: 0, public_holidaysMinutes: 0, totalMinutes: 0 }
  );
  // Get calendar days for the month
  const calendarDays = calendarModel.getByMonth(month);

  const expected = calendarDays.reduce(
    (acc, day) => {
      if (day.day_type === "workday") {
        acc.workdaysMinutes += REQUIRED_DAILY_HOURS * 60;
      } else if (day.day_type === "public_holiday") {
        acc.public_holidaysMinutes += REQUIRED_DAILY_HOURS * 60;
      }
      return acc;
    },
    {
      workdaysMinutes: 0,
      public_holidaysMinutes: 0,
    }
  );
  return { reported, expected };
}
