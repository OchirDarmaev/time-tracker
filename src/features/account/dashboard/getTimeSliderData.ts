import { Project, projectModel } from "../../../shared/models/project";
import { timeEntryModel } from "../../../shared/models/time_entry";
import { UserRole } from "../../../shared/models/user";
import { Segment } from "./components/TimeSlider";
import { REQUIRED_DAILY_HOURS } from "./router";

export type TimeSliderData = {
  sliderTotalHours: number;
  segmentsForSlider: Segment[];
  projects: Project[];
};
export function getTimeSliderData(
  currentUser: { id: number; email: string; role: UserRole; roles: UserRole[] },
  date: string
): TimeSliderData {
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
  const projects = projectModel.getByUserId(currentUser.id);
  const totalHours = timeEntryModel.getTotalHoursByUserAndDate(currentUser.id, date);
  const sliderTotalHours = Math.max(totalHours, REQUIRED_DAILY_HOURS);

  const segmentsForSlider = entries.map((entry) => ({
    entry_id: entry.id,
    project_id: entry.project_id,
    hours: entry.hours,
    comment: entry.comment || null,
  }));
  return { sliderTotalHours, segmentsForSlider, projects };
}
