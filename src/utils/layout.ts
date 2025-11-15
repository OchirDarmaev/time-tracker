import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AuthStubRequest } from '../middleware/auth_stub.js';
import { userModel } from '../models/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function renderBaseLayout(content: string, req: AuthStubRequest, activeNav: string = '') {
  const layoutPath = join(__dirname, '../views/layouts/base.html');
  let layout = readFileSync(layoutPath, 'utf-8');
  
  const currentUser = req.currentUser || { email: 'Unknown', role: 'worker', roles: ['worker'] };
  const users = userModel.getAll();
  const userOptions = users.map(u => {
    const selected = req.session?.userId === u.id ? 'selected' : '';
    const rolesJson = JSON.stringify(u.roles);
    return `<option value="${u.id}" data-roles='${rolesJson}' ${selected}>${u.email}</option>`;
  }).join('');
  
  // Generate role options based on current user's roles
  const currentUserId = 'id' in currentUser ? currentUser.id : undefined;
  const currentUserObj = currentUserId ? users.find(u => u.id === currentUserId) : null;
  const availableRoles: string[] = currentUserObj?.roles || currentUser.roles || ['worker'];
  const roleOptions = [
    { value: 'worker', label: 'Worker', selected: currentUser.role === 'worker' && availableRoles.includes('worker') },
    { value: 'office-manager', label: 'Office Manager', selected: currentUser.role === 'office-manager' && availableRoles.includes('office-manager') },
    { value: 'admin', label: 'Admin', selected: currentUser.role === 'admin' && availableRoles.includes('admin') },
  ]
    .filter(opt => availableRoles.includes(opt.value))
    .map(opt => `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`)
    .join('');
  
  const navActive = {
    worker: activeNav === 'worker' ? 'font-bold' : '',
    manager: activeNav === 'manager' ? 'font-bold' : '',
    admin_projects: activeNav === 'admin_projects' ? 'font-bold' : '',
    admin_users: activeNav === 'admin_users' ? 'font-bold' : '',
    admin_reports: activeNav === 'admin_reports' ? 'font-bold' : '',
  };
  
  // Format all roles for display
  const roleLabels: Record<string, string> = {
    'worker': 'Worker',
    'office-manager': 'Office Manager',
    'admin': 'Admin'
  };
  const allRolesDisplay = availableRoles.map(role => roleLabels[role] || role).join(', ') || 'None';
  
  // Replace all placeholders
  layout = layout.replace(/\{\{user_options\}\}/g, userOptions || '');
  layout = layout.replace(/\{\{role_options\}\}/g, roleOptions || '');
  layout = layout.replace(/\{\{current_user_email\}\}/g, currentUser.email || 'Unknown');
  layout = layout.replace(/\{\{current_role\}\}/g, currentUser.role || 'worker');
  layout = layout.replace(/\{\{all_roles\}\}/g, allRolesDisplay);
  layout = layout.replace('{{worker_nav_active}}', navActive.worker);
  layout = layout.replace('{{manager_nav_active}}', navActive.manager);
  layout = layout.replace('{{admin_projects_nav_active}}', navActive.admin_projects);
  layout = layout.replace('{{admin_users_nav_active}}', navActive.admin_users);
  layout = layout.replace('{{admin_reports_nav_active}}', navActive.admin_reports);
  layout = layout.replace('{{content}}', content);
  
  return layout;
}

