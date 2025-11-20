import { Project } from "@/shared/models/project.js";
import { TimeEntry } from "@/shared/models/time_entry.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

export function renderEntriesTable(entries: TimeEntry[], projects: Project[]): JSX.Element {
  if (entries.length === 0) {
    return (
      <div class="text-center py-12">
        <p class="text-sm" style="color: var(--text-secondary);">
          No entries for this date.
        </p>
      </div>
    );
  }

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  // Extract tags from comments (words starting with #)
  const extractTags = (comment: string | null): string[] => {
    if (!comment) return [];
    const matches = comment.match(/#\w+/g);
    return matches || [];
  };

  return (
    <table
      class="w-full border-separate border-spacing-0 rounded-lg overflow-hidden shadow-sm"
      style="background-color: var(--bg-secondary);"
    >
      <thead style="background-color: var(--bg-tertiary);">
        <tr>
          <th
            class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
            style="color: var(--text-secondary); border-bottom: 1px solid var(--border);"
          >
            Project
          </th>
          <th
            class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
            style="color: var(--text-secondary); border-bottom: 1px solid var(--border);"
          >
            Hours
          </th>
          <th
            class="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
            style="color: var(--text-secondary); border-bottom: 1px solid var(--border);"
          >
            Comment
          </th>
          <th
            class="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide"
            style="color: var(--text-secondary); border-bottom: 1px solid var(--border);"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const tags = extractTags(entry.comment);
          const commentWithoutTags = entry.comment ? entry.comment.replace(/#\w+/g, "").trim() : "";
          return (
            <tr id={`entry-${entry.id}`} style="border-color: var(--border);">
              <td class="px-5 py-4 font-medium text-sm" style="color: var(--text-primary);">
                <span safe>{projectMap.get(entry.project_id) || "Unknown"}</span>
              </td>
              <td class="px-5 py-4 font-semibold text-sm" style="color: var(--accent);">
                <span safe>{entry.hours.toFixed(1)}h</span>
              </td>
              <td class="px-5 py-4 text-sm">
                {commentWithoutTags ? (
                  <span style="color: var(--text-primary);" safe>
                    {commentWithoutTags}
                  </span>
                ) : (
                  ""
                )}
                {tags.length > 0
                  ? tags.map((tag) => (
                      <span
                        safe
                        class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium ml-1.5"
                        style="background-color: rgba(107, 117, 216, 0.12); color: var(--accent); border: 1px solid rgba(107, 117, 216, 0.2);"
                      >
                        {tag}
                      </span>
                    ))
                  : ""}
              </td>
              <td class="px-5 py-4 text-right">
                <button
                  hx-delete={tsBuildUrl(accountDashboardContract.deleteDashboardEntry, {
                    params: { entryId: entry.id },
                  })}
                  hx-target="#time-tracking-content"
                  hx-swap="outerHTML transition:true"
                  hx-confirm="Delete this entry?"
                  hx-scroll="false"
                  class="bg-transparent border rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                  style="color: var(--error); border-color: var(--border);"
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
