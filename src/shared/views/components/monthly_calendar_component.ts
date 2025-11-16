import { html } from "../../utils/html";
import { getAllDaysInMonth, formatDate } from "../../utils/date_utils";

export interface Project {
  id: number;
  name: string;
}

export interface DayProjectBreakdown {
  project_id: number;
  minutes: number;
}

export interface MonthlyCalendarProps {
  selectedDate: string;
  hxGet: string;
  hxTarget: string;
  dayHoursMap: Record<string, number>; // date -> hours
  dayProjectBreakdown: Record<string, DayProjectBreakdown[]>; // date -> project breakdown
  projects: Project[]; // list of projects for color mapping
}

// Project colors matching the time slider
const PROJECT_COLORS = [
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // green
  "#6366f1", // indigo
];

function getProjectColor(projectId: number, projects: Project[]): string {
  const index = projects.findIndex((p) => p.id === projectId);
  return PROJECT_COLORS[index >= 0 ? index % PROJECT_COLORS.length : 0];
}

function renderCircleDiagram(
  breakdown: DayProjectBreakdown[],
  projects: Project[],
  totalHours: number,
  size: number = 48
): string {
  if (!breakdown || breakdown.length === 0) {
    return "";
  }

  const totalMinutes = breakdown.reduce((sum, item) => sum + item.minutes, 0);
  if (totalMinutes === 0) {
    return "";
  }

  const requiredHours = 8;
  // Calculate how much of the 8-hour goal is completed (cap at 100%)
  const completionRatio = Math.min(totalHours / requiredHours, 1);
  // Total angle to fill based on 8-hour goal
  const totalFillAngle = completionRatio * 2 * Math.PI;

  const center = size / 2;
  const outerRadius = size / 2 - 2;
  const innerRadius = size / 2 - 6; // Ring thickness of 4
  let currentAngle = -Math.PI / 2; // Start at top

  const paths: string[] = [];

  // Small reduction per segment to create gaps (in radians)
  const segmentReduction = 0.12; // ~1.7 degrees per segment

  breakdown.forEach((item) => {
    // Calculate this project's proportion of total logged time
    const projectPercentage = item.minutes / totalMinutes;
    // This project's angle within the filled portion
    const angle = projectPercentage * totalFillAngle - segmentReduction;
    const endAngle = currentAngle + angle;

    // Calculate outer arc points
    const x1Outer = center + outerRadius * Math.cos(currentAngle);
    const y1Outer = center + outerRadius * Math.sin(currentAngle);
    const x2Outer = center + outerRadius * Math.cos(endAngle);
    const y2Outer = center + outerRadius * Math.sin(endAngle);

    // Calculate inner arc points
    const x1Inner = center + innerRadius * Math.cos(currentAngle);
    const y1Inner = center + innerRadius * Math.sin(currentAngle);
    const x2Inner = center + innerRadius * Math.cos(endAngle);
    const y2Inner = center + innerRadius * Math.sin(endAngle);

    const color = getProjectColor(item.project_id, projects);

    // Skip if angle is too small to render
    if (angle >= 0.01) {
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      // Create ring segment path: outer arc -> line to inner end -> inner arc back -> close
      const pathData = `M ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z`;
      paths.push(`<path d="${pathData}" fill="${color}" stroke="none" />`);
    }

    // Move to end of segment (gap is created by the reduction in angle)
    currentAngle = endAngle + segmentReduction;
  });

  return html`
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 ${size} ${size}"
      class="absolute inset-0 m-auto pointer-events-none"
      style="z-index: 0;"
    >
      ${paths.join("")}
    </svg>
  `;
}

export function renderMonthlyCalendar(props: MonthlyCalendarProps): string {
  const { selectedDate, hxGet, hxTarget, dayHoursMap, dayProjectBreakdown, projects } = props;
  const days = getAllDaysInMonth(selectedDate);

  const today = formatDate(new Date());
  const baseDate = new Date(selectedDate + "T00:00:00");
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  // Format month name
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
  const monthName = monthNames[month];
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to Monday-based: 0=Sun->6, 1=Mon->0, 2=Tue->1, etc.
  const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Create grid with empty cells for days before month starts
  const gridDays: Array<{
    date: string;
    dayNumber: number;
    dayName: string;
    isWeekend: boolean;
    isEmpty: boolean;
  }> = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < mondayBasedFirstDay; i++) {
    gridDays.push({
      date: "",
      dayNumber: 0,
      dayName: "",
      isWeekend: false,
      isEmpty: true,
    });
  }

  // Add actual days
  days.forEach((day) => {
    gridDays.push({
      ...day,
      isEmpty: false,
    });
  });

  const dayButtons = gridDays.map((day) => {
    if (day.isEmpty) {
      return html`<div class="aspect-square"></div>`;
    }

    const hours = dayHoursMap[day.date] || 0;
    const isSelected = day.date === selectedDate;
    const isToday = day.date === today;
    const hasHours = hours > 0;
    const isOverLimit = hours > 8;

    // Circle diagram showing project proportions (ring around number)
    // Ring fills proportionally to 8-hour goal
    const breakdown = dayProjectBreakdown[day.date] || [];
    const circleDiagram = hasHours ? renderCircleDiagram(breakdown, projects, hours, 48) : "";

    // Small orange circle indicator when hours exceed 8
    const overLimitIndicator = isOverLimit
      ? html`<span
          class="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 z-20"
          title="Over 8 hours"
        ></span>`
      : "";

    // Background for selected state only
    const bgClass = isSelected
      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
      : isToday
        ? "bg-gray-100 dark:bg-gray-800"
        : "";

    // Text color
    const textClass = isSelected
      ? ""
      : day.isWeekend
        ? "text-gray-400 dark:text-gray-600"
        : "text-gray-700 dark:text-gray-300";

    return html`
      <button
        type="button"
        class="relative flex items-center justify-center aspect-square rounded-lg ${bgClass} ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
        ${hxGet ? `hx-get="${hxGet}?date=${day.date}"` : ""}
        ${hxTarget ? `hx-target="${hxTarget}"` : ""}
        ${hxGet ? `hx-swap="outerHTML transition:true"` : ""}
        hx-trigger="click"
        hx-scroll="false"
        title="${day.date} - ${hours.toFixed(1)}h"
      >
        ${circleDiagram}
        <span class="text-sm font-light relative z-10">${day.dayNumber}</span>
        ${overLimitIndicator}
      </button>
    `;
  });

  const weekDayHeaders = ["M", "T", "W", "T", "F", "S", "S"];

  return html`
    <div class="mb-6">
      <h3 class="text-lg font-light mb-4 text-gray-900 dark:text-gray-100 tracking-wide">
        ${monthName} ${year}
      </h3>
      <div class="grid grid-cols-7 gap-2">
        ${weekDayHeaders
          .map(
            (day) => html`
              <div class="text-center text-xs font-light text-gray-500 dark:text-gray-500 pb-2">
                ${day}
              </div>
            `
          )
          .join("")}
        ${dayButtons.join("")}
      </div>
    </div>
  `;
}
