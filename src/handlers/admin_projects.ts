import { AuthStubRequest } from '../middleware/auth_stub.js';
import { projectModel } from '../models/project.js';
import { validateProjectName } from '../utils/validation.js';
import { renderBaseLayout } from '../utils/layout.js';

function renderProjectsPage(req: AuthStubRequest) {
  const projects = projectModel.getAll(true);
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Manage Projects</h1>
      
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Add New Project</h2>
        <form 
          hx-post="/admin/projects"
          hx-target="#projects-list"
          hx-swap="innerHTML"
          hx-trigger="submit"
          hx-on::after-request="this.reset()"
          class="flex gap-4"
        >
          <input 
            type="text" 
            name="name" 
            placeholder="Project name" 
            required 
            class="border rounded px-3 py-2 flex-1"
          />
          <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Add Project</button>
        </form>
      </div>
      
      <div id="projects-list">
        ${renderProjectsList(projects)}
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'admin_projects');
}

function renderProjectsList(projects: any[]): string {
  if (projects.length === 0) {
    return '<p class="text-gray-500">No projects found.</p>';
  }
  
  return `
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2">ID</th>
          <th class="border border-gray-300 px-4 py-2">Name</th>
          <th class="border border-gray-300 px-4 py-2">Status</th>
          <th class="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(project => `
          <tr class="${project.suppressed ? 'bg-gray-50' : ''}">
            <td class="border border-gray-300 px-4 py-2">${project.id}</td>
            <td class="border border-gray-300 px-4 py-2">${project.name}</td>
            <td class="border border-gray-300 px-4 py-2">
              ${project.suppressed ? '<span class="text-gray-500">Suppressed</span>' : '<span class="text-green-600">Active</span>'}
            </td>
            <td class="border border-gray-300 px-4 py-2">
              <button 
                hx-patch="/admin/projects/${project.id}/suppress"
                hx-target="#projects-list"
                hx-swap="innerHTML"
                class="text-blue-500 hover:text-blue-700 mr-2"
              >
                ${project.suppressed ? 'Activate' : 'Suppress'}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

export async function handleAdminProjectsRoutes(
  action: 'index' | 'create' | 'toggleSuppress',
  context: any
) {
  const { req, body, params } = context;
  const authReq = req as AuthStubRequest;
  
  if (!authReq.currentUser) {
    return { status: 401 as const, body: { body: 'Unauthorized' } };
  }
  if (authReq.currentUser.role !== 'admin') {
    return { status: 403 as const, body: { body: 'Forbidden' } };
  }
  
  if (action === 'index') {
    const html = renderProjectsPage(authReq);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'create') {
    const { name } = body;
    
    if (!validateProjectName(name)) {
      return { status: 400 as const, body: { body: 'Invalid project name' } };
    }
    
    try {
      projectModel.create(name.trim());
      const projects = projectModel.getAll(true);
      const html = renderProjectsList(projects);
      return { status: 200 as const, body: { body: html } };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        return { status: 400 as const, body: { body: 'Project name already exists' } };
      }
      return { status: 500 as const, body: { body: 'Error creating project' } };
    }
  }
  
  if (action === 'toggleSuppress') {
    const id = parseInt(params.id);
    projectModel.toggleSuppress(id);
    const projects = projectModel.getAll(true);
    const html = renderProjectsList(projects);
    return { status: 200 as const, body: { body: html } };
  }
  
  return { status: 500 as const, body: { body: 'Internal server error' } };
}

