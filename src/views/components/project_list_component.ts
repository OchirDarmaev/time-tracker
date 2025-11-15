import { html } from "../../utils/html";

export interface Project {
  id: number;
  name: string;
  suppressed?: boolean;
}

export interface ProjectListProps {
  projects: Project[];
}

export function renderProjectList(props: ProjectListProps): string {
  const projects = props.projects || [];

  if (projects.length === 0) {
    return '<p class="text-gray-600 dark:text-gray-400">No projects found.</p>';
  }

  return html`
    <div
      class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 shadow-sm"
      id="projects-list"
    >
      <table
        class="w-full border-separate border-spacing-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
      >
        <thead class="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th
              class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
            >
              ID
            </th>
            <th
              class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
            >
              Name
            </th>
            <th
              class="px-5 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
            >
              Status
            </th>
            <th
              class="px-5 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide border-b border-gray-300 dark:border-gray-600"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map(
              (project) => `
            <tr id="project-${project.id}" class="hover:bg-gray-200 dark:hover:bg-gray-700 ${project.suppressed ? "opacity-60" : ""}">
              <td class="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">#${project.id}</td>
              <td class="px-5 py-4 text-gray-900 dark:text-gray-100 font-medium text-sm">${project.name}</td>
              <td class="px-5 py-4">
                ${project.suppressed ? '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Suppressed</span>' : '<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Active</span>'}
              </td>
              <td class="px-5 py-4 text-right">
                <button 
                  hx-patch="/admin/projects/${project.id}/suppress"
                  hx-target="#projects-list"
                  hx-swap="innerHTML transition:true"
                  class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500"
                >
                  ${project.suppressed ? "Activate" : "Suppress"}
                </button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
