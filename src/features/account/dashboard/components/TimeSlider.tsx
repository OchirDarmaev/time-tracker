import { tsBuildUrl } from "../../../../shared/utils/paths";
import { accountDashboardContract } from "../contract";
import { DailyStatus } from "./daily_status";
import { DayType } from "./monthly-calendar";

export interface Segment {
  entry_id?: number;
  project_id: number;
  hours: number;
  comment?: string | null;
}

export interface Project {
  id: number;
  name: string;
  suppressed?: boolean;
  color?: string;
  isSystem?: boolean;
}

export interface TimeSliderProps {
  reportedHours: number;
  dayType: DayType | undefined;
  segments: Segment[];
  projects: Project[];
  date: string;
  hxTarget?: string;
}

function getProjectColor(project: Project): { bg: string; solid: string } {
  if (project.color) {
    const hex = project.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const darkerR = Math.max(0, Math.floor(r * 0.85));
    const darkerG = Math.max(0, Math.floor(g * 0.85));
    const darkerB = Math.max(0, Math.floor(b * 0.85));
    const darkerHex =
      "#" +
      [darkerR, darkerG, darkerB]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("");
    return {
      bg: `linear-gradient(135deg, ${project.color} 0%, ${darkerHex} 100%)`,
      solid: project.color,
    };
  }
  return {
    bg: "linear-gradient(135deg, var(--project-default) 0%, var(--project-default-dark) 100%)",
    solid: "var(--project-default)",
  };
}

