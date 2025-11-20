import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { parseDate, getAllDaysInMonth, formatDate } from "@/shared/utils/date_utils.js";
import { userModel } from "@/shared/models/user.js";
import { timeEntryModel } from "@/shared/models/time_entry.js";
import { projectModel } from "@/shared/models/project.js";
import { calendarModel } from "@/shared/models/calendar.js";
import { reportsContract } from "../contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

const REQUIRED_DAILY_HOURS = 8;

export function ReportView(month: string, _authReq: AuthContext): JSX.Element {
  const baseDate = parseDate(month + "-01");
  const year = baseDate.getFullYear();
  const monthNum = baseDate.getMonth() + 1;

  // Get all users
  const users = userModel.getAll().filter((u) => u.active);

  // Get all days in the month
  const days = getAllDaysInMonth(month + "-01");

  // Get all time entries for the month
  const startDate = `${year}-${String(monthNum).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthNum, 0).getDate();
  const endDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const timeEntries = timeEntryModel.getAll(startDate, endDate);

  // Get all projects to map project IDs to project info
  const allProjects = projectModel.getAll(true);
  const projectMap = new Map(allProjects.map((p) => [p.id, p]));

  // Get calendar days for day type info
  const calendarDays = calendarModel.getByDateRange(startDate, endDate);
  const dayTypeMap = new Map(calendarDays.map((d) => [d.date, d.day_type]));

  // Build a map of user_id -> date -> entries
  const userDateEntries = new Map<number, Map<string, typeof timeEntries>>();
  users.forEach((user) => {
    userDateEntries.set(user.id, new Map());
  });

  timeEntries.forEach((entry) => {
    const userEntries = userDateEntries.get(entry.user_id);
    if (userEntries) {
      if (!userEntries.has(entry.date)) {
        userEntries.set(entry.date, []);
      }
      userEntries.get(entry.date)!.push(entry);
    }
  });

  // Helper function to get cell content for a user and date
  function getCellContent(userId: number, date: string): string {
    const entries = userDateEntries.get(userId)?.get(date) || [];
    if (entries.length === 0) {
      return "";
    }

    // Separate system and regular projects
    const systemProjects: string[] = [];
    let hasRegularWork = false;
    let hasVacation = false;

    entries.forEach((entry) => {
      const project = projectMap.get(entry.project_id);
      if (project?.isSystem) {
        // Combine paid and unpaid vacation into just "Vacation"
        if (project.name === "Paid Vacation" || project.name === "Unpaid Vacation") {
          hasVacation = true;
        } else {
          systemProjects.push(project.name);
        }
      } else {
        hasRegularWork = true;
      }
    });

    const parts: string[] = [];
    if (hasVacation) {
      parts.push("v");
    }
    if (systemProjects.length > 0) {
      // Replace "Holiday" with "h"
      const processedProjects = systemProjects.map((p) => (p === "Holiday" ? "h" : p));
      parts.push(...processedProjects);
    }
    if (hasRegularWork) {
      parts.push("w");
    }

    return parts.join(", ");
  }

  // Helper function to get total hours for a user on a date
  function getTotalHours(userId: number, date: string): number {
    const entries = userDateEntries.get(userId)?.get(date) || [];
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  }

  // Helper function to check if day is unreported
  function isUnreported(userId: number, date: string, dayType: string | undefined): boolean {
    const totalHours = getTotalHours(userId, date);
    const today = formatDate(new Date());
    const isRequiredDay = dayType === "workday" || dayType === "public_holiday";
    const isPastDate = date <= today;
    return isRequiredDay && isPastDate && totalHours < REQUIRED_DAILY_HOURS;
  }

  // Helper function to count expected holiday days in the month
  function getExpectedHolidayDays(): number {
    return days.filter((day) => {
      const dayType = dayTypeMap.get(day.date);
      return dayType === "public_holiday";
    }).length;
  }

  // Helper function to count how many days user reported Holiday project (on any day)
  function getUserReportedHolidayDays(userId: number): number {
    let count = 0;
    days.forEach((day) => {
      const entries = userDateEntries.get(userId)?.get(day.date) || [];
      const hasHolidayProject = entries.some((entry) => {
        const project = projectMap.get(entry.project_id);
        return project?.name === "Holiday";
      });
      if (hasHolidayProject) {
        count++;
      }
    });
    return count;
  }

  // Helper function to check if user has wrong holiday day count
  function hasWrongHolidayCount(userId: number): boolean {
    const expectedDays = getExpectedHolidayDays();
    const reportedDays = getUserReportedHolidayDays(userId);
    // Show warning if expected days > 0 and reported days doesn't match expected
    return expectedDays > 0 && reportedDays !== expectedDays;
  }

  // Helper function to get cell style based on content
  function getCellStyle(content: string): string {
    if (!content) {
      return "";
    }
    if (content.includes("v")) {
      return "background-color: rgba(245, 158, 11, 0.15); color: var(--warning);";
    }
    if (content.includes("h")) {
      return "background-color: rgba(239, 68, 68, 0.15); color: var(--error);";
    }
    if (content.includes("w")) {
      return "background-color: rgba(59, 130, 246, 0.15); color: var(--info);";
    }
    return "";
  }

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

  // Calculate previous and next month
  const prevMonth = new Date(year, monthNum - 2, 1);
  const nextMonth = new Date(year, monthNum, 1);
  const prevMonthStr = formatDate(prevMonth).substring(0, 7);
  const nextMonthStr = formatDate(nextMonth).substring(0, 7);
  const monthName = monthNames[monthNum - 1];

  return (
    <div id="reports-content" class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
          Time Tracking Report
        </h1>
      </div>
      <div class="flex justify-center items-center gap-4">
        <button
          type="button"
          class="px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none"
          style="color: var(--text-secondary); background-color: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow-sm); letter-spacing: -0.01em;"
          onmouseover="this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-tertiary)'; this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-1px)';"
          onmouseout="this.style.color='var(--text-secondary)'; this.style.backgroundColor='var(--bg-elevated)'; this.style.boxShadow='var(--shadow-sm)'; this.style.transform='translateY(0)';"
          hx-get={tsBuildUrl(reportsContract.view, {
            headers: {},
            query: { month: prevMonthStr },
          })}
          hx-target="#reports-content"
          hx-swap="outerHTML transition:true"
        >
          &lt;
        </button>
        <p
          class="text-sm font-medium"
          style="color: var(--text-primary); min-width: 120px; text-align: center;"
          safe
        >
          {monthName} {year}
        </p>
        <button
          type="button"
          class="px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none"
          style="color: var(--text-secondary); background-color: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow-sm); letter-spacing: -0.01em;"
          onmouseover="this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-tertiary)'; this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-1px)';"
          onmouseout="this.style.color='var(--text-secondary)'; this.style.backgroundColor='var(--bg-elevated)'; this.style.boxShadow='var(--shadow-sm)'; this.style.transform='translateY(0)';"
          hx-get={tsBuildUrl(reportsContract.view, {
            headers: {},
            query: { month: nextMonthStr },
          })}
          hx-target="#reports-content"
          hx-swap="outerHTML transition:true"
        >
          &gt;
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse" style="border: 1px solid var(--border);">
          <thead>
            <tr style="background-color: var(--bg-tertiary);">
              <th
                class="px-2 py-1.5 text-left font-semibold sticky left-0 z-10"
                style="border: 1px solid var(--border); background-color: var(--bg-tertiary); min-width: 140px; box-shadow: 2px 0 2px -2px rgba(0,0,0,0.1); font-size: 13px;"
              >
                User
              </th>
              {days.map((day) => {
                const dayType = dayTypeMap.get(day.date);
                const isWeekend = day.isWeekend;
                let headerStyle = "";
                if (dayType === "public_holiday") {
                  headerStyle = "background-color: rgba(239, 68, 68, 0.2); color: var(--error);";
                } else if (dayType === "weekend" || isWeekend) {
                  headerStyle =
                    "background-color: var(--bg-secondary); color: var(--text-tertiary);";
                } else if (dayType === "workday") {
                  headerStyle = "background-color: rgba(59, 130, 246, 0.1); color: var(--info);";
                } else {
                  // Default for undefined day types
                  headerStyle = "background-color: var(--bg-tertiary);";
                }
                return (
                  <th
                    class="px-0 py-1 text-center font-semibold"
                    style={`border: 1px solid var(--border); ${headerStyle} min-width: 28px; max-width: 28px; font-size: 12px;`}
                    title={day.date}
                  >
                    <div class="font-semibold" safe>
                      {day.dayNumber}
                    </div>
                    <div class="font-normal opacity-70" style="font-size: 10px;" safe>
                      {day.dayName.substring(0, 1).toLowerCase()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const wrongHolidayCount = hasWrongHolidayCount(user.id);
              const expectedDays = getExpectedHolidayDays();
              const reportedDays = getUserReportedHolidayDays(user.id);

              return (
                <tr style="background-color: var(--bg-primary);">
                  <td
                    class="px-2 py-1.5 font-medium sticky left-0 z-10"
                    style="border: 1px solid var(--border); background-color: var(--bg-primary); box-shadow: 2px 0 2px -2px rgba(0,0,0,0.1); white-space: nowrap; font-size: 13px;"
                  >
                    <div class="flex items-center gap-1.5">
                      <span safe>{user.email}</span>
                      {wrongHolidayCount && (
                        <span
                          class="px-1 py-0.5 rounded"
                          style="background-color: rgba(239, 68, 68, 0.15); color: var(--error); font-size: 11px;"
                          title={`Holiday days mismatch: Expected ${expectedDays} days, reported ${reportedDays} days`}
                        >
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  {days.map((day) => {
                    const content = getCellContent(user.id, day.date);
                    const dayType = dayTypeMap.get(day.date);
                    const totalHours = getTotalHours(user.id, day.date);
                    const cellStyle = getCellStyle(content);
                    const unreported = isUnreported(user.id, day.date, dayType);

                    let displayContent = content;
                    if (unreported && !content) {
                      displayContent = "-";
                    }

                    let title = `${user.email} - ${day.date}: ${content || "No entries"}`;
                    if (unreported) {
                      title += ` (Missing ${(REQUIRED_DAILY_HOURS - totalHours).toFixed(1)} hours)`;
                    }

                    return (
                      <td
                        class="px-0 py-1 text-center"
                        style={`border: 1px solid var(--border); ${cellStyle} font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`}
                        title={title}
                      >
                        <span safe>{displayContent}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        class="p-3 rounded-lg mt-4 w-1/3"
        style=" background-color: var(--bg-elevated); border: 1px solid var(--border);"
      >
        <div class="text-sm font-semibold mb-2 " style="color: var(--text-primary);">
          Legend
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs" style="color: var(--text-secondary);">
          <div class="flex items-center gap-2">
            <span
              class="px-1.5 py-0.5 rounded"
              style="background-color: rgba(59, 130, 246, 0.15); color: var(--info); font-weight: 600;"
            >
              w
            </span>
            <span>Work</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="px-1.5 py-0.5 rounded"
              style="background-color: rgba(245, 158, 11, 0.15); color: var(--warning); font-weight: 600;"
            >
              v
            </span>
            <span>Vacation</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="px-1.5 py-0.5 rounded"
              style="background-color: rgba(239, 68, 68, 0.15); color: var(--error); font-weight: 600;"
            >
              h
            </span>
            <span>Holiday</span>
          </div>
          <div class="flex items-center gap-2">
            <span>-</span>
            <span>Not reported (required day)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-base">⚠️</span>
            <span>Holiday days count mismatch (on user name)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
