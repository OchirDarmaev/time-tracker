import type { TimeEntry, Project } from "../../../lib/repo";

export function EntriesTable({
  entries,
  projects,
}: {
  entries: TimeEntry[];
  projects: Project[];
}) {
  if (entries.length === 0) {
    return (
      <div class="py-12 text-center">
        <p class="text-sm text-[var(--text-secondary)]">
          No entries for this date.
        </p>
      </div>
    );
  }

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const extractTags = (comment: string | null): string[] => {
    if (!comment) return [];
    const matches = comment.match(/#\w+/g);
    return matches || [];
  };

  return (
    <table class="w-full border-separate border-spacing-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)] shadow-sm">
      <thead class="bg-[var(--bg-tertiary)]">
        <tr>
          <th class="border-b border-[var(--border)] px-5 py-4 text-left text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Project
          </th>
          <th class="border-b border-[var(--border)] px-5 py-4 text-left text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Hours
          </th>
          <th class="border-b border-[var(--border)] px-5 py-4 text-left text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Comment
          </th>
          <th class="border-b border-[var(--border)] px-5 py-4 text-right text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const tags = extractTags(entry.comment);
          const commentWithoutTags = entry.comment
            ? entry.comment.replace(/#\w+/g, "").trim()
            : "";
          return (
            <tr id={`entry-${entry.id}`} class="border-[var(--border)]">
              <td class="px-5 py-4 text-sm font-medium text-[var(--text-primary)]">
                <span safe>
                  {projectMap.get(entry.project_id) || "Unknown"}
                </span>
              </td>
              <td class="px-5 py-4 text-sm font-semibold text-[var(--accent)]">
                <span safe>{entry.hours.toFixed(1)}h</span>
              </td>
              <td class="px-5 py-4 text-sm">
                {commentWithoutTags ? (
                  <span class="text-[var(--text-primary)]" safe>
                    {commentWithoutTags}
                  </span>
                ) : (
                  ""
                )}
                {tags.length > 0
                  ? tags.map((tag) => (
                      <span
                        safe
                        class="ml-1.5 inline-flex items-center rounded-xl border border-indigo-500/20 bg-indigo-500/12 px-2.5 py-1 text-xs font-medium text-[var(--accent)]"
                      >
                        {tag}
                      </span>
                    ))
                  : ""}
              </td>
              <td class="px-5 py-4 text-right">
                <button
                  hx-delete={`/dashboard/entries/${entry.id}`}
                  hx-target="#time-tracking-content"
                  hx-swap="outerHTML"
                  hx-confirm="Delete this entry?"
                  hx-scroll="false"
                  class="cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--error)]"
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
