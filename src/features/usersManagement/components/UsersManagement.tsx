import { type User, type Project, type ProjectUser } from "../../../lib/repo";

interface ManageProjectUsersProps {
  users: User[];
  projects: Project[];
  projectUsers: ProjectUser[];
}

export function UsersManagement({
  users,
  projects,
  projectUsers,
}: ManageProjectUsersProps) {
  // Filter out system projects - they are always assigned to all users
  const customProjects = projects.filter((p) => !p.isSystem);

  // Create a map for quick lookup: user_id -> project_id -> ProjectUser
  const projectUserMap = new Map<number, Map<number, ProjectUser>>();
  projectUsers.forEach((pu) => {
    if (!projectUserMap.has(pu.user_id)) {
      projectUserMap.set(pu.user_id, new Map());
    }
    projectUserMap.get(pu.user_id)!.set(pu.project_id, pu);
  });

  const isUserAssignedToProject = (
    userId: number,
    projectId: number
  ): boolean => {
    return projectUserMap.get(userId)?.has(projectId) ?? false;
  };

  const isUserSuppressedInProject = (
    userId: number,
    projectId: number
  ): boolean => {
    const projectUser = projectUserMap.get(userId)?.get(projectId);
    return projectUser ? projectUser.suppressed === 1 : false;
  };

  return (
    <div id="manage-project-users" hx-target="this" hx-swap="outerHTML">
      <div class="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y border border-[var(--border)]">
            <thead class="bg-[var(--bg-tertiary)]">
              <tr>
                <th class="sticky left-0 z-10 border-r border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-left text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                  User
                </th>
                {customProjects.map((project) => (
                  <th class="min-w-[120px] px-4 py-3 text-center text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                    <div class="flex items-center justify-center gap-2">
                      <div
                        class={`h-3 w-3 shrink-0 rounded bg-[${project.color}]`}
                      ></div>
                      <span
                        safe
                        class="max-w-[100px] truncate"
                        title={project.name}
                      >
                        {project.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] bg-[var(--bg-secondary)]">
              {users.map((user) => (
                <tr
                  class="border-b border-[var(--border)] transition-colors"
                  id={`user-row-${user.id}`}
                >
                  <td class="sticky left-0 z-10 border-r border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span
                        safe
                        class="text-sm font-medium text-[var(--text-primary)]"
                      >
                        {user.email}
                      </span>
                      {!user.active && (
                        <span class="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  {customProjects.map((project) => {
                    const assigned = isUserAssignedToProject(
                      user.id,
                      project.id
                    );
                    const suppressed = isUserSuppressedInProject(
                      user.id,
                      project.id
                    );
                    const cellId = `cell-${user.id}-${project.id}`;

                    return (
                      <td
                        class={`px-4 py-3 text-center ${suppressed ? "opacity-50" : ""}`}
                      >
                        <div class="flex items-center justify-center">
                          <input
                            type="checkbox"
                            id={cellId}
                            checked={assigned && !suppressed}
                            hx-post={
                              assigned && !suppressed
                                ? "/partials/usersManagement/remove"
                                : "/partials/usersManagement/assign"
                            }
                            hx-vals={JSON.stringify({
                              user_id: user.id,
                              project_id: project.id,
                            })}
                            hx-target="#manage-project-users"
                            hx-swap="outerHTML"
                            hx-trigger="change"
                            class="h-4 w-4 cursor-pointer rounded accent-[var(--accent)]"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
