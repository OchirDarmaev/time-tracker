import {
  type User,
  type Project,
  type ProjectUser,
} from "../../../lib/mock_db";

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
      <div
        class="overflow-hidden rounded-xl shadow-sm"
        style="background-color: var(--bg-secondary); border: 1px solid var(--border);"
      >
        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y"
            style="border-color: var(--border);"
          >
            <thead style="background-color: var(--bg-tertiary);">
              <tr>
                <th
                  class="sticky left-0 z-10 px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
                  style="background-color: var(--bg-tertiary); color: var(--text-secondary); border-right: 1px solid var(--border);"
                >
                  User
                </th>
                {customProjects.map((project) => (
                  <th
                    class="px-4 py-3 text-center text-xs font-semibold tracking-wider uppercase"
                    style="color: var(--text-secondary); min-width: 120px;"
                  >
                    <div class="flex items-center justify-center gap-2">
                      <div
                        class="h-3 w-3 shrink-0 rounded"
                        style={`background-color: ${project.color}`}
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
            <tbody
              class="divide-y"
              style="background-color: var(--bg-secondary); border-color: var(--border);"
            >
              {users.map((user) => (
                <tr
                  class="transition-colors"
                  style="border-color: var(--border);"
                  id={`user-row-${user.id}`}
                >
                  <td
                    class="sticky left-0 z-10 px-4 py-3 whitespace-nowrap"
                    style="background-color: var(--bg-secondary); border-right: 1px solid var(--border);"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        safe
                        class="text-sm font-medium"
                        style="color: var(--text-primary);"
                      >
                        {user.email}
                      </span>
                      {!user.active && (
                        <span
                          class="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
                        >
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
                        class="px-4 py-3 text-center"
                        style={suppressed ? "opacity: 0.5;" : ""}
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
                            class="h-4 w-4 rounded"
                            style="cursor: pointer; accent-color: var(--accent);"
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
