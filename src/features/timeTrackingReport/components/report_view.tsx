import {
  parseDate,
  getAllDaysInMonth,
  formatDate,
  getMonthFromDate,
} from "../../../lib/date_utils";
import { mockDb } from "../../../lib/mock_db";
import { client } from "../../../lib/client";
import DashboardLayout from "../../../lib/layouts/DashboardLayout";

const REQUIRED_DAILY_HOURS = 8;

export async function ReportView({ month }: { month: string }) {
  const baseDate = parseDate(month + "-01");
  const year = baseDate.getFullYear();
  const monthNum = baseDate.getMonth() + 1;

  // Get all users
  const allUsers = await mockDb.findAllUsers();
  const users = allUsers.filter((u) => u.active === 1);

  // Get all days in the month
  const days = getAllDaysInMonth(month + "-01");

  // Get all time entries for the month
  const startDate = `${year}-${String(monthNum).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthNum, 0).getDate();
  const endDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const timeEntries = await mockDb.findTimeEntriesByDateRange(
    startDate,
    endDate
  );

  // Get all projects to map project IDs to project info
  const allProjects = await mockDb.findAllProjects();
  const projectMap = new Map(allProjects.map((p) => [p.id, p]));

  // Get calendar days for day type info
  const calendarDays = await mockDb.findCalendarByDateRange(startDate, endDate);
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
      if (project?.isSystem === 1) {
        // Combine paid and unpaid vacation into just "Vacation"
        if (
          project.name === "Paid Vacation" ||
          project.name === "Unpaid Vacation"
        ) {
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
      const processedProjects = systemProjects.map((p) =>
        p === "Holiday" ? "h" : p
      );
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
  function isUnreported(
    userId: number,
    date: string,
    dayType: string | undefined
  ): boolean {
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
      return "bg-[rgba(245,158,11,0.15)] text-[var(--warning)]";
    }
    if (content.includes("h")) {
      return "bg-[rgba(239,68,68,0.15)] text-[var(--error)]";
    }
    if (content.includes("w")) {
      return "bg-[rgba(59,130,246,0.15)] text-[var(--info)]";
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
  const prevMonthStr = getMonthFromDate(formatDate(prevMonth));
  const nextMonthStr = getMonthFromDate(formatDate(nextMonth));
  const monthName = monthNames[monthNum - 1];
  const reportsPath = client.reports.$url().pathname;
  const prevMonthUrl = client.reports.$url({
    query: { month: prevMonthStr },
  }).pathname;
  const nextMonthUrl = client.reports.$url({
    query: { month: nextMonthStr },
  }).pathname;

  return (
    <DashboardLayout currentPath={reportsPath}>
      <div id="reports-content" class="space-y-6">
        <div>
          <h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">
            Time Tracking Report
          </h1>
        </div>
        <div class="flex items-center justify-center gap-4">
          <a
            href={prevMonthUrl}
            class="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 tracking-[-0.01em] text-[var(--text-secondary)] no-underline shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)] focus:outline-none"
          >
            &lt;
          </a>
          <p class="min-w-[120px] text-center text-sm font-medium text-[var(--text-primary)]">
            <span safe>{`${monthName} ${year}`}</span>
          </p>
          <a
            href={nextMonthUrl}
            class="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 tracking-[-0.01em] text-[var(--text-secondary)] no-underline shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)] focus:outline-none"
          >
            &gt;
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-[var(--border)]">
            <thead>
              <tr class="bg-[var(--bg-tertiary)]">
                <th class="sticky left-0 z-10 min-w-[140px] border border-[var(--border)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-left text-[13px] font-semibold shadow-[2px_0_2px_-2px_rgba(0,0,0,0.1)]">
                  User
                </th>
                {days.map((day) => {
                  const dayType = dayTypeMap.get(day.date);
                  const isWeekend = day.isWeekend;
                  let headerStyle = "bg-[var(--bg-tertiary)]";
                  if (dayType === "public_holiday") {
                    headerStyle =
                      "bg-[rgba(239,68,68,0.2)] text-[var(--error)]";
                  } else if (dayType === "weekend" || isWeekend) {
                    headerStyle =
                      "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]";
                  } else if (dayType === "workday") {
                    headerStyle =
                      "bg-[rgba(59,130,246,0.1)] text-[var(--info)]";
                  } else {
                    // Default for undefined day types
                    headerStyle = "bg-[var(--bg-tertiary)]";
                  }
                  return (
                    <th
                      class={`border border-[var(--border)] px-0 py-1 text-center text-[12px] font-semibold ${headerStyle} max-w-[28px] min-w-[28px]`}
                      title={day.date}
                    >
                      <div class="font-semibold">{day.dayNumber}</div>
                      <div class="text-[10px] font-normal opacity-70" safe>
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
                  <tr class="bg-[var(--bg-primary)]">
                    <td class="sticky left-0 z-10 border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1.5 text-[13px] font-medium whitespace-nowrap shadow-[2px_0_2px_-2px_rgba(0,0,0,0.1)]">
                      <div class="flex items-center gap-1.5">
                        <span safe>{user.email}</span>
                        {wrongHolidayCount && (
                          <span
                            class="rounded bg-[rgba(239,68,68,0.15)] px-1 py-0.5 text-[11px] text-[var(--error)]"
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
                      const unreported = isUnreported(
                        user.id,
                        day.date,
                        dayType
                      );

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
                          class={`overflow-hidden border border-[var(--border)] px-0 py-1 text-center text-[12px] text-ellipsis whitespace-nowrap ${cellStyle}`}
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

        <div class="mt-4 w-1/3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div class="mb-2 text-sm font-semibold text-[var(--text-primary)]">
            Legend
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
            <div class="flex items-center gap-2">
              <span class="rounded bg-[rgba(59,130,246,0.15)] px-1.5 py-0.5 font-semibold text-[var(--info)]">
                w
              </span>
              <span>Work</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded bg-[rgba(245,158,11,0.15)] px-1.5 py-0.5 font-semibold text-[var(--warning)]">
                v
              </span>
              <span>Vacation</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded bg-[rgba(239,68,68,0.15)] px-1.5 py-0.5 font-semibold text-[var(--error)]">
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
    </DashboardLayout>
  );
}
