import { ContextType } from "../..";
import { projectModel, timeEntryModel } from "../../lib/models";
import type { TimeEntry, Project } from "../../lib/repo";
import type { Context } from "hono";

export type Segment = {
  entry_id?: number;
  project_id: number;
  hours: number;
  comment?: string | null;
};

export type TimeSliderData = {
  sliderTotalHours: number;
  segmentsForSlider: Segment[];
  projects: Array<{
    id: number;
    name: string;
    suppressed?: boolean;
    color?: string;
    isSystem?: boolean;
  }>;
};

export async function getTimeSliderData(
  c: Context<ContextType>,
  currentUser: { id: number; email: string; role: string },
  date: string
): Promise<TimeSliderData> {
  const entries = await timeEntryModel.getByUserIdAndDate(
    c,
    currentUser.id,
    date
  );
  const projects = await projectModel.getByUserId(c, currentUser.id);
  const totalHours = await timeEntryModel.getTotalHoursByUserAndDate(
    c,
    currentUser.id,
    date
  );
  const sliderTotalHours = totalHours;

  const segmentsForSlider = entries.map((entry: TimeEntry) => ({
    entry_id: entry.id,
    project_id: entry.project_id,
    hours: entry.hours,
    comment: entry.comment || null,
  }));

  return {
    sliderTotalHours,
    segmentsForSlider,
    projects: projects.map((p: Project & { suppressed: number }) => ({
      id: p.id,
      name: p.name,
      suppressed: p.suppressed === 1,
      color: p.color,
      isSystem: p.isSystem === 1,
    })),
  };
}
