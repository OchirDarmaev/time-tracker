import { html } from "@/shared/utils/html.js";
import { Project } from "@/shared/models/project.js";
import { TimeEntry } from "@/shared/models/time_entry.js";
import { minutesToHours } from "@/shared/utils/date_utils.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { tsBuildUrl } from "@/shared/utils/paths.js";

export function renderEntriesTable(entries: TimeEntry[], projects: Project[]): string {
  if (entries.length === 0) {
    return html`
      <div class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400 text-sm">No entries for this date.</p>
      </div>
    `;
  }

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  // Extract tags from comments (words starting with #)
  const extractTags = (comment: string | null): string[] => {
    if (!comment) return [];
    const matches = comment.match(/#\w+/g);
    return matches || [];
  };

  return html`
    <table
      class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
    >
      <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th
            class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Project
          </th>
          <th
            class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Hours
          </th>
          <th
            class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Comment
          </th>
          <th
            class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map((entry) => {
            const tags = extractTags(entry.comment);
            const commentWithoutTags = entry.comment
              ? entry.comment.replace(/#\w+/g, "").trim()
              : "";
            return `
          <tr id="entry-${entry.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700">
            <td class="px-5 py-4 font-medium text-gray-900 dark:text-gray-100 text-sm">${projectMap.get(entry.project_id) || "Unknown"}</td>
            <td class="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">${minutesToHours(entry.minutes).toFixed(1)}h</td>
            <td class="px-5 py-4 text-sm">
              ${commentWithoutTags ? `<span class="text-gray-900 dark:text-gray-100">${commentWithoutTags}</span>` : ""}
              ${tags.length > 0 ? tags.map((tag) => `<span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 ml-1.5">${tag}</span>`).join("") : ""}
            </td>
            <td class="px-5 py-4 text-right">
              <button 
                hx-delete-"${tsBuildUrl(accountDashboardContract.deleteDashboardEntry, { params: { entryId: entry.id } })}
                hx-target="#entries-container"
                hx-swap="innerHTML transition:true"
                hx-confirm="Delete this entry?"
                hx-on::after-request="htmx.trigger('body', 'entries-changed')"
                class="bg-transparent text-red-500 dark:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-400"
              >
                Delete
              </button>
            </td>
          </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}
