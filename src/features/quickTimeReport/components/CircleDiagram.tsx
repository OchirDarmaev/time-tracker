import { JSX } from "hono/jsx";
import {
  DayProjectBreakdown,
  Project,
  REQUIRED_DAILY_HOURS,
  getProjectColor,
} from "./monthly_calendar";

export type CircleDiagramProps = {
  breakdown: DayProjectBreakdown[];
  projects: Project[];
  totalHours: number;
  size: number;
};

export default function CircleDiagram({
  breakdown,
  projects,
  totalHours,
  size = 48,
}: CircleDiagramProps) {
  if (!breakdown || breakdown.length === 0) {
    return null;
  }

  const totalBreakdownHours = breakdown.reduce(
    (sum, item) => sum + item.hours,
    0
  );
  if (totalBreakdownHours === 0) {
    return null;
  }

  const completionRatio = Math.min(totalHours / REQUIRED_DAILY_HOURS, 1);
  const totalFillAngle = completionRatio * 2 * Math.PI;

  const center = size / 2;
  const outerRadius = size / 2 - 2;
  const innerRadius = size / 2 - 6;
  let currentAngle = -Math.PI / 2;

  const paths: JSX.HTMLAttributes[] = [];
  const segmentReduction = 0.12;

  breakdown.forEach((item) => {
    const projectPercentage = item.hours / totalBreakdownHours;
    const angle = projectPercentage * totalFillAngle - segmentReduction;
    const endAngle = currentAngle + angle;

    const x1Outer = center + outerRadius * Math.cos(currentAngle);
    const y1Outer = center + outerRadius * Math.sin(currentAngle);
    const x2Outer = center + outerRadius * Math.cos(endAngle);
    const y2Outer = center + outerRadius * Math.sin(endAngle);

    const x1Inner = center + innerRadius * Math.cos(currentAngle);
    const y1Inner = center + innerRadius * Math.sin(currentAngle);
    const x2Inner = center + innerRadius * Math.cos(endAngle);
    const y2Inner = center + innerRadius * Math.sin(endAngle);

    const color = getProjectColor(item.project_id, projects);

    if (angle >= 0.01) {
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      const pathData = `M ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z`;
      paths.push(<path d={pathData} fill={color} stroke="none" />);
    }

    currentAngle = endAngle + segmentReduction;
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      class="pointer-events-none absolute inset-0 z-0 m-auto h-full w-full"
    >
      {paths}
    </svg>
  );
}
