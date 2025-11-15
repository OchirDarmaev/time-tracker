import { Router, Response } from 'express';
import { AuthStubRequest, requireRole } from '../../middleware/auth_stub.js';
import { projectModel } from '../../models/project.js';
import { validateProjectName } from '../../utils/validation.js';
import { renderBaseLayout } from '../../utils/layout.js';

const router = Router();

function renderProjectsPage(req: AuthStubRequest, res: Response) {
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
  
  res.send(renderBaseLayout(content, req, 'admin_projects'));
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

router.get('/', requireRole('admin'), (req: AuthStubRequest, res: Response) => {
  renderProjectsPage(req, res);
});

router.post('/', requireRole('admin'), (req: AuthStubRequest, res: Response) => {
  const { name } = req.body;
  
  if (!validateProjectName(name)) {
    return res.status(400).send('Invalid project name');
  }
  
  try {
    projectModel.create(name.trim());
    const projects = projectModel.getAll(true);
    res.send(renderProjectsList(projects));
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).send('Project name already exists');
    }
    return res.status(500).send('Error creating project');
  }
});

router.patch('/:id/suppress', requireRole('admin'), (req: AuthStubRequest, res: Response) => {
  const id = parseInt(req.params.id);
  projectModel.toggleSuppress(id);
  const projects = projectModel.getAll(true);
  res.send(renderProjectsList(projects));
});

export default router;

