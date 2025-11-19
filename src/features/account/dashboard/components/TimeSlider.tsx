import { tsBuildUrl } from "../../../../shared/utils/paths";
import { accountDashboardContract } from "../contract";

export interface Segment {
  entry_id?: number;
  project_id: number;
  minutes: number;
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
  totalHours: number;
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
    bg: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    solid: "#14b8a6",
  };
}

function minutesToHours(minutes: number): number {
  return minutes / 60;
}

function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

export function TimeSlider(props: TimeSliderProps): JSX.Element {
  const { totalHours, segments, projects, date, hxTarget } = props;

  const totalMinutes = hoursToMinutes(totalHours);

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
    const segmentMinutes = segment.minutes || 0;
    const segmentWidth = totalMinutes > 0 ? (segmentMinutes / totalMinutes) * 100 : 0;
    const leftPercent = totalMinutes > 0 ? (currentPosition / totalMinutes) * 100 : 0;

    const project = projects.find((p) => p.id === segment.project_id);
    const color = project ? getProjectColor(project) : { bg: "#14b8a6", solid: "#14b8a6" };

    segmentElements.push(
      <div
        class="absolute top-0 h-full rounded-md flex items-center justify-center overflow-hidden"
        style={`left: ${leftPercent}%; width: ${segmentWidth}%; background: ${color.bg};`}
      >
        <div class="text-center pointer-events-none">
          <div class="text-xs font-semibold text-white drop-shadow-sm">
            {project ? project.name : "Unknown"}
          </div>
          <div class="text-[10px] text-white/90 drop-shadow-sm" safe>
            {`${minutesToHours(segmentMinutes).toFixed(1)}h`}
          </div>
        </div>
      </div>
    );

    currentPosition += segmentMinutes;
  });

  return (
    <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 shadow-sm my-4 w-full max-w-full box-border">
      <div class="mb-4 pb-3 border-b border-gray-300 dark:border-gray-700">
        <div class="mb-2">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wide block">
            Projects
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          {sortedProjects.map((project) => {
            const isUsed = segments.some((s) => s.project_id === project.id);
            const color = getProjectColor(project);
            const isActive = isUsed;
            const isDisabled = project.suppressed || false;

            if (isDisabled) {
              return (
                <div
                  class="px-2 py-1 text-xs font-medium rounded-md border cursor-not-allowed opacity-40"
                  style={`border-color: ${color.solid}; color: ${color.solid};`}
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
                  hx-swap="outerHTML transition:true"
                  hx-trigger="submit"
                  hx-scroll="false"
                  class="inline-block drop-shadow-lg drop-shadow-indigo-500/50"
                >
                  <input type="hidden" name="date" value={date} />
                  <input type="hidden" name="project_id" value={String(project.id)} />
                  {/* <input type="hidden" name="hours" value={minutesToHours(3600).toFixed(1)} /> */}
                  <input type="hidden" name="comment" value="" />
                  <button
                    type="submit"
                    class="px-2 py-1 text-xs font-medium rounded-md border outline-2 "
                    style={`border-color: ${color.solid}; color: ${color.solid};`}
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
                <input type="hidden" name="minutes" value={String(0)} />
                <button
                  type="submit"
                  class="px-2 py-1 text-xs font-medium rounded-md border"
                  style={`border-color: ${color.solid}; color: ${color.solid};`}
                  safe
                >
                  {project.name}
                </button>
              </form>
            );
          })}
        </div>
      </div>

      <div class="flex justify-end items-center mb-3">
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
            <span class="block">Total Hours:</span>
            <div class="text-gray-900 dark:text-gray-100 rounded-md px-2 py-1 text-xs w-[60px] block">
              {totalHours}
            </div>
          </label>
        </div>
      </div>

      <div class="relative my-4">
        <div class="relative h-16 bg-linear-to-r from-gray-200 via-teal-50/5 to-gray-200 dark:from-gray-700 dark:via-teal-900/5 dark:to-gray-700 rounded-md border border-gray-300 dark:border-gray-600 overflow-visible min-h-[64px]">
          {segments.length === 0 ? (
            <div class="flex items-center justify-center h-full w-full text-xs text-gray-500 dark:text-gray-400">
              Click a project chip to add a time segment
            </div>
          ) : (
            segmentElements
          )}
        </div>
        <div class="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span class="font-medium">0h</span>
          <span class="font-medium">{totalHours}h</span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700">
        {segments.length === 0
          ? ""
          : segments.map((segment, _index) => {
              const project = projects.find((p) => p.id === segment.project_id);
              const color = project
                ? getProjectColor(project)
                : { bg: "#14b8a6", solid: "#14b8a6" };
              const hours = minutesToHours(segment.minutes);

              return (
                <div class="flex justify-between items-start p-2 bg-gray-50 dark:bg-gray-900 rounded-md mb-2 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-start gap-3 flex-1">
                    <div class="w-4 h-4 rounded" style={`background: ${color.solid};`}></div>
                    <div class="flex-1">
                      <div class="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {project ? project.name : "Unknown"}
                      </div>
                      <form
                        hx-patch={tsBuildUrl(accountDashboardContract.updateDashboardSegment, {
                          params: { entryId: segment.entry_id! },
                        })}
                        hx-target={hxTarget}
                        hx-swap="outerHTML transition:true"
                        hx-trigger="change delay:500ms"
                        hx-scroll="false"
                        class="mt-1"
                      >
                        <textarea
                          name="comment"
                          rows="5"
                          placeholder="Add comment..."
                          class="text-base text-gray-900 dark:text-gray-100 font-normal leading-relaxed bg-transparent border-none outline-none w-full focus:bg-gray-100 dark:focus:bg-gray-800 px-3 py-2 rounded placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                      hx-swap="outerHTML transition:true"
                      hx-trigger="change from:input[type=number]"
                      hx-scroll="false"
                      class="flex items-center gap-1"
                    >
                      <input
                        type="number"
                        value={hours.toFixed(1)}
                        min="0"
                        step="0.5"
                        class="text-lg font-semibold text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none w-20 text-right focus:bg-gray-100 dark:focus:bg-gray-800 px-1 py-0.5 rounded [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:block [&::-webkit-outer-spin-button]:block"
                        onchange={`this.form.querySelector('input[name=minutes]').value = Math.round(parseFloat(this.value) * 60)`}
                      />
                      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">h</span>
                      <input type="hidden" name="minutes" value={String(segment.minutes)} />
                    </form>
                  </div>
                  <form
                    hx-delete={tsBuildUrl(accountDashboardContract.deleteDashboardSegment, {
                      params: { entryId: segment.entry_id! },
                    })}
                    hx-target={hxTarget}
                    hx-swap="outerHTML transition:true"
                    hx-trigger="submit"
                    hx-scroll="false"
                    class="ml-3"
                  >
                    <button
                      type="submit"
                      class="text-xs text-red-600 dark:text-red-400 hover:underline"
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