export function TimeSlider(props: TimeSliderProps): JSX.Element {
  const { reportedHours, dayType, segments, projects, date, hxTarget } = props;

  // Sort projects: regular projects first, then system projects
  const sortedProjects = [...projects].sort((a, b) => {
    const aIsSystem = a.isSystem || false;
    const bIsSystem = b.isSystem || false;
    if (aIsSystem !== bIsSystem) {
      return aIsSystem ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  // Render segments as visual bars
  let currentPosition = 0;
  const segmentElements: JSX.Element[] = [];

  segments.forEach((segment) => {
    const segmentHours = segment.hours || 0;
    const segmentWidth = reportedHours > 0 ? (segmentHours / reportedHours) * 100 : 0;
    const leftPercent = reportedHours > 0 ? (currentPosition / reportedHours) * 100 : 0;

    const project = projects.find((p) => p.id === segment.project_id);
    const color = project
      ? getProjectColor(project)
      : {
          bg: "linear-gradient(135deg, var(--project-default) 0%, var(--project-default-dark) 100%)",
          solid: "var(--project-default)",
        };

    segmentElements.push(
      <div
        class="absolute top-0 h-full rounded flex items-center justify-center overflow-hidden"
        style={`left: ${leftPercent}%; width: ${segmentWidth}%; background: ${color.bg};`}
      >
        <div class="text-center pointer-events-none">
          <div class="text-xs font-bold text-white drop-shadow-md" style="letter-spacing: -0.01em;">
            {project ? project.name : "Unknown"}
          </div>
          <div
            class="text-[10px] font-semibold text-white/95 drop-shadow-md mt-0.5"
            safe
            style="letter-spacing: -0.01em;"
          >
            {`${segmentHours.toFixed(1)}h`}
          </div>
        </div>
      </div>
    );

    currentPosition += segmentHours;
  });

  return (
    <div
      class="rounded p-6 my-4 w-full max-w-full box-border border"
      style="background-color: var(--bg-elevated); border-color: var(--border-subtle);"
    >
      <div class="mb-6 pb-4" style="border-bottom: 1px solid var(--border-subtle);">
        <div class="mb-3">
          <span
            class="text-xs font-semibold tracking-wide uppercase block"
            style="color: var(--text-tertiary); letter-spacing: 0.05em;"
          >
            Projects
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          {sortedProjects.map((project) => {
            const isUsed = segments.some((s) => s.project_id === project.id);
            const color = getProjectColor(project);
            const isActive = isUsed;
            const isDisabled = project.suppressed || false;

            if (isDisabled) {
              return (
                <div
                  class="px-3 py-1.5 text-xs font-medium rounded border cursor-not-allowed opacity-40"
                  style={`border-color: ${color.solid}; color: ${color.solid}; background-color: var(--bg-tertiary);`}
                  safe
                >
                  {project.name}
                </div>
              );
            }

            if (isActive) {
              return (
                <form
                  hx-delete={tsBuildUrl(accountDashboardContract.deleteDashboardSegment, {
                    params: {
                      entryId: segments.find((s) => s.project_id === project.id)!.entry_id!,
                    },
                  })}
                  hx-target={hxTarget}
                  hx-swap="outerHTML"
                  hx-trigger="submit"
                  hx-scroll="false"
                  class="inline-block"
                >
                  <input type="hidden" name="date" value={date} />
                  <input type="hidden" name="project_id" value={String(project.id)} />
                  <input type="hidden" name="comment" value="" />
                  <button
                    type="submit"
                    class="px-3 py-1.5 text-xs font-semibold rounded border"
                    style={`border-color: ${color.solid}; color: ${color.solid}; background-color: ${color.solid}15;`}
                    safe
                  >
                    {project.name}
                  </button>
                </form>
              );
            }
            return (
              <form
                hx-post={tsBuildUrl(accountDashboardContract.addDashboardSegment, {})}
                hx-target={hxTarget}
                hx-swap="outerHTML transition:true"
                hx-trigger="submit"
                hx-scroll="false"
                class="inline-block"
              >
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="project_id" value={String(project.id)} />
                <input type="hidden" name="hours" value={String(0)} />
                <button
                  type="submit"
                  class="px-3 py-1.5 text-xs font-medium rounded border"
                  style={`border-color: ${color.solid}; color: ${color.solid}; background-color: var(--bg-elevated);`}
                  safe
                >
                  {project.name}
                </button>
              </form>
            );
          })}
        </div>
      </div>

      <DailyStatus dayType={dayType} reportedHours={reportedHours} />

      <div class="relative my-6">
        <div
          class="relative h-20 rounded overflow-visible min-h-[80px] border"
          style="background-color: var(--bg-tertiary); border-color: var(--border-subtle);"
        >
          {segments.length === 0 ? (
            <div
              class="flex items-center justify-center h-full w-full text-sm font-medium"
              style="color: var(--text-tertiary); letter-spacing: -0.01em;"
            >
              Click a project chip to add a time segment
            </div>
          ) : (
            segmentElements
          )}
        </div>
        <div
          class="flex justify-between mt-2 text-xs font-medium"
          style="color: var(--text-tertiary); letter-spacing: -0.01em;"
        >
          <span>0h</span>
          <span>{reportedHours}h</span>
        </div>
      </div>

      <div class="mt-6 pt-4" style="border-top: 1px solid var(--border-subtle);">
        {segments.length === 0
          ? ""
          : segments.map((segment, _index) => {
              const project = projects.find((p) => p.id === segment.project_id);
              const color = project
                ? getProjectColor(project)
                : {
                    bg: "linear-gradient(135deg, var(--project-default) 0%, var(--project-default-dark) 100%)",
                    solid: "var(--project-default)",
                  };
              const hours = segment.hours;

              return (
                <div
                  class="flex justify-between items-start p-4 rounded mb-3 border"
                  style="background-color: var(--bg-tertiary); border-color: var(--border-subtle);"
                >
                  <div class="flex items-start gap-4 flex-1">
                    <div
                      class="w-5 h-5 rounded mt-0.5"
                      style={`background: ${color.solid};`}
                    ></div>
                    <div class="flex-1">
                      <div
                        class="text-sm font-semibold mb-2"
                        style="color: var(--text-primary); letter-spacing: -0.01em;"
                      >
                        {project ? project.name : "Unknown"}
                      </div>
                      <form
                        hx-patch={tsBuildUrl(accountDashboardContract.updateDashboardSegment, {
                          params: { entryId: segment.entry_id! },
                        })}
                        hx-target={hxTarget}
                        hx-swap="outerHTML"
                        hx-trigger="change delay:500ms"
                        hx-scroll="false"
                        class="mt-1"
                      >
                        <textarea
                          name="comment"
                          rows="3"
                          placeholder="Add comment..."
                          class="text-sm font-normal leading-relaxed bg-transparent border outline-none w-full px-3 py-2 rounded"
                          style="color: var(--text-primary); resize: none; border-color: var(--border-subtle);"
                          safe
                        >
                          {segment.comment || ""}
                        </textarea>
                      </form>
                    </div>
                    <form
                      hx-patch={tsBuildUrl(accountDashboardContract.updateDashboardSegment, {
                        params: { entryId: segment.entry_id! },
                      })}
                      hx-target={hxTarget}
                      hx-swap="outerHTML"
                      hx-trigger="change"
                      hx-scroll="false"
                      class="flex items-center gap-1.5"
                    >
                      <input
                        type="number"
                        name="hours"
                        value={hours.toFixed(1)}
                        min="0"
                        step="0.5"
                        class="text-xl font-bold bg-transparent border outline-none w-24 text-right px-2 py-1 rounded [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:block [&::-webkit-outer-spin-button]:block"
                        style="color: var(--text-primary); border-color: var(--border-subtle);"
                      />
                      <span
                        class="text-sm font-semibold"
                        style="color: var(--text-secondary); letter-spacing: -0.01em;"
                      >
                        h
                      </span>
                    </form>
                  </div>
                  <form
                    hx-delete={tsBuildUrl(accountDashboardContract.deleteDashboardSegment, {
                      params: { entryId: segment.entry_id! },
                    })}
                    hx-target={hxTarget}
                    hx-swap="outerHTML"
                    hx-trigger="submit"
                    hx-scroll="false"
                    class="ml-4"
                  >
                    <button
                      type="submit"
                      class="text-xs font-medium px-3 py-1.5 rounded"
                      style="color: var(--error);"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
      </div>
    </div>
  );
}
