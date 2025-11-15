import { AuthStubRequest } from '../middleware/auth_stub.js';
import { projectUserModel } from '../models/project_user.js';
import { projectModel } from '../models/project.js';
import { userModel } from '../models/user.js';
import { renderBaseLayout } from '../utils/layout.js';

function renderUsersProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll();
  const workers = userModel.getWorkers();
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Manage Workers in Projects</h1>
      
      <div class="mb-6">
        <label for="project-select" class="block text-sm font-medium mb-2">Select Project</label>
        <select 
          id="project-select"
          hx-get="/admin/users-projects/project"
          hx-target="#project-workers"
          hx-trigger="change"
          hx-include="[name='project_id']"
          name="project_id"
          class="w-full border rounded px-3 py-2"
        >
          <option value="">Select a project</option>
          ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
      
      <div id="project-workers">
        <p class="text-gray-500">Select a project to manage workers.</p>
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'admin_users');
}

function renderProjectWorkers(projectId: number): string {
  const project = projectModel.getById(projectId);
  if (!project) {
    return '<p class="text-red-500">Project not found.</p>';
  }
  
  const projectUsers = projectUserModel.getByProjectId(projectId, true);
  const allWorkers = userModel.getWorkers();
  const assignedWorkerIds = new Set(projectUsers.map(pu => pu.user_id));
  const availableWorkers = allWorkers.filter(w => !assignedWorkerIds.has(w.id));
  
  return `
    <div class="mt-4">
      <h2 class="text-xl font-semibold mb-4">Workers assigned to ${project.name}</h2>
      
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Add Worker</h3>
        <form 
          hx-post="/admin/users-projects"
          hx-target="#project-workers"
          hx-swap="innerHTML"
          hx-trigger="submit"
          hx-on::after-request="this.reset()"
          class="flex gap-4"
        >
          <input type="hidden" name="project_id" value="${projectId}" />
          <select name="user_id" required class="border rounded px-3 py-2 flex-1">
            <option value="">Select worker</option>
            ${availableWorkers.map(w => `<option value="${w.id}">${w.email}</option>`).join('')}
          </select>
          <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Add Worker</button>
        </form>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold mb-2">Assigned Workers</h3>
        ${projectUsers.length === 0 ? '<p class="text-gray-500">No workers assigned to this project.</p>' : `
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 px-4 py-2">Worker Email</th>
                <th class="border border-gray-300 px-4 py-2">Status</th>
                <th class="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${projectUsers.map(pu => {
                const worker = userModel.getById(pu.user_id);
                return `
                  <tr class="${pu.suppressed ? 'bg-gray-50' : ''}">
                    <td class="border border-gray-300 px-4 py-2">${worker?.email || 'Unknown'}</td>
                    <td class="border border-gray-300 px-4 py-2">
                      ${pu.suppressed ? '<span class="text-gray-500">Suppressed</span>' : '<span class="text-green-600">Active</span>'}
                    </td>
                    <td class="border border-gray-300 px-4 py-2">
                      <button 
                        hx-delete="/admin/users-projects/${pu.id}"
                        hx-target="#project-workers"
                        hx-swap="innerHTML"
                        hx-confirm="Remove this worker from the project?"
                        class="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

export async function handleAdminUsersProjectsRoutes(
  action: 'index' | 'project' | 'assign' | 'remove',
  context: any
) {
  const { req, query, body, params } = context;
  const authReq = req as AuthStubRequest;
  
  if (!authReq.currentUser) {
    return { status: 401 as const, body: { body: 'Unauthorized' } };
  }
  if (authReq.currentUser.role !== 'admin') {
    return { status: 403 as const, body: { body: 'Forbidden' } };
  }
  
  if (action === 'index') {
    const html = renderUsersProjectsPage(authReq);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'project') {
    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return { status: 200 as const, body: { body: '<p class="text-gray-500">Select a project to manage workers.</p>' } };
    }
    const html = renderProjectWorkers(projectId);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'assign') {
    const { project_id, user_id } = body;
    const projectId = parseInt(project_id);
    const userId = parseInt(user_id);
    
    if (!projectId || !userId) {
      return { status: 400 as const, body: { body: 'Invalid project or user ID' } };
    }
    
    try {
      projectUserModel.create(userId, projectId);
      const html = renderProjectWorkers(projectId);
      return { status: 200 as const, body: { body: html } };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        return { status: 400 as const, body: { body: 'Worker already assigned to this project' } };
      }
      return { status: 500 as const, body: { body: 'Error assigning worker' } };
    }
  }
  
  if (action === 'remove') {
    const id = parseInt(params.id);
    
    const allProjects = projectModel.getAll(true);
    let projectUser: any = null;
    for (const project of allProjects) {
      const projectUsers = projectUserModel.getByProjectId(project.id, true);
      const found = projectUsers.find(pu => pu.id === id);
      if (found) {
        projectUser = found;
        break;
      }
    }
    
    if (!projectUser) {
      return { status: 404 as const, body: { body: 'Assignment not found' } };
    }
    
    projectUserModel.delete(id);
    const html = renderProjectWorkers(projectUser.project_id);
    return { status: 200 as const, body: { body: html } };
  }
  
  return { status: 500 as const, body: { body: 'Internal server error' } };
}

