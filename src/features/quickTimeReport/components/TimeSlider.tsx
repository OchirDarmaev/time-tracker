import { JSX } from "hono/jsx";
import { DailyStatus } from "./DailyStatus";
import { DayType } from "./MonthlyCalendar";
import { client } from "../../../lib/client";

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

export default function TimeSlider(props: TimeSliderProps) {
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
  const segmentElements: JSX.HTMLAttributes[] = [];

  segments.forEach((segment) => {
    const segmentHours = segment.hours || 0;
    const segmentWidth =
      reportedHours > 0 ? (segmentHours / reportedHours) * 100 : 0;
    const leftPercent =
      reportedHours > 0 ? (currentPosition / reportedHours) * 100 : 0;

    const project = projects.find((p) => p.id === segment.project_id);
    const color = project
      ? getProjectColor(project)
      : {
          bg: "linear-gradient(135deg, var(--project-default) 0%, var(--project-default-dark) 100%)",
          solid: "var(--project-default)",
        };

    segmentElements.push(
      <div
        class="absolute top-0 flex h-full items-center justify-center overflow-hidden rounded"
        style={`left: ${leftPercent}%; width: ${segmentWidth}%; background: ${color.bg};`}
      >
        <div class="pointer-events-none text-center">
          <div class="text-xs font-bold tracking-[-0.01em] text-white drop-shadow-md">
            {project ? project.name : "Unknown"}
          </div>
          <div
            class="mt-0.5 text-[10px] font-semibold tracking-[-0.01em] text-white/95 drop-shadow-md"
            safe
          >
            {`${segmentHours.toFixed(1)}h`}
          </div>
        </div>
      </div>
    );

    currentPosition += segmentHours;
  });

  return (
    <div class="my-4 box-border w-full max-w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
      <div class="mb-6 border-b border-[var(--border-subtle)] pb-4">
        <div class="mb-3">
          <span class="block text-xs font-semibold tracking-[0.05em] tracking-wide text-[var(--text-tertiary)] uppercase">
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
                  class="cursor-not-allowed rounded border bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs font-medium opacity-40"
                  style={`border-color: ${color.solid}; color: ${color.solid};`}
                  safe
                >
                  {project.name}
                </div>
              );
            }

            if (isActive) {
              const entryId = segments.find(
                (s) => s.project_id === project.id
              )!.entry_id!;
              return (
                <form
                  hx-delete={
                    client.partials.quickTimeReport.entries[":entryId"].$url({
                      param: { entryId: entryId.toString() },
                    }).pathname
                  }
                  hx-target={hxTarget}
                  hx-swap="outerHTML"
                  hx-trigger="submit"
                  hx-scroll="false"
                  class="inline-block"
                >
                  <input type="hidden" name="date" value={date} />
                  <input
                    type="hidden"
                    name="project_id"
                    value={String(project.id)}
                  />
                  <input type="hidden" name="comment" value="" />
                  <button
                    type="submit"
                    class="rounded border px-3 py-1.5 text-xs font-semibold"
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
                hx-post={
                  client.partials.quickTimeReport.segments.$url().pathname
                }
                hx-target={hxTarget}
                hx-swap="outerHTML"
                hx-trigger="submit"
                hx-scroll="false"
                class="inline-block"
              >
                <input type="hidden" name="date" value={date} />
                <input
                  type="hidden"
                  name="project_id"
                  value={String(project.id)}
                />
                <input type="hidden" name="hours" value={String(0)} />
                <button
                  type="submit"
                  class="rounded border bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium"
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

      <DailyStatus dayType={dayType} reportedHours={reportedHours} />

      <div class="relative my-6">
        <div class="relative h-20 min-h-[80px] overflow-visible rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
          {segments.length === 0 ? (
            <div class="flex h-full w-full items-center justify-center text-sm font-medium tracking-[-0.01em] text-[var(--text-tertiary)]">
              Click a project chip to add a time segment
            </div>
          ) : (
            segmentElements
          )}
        </div>
        <div class="mt-2 flex justify-between text-xs font-medium tracking-[-0.01em] text-[var(--text-tertiary)]">
          <span>0h</span>
          <span>{reportedHours}h</span>
        </div>
      </div>

      <div class="mt-6 border-t border-[var(--border-subtle)] pt-4">
        {segments.length === 0
          ? ""
          : segments.map((segment) => {
              const project = projects.find((p) => p.id === segment.project_id);
              const color = project
                ? getProjectColor(project)
                : {
                    bg: "linear-gradient(135deg, var(--project-default) 0%, var(--project-default-dark) 100%)",
                    solid: "var(--project-default)",
                  };
              const hours = segment.hours;

              return (
                <div class="mb-3 flex items-start justify-between rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4">
                  <div class="flex flex-1 items-start gap-4">
                    <div
                      class="mt-0.5 h-5 w-5 rounded"
                      style={`background: ${color.solid};`}
                    ></div>
                    <div class="flex-1">
                      <div class="mb-2 text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                        {project ? project.name : "Unknown"}
                      </div>
                      <form
                        hx-patch={client.partials.quickTimeReport.segments[
                          ":entryId"
                        ].$url({
                          param: { entryId: segment.entry_id!.toString() },
                        })}
                        hx-target={hxTarget}
                        hx-swap="outerHTML"
                        hx-trigger="change delay:500ms"
                        hx-scroll="false"
                        class="mt-1"
                      >
                        <textarea
                          name="comment"
                          rows={3}
                          placeholder="Add comment..."
                          class="w-full resize-none rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm leading-relaxed font-normal text-[var(--text-primary)] outline-none"
                          safe
                        >
                          {segment.comment || ""}
                        </textarea>
                      </form>
                    </div>
                    <form
                      hx-patch={client.partials.quickTimeReport.segments[
                        ":entryId"
                      ].$url({
                        param: { entryId: segment.entry_id!.toString() },
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
                        class="w-24 rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-right text-xl font-bold text-[var(--text-primary)] outline-none [&::-webkit-inner-spin-button]:block [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:block [&::-webkit-outer-spin-button]:opacity-100"
                      />
                      <span class="text-sm font-semibold tracking-[-0.01em] text-[var(--text-secondary)]">
                        h
                      </span>
                    </form>
                  </div>
                  <form
                    hx-delete={
                      client.partials.quickTimeReport.segments[":entryId"].$url({
                        param: { entryId: segment.entry_id!.toString() },
                      }).pathname
                    }
                    hx-target={hxTarget}
                    hx-swap="outerHTML"
                    hx-trigger="submit"
                    hx-scroll="false"
                    class="ml-4"
                  >
                    <button
                      type="submit"
                      class="rounded px-3 py-1.5 text-xs font-medium text-[var(--error)]"
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
