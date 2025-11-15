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
  
  const currentUser = req.currentUser || { email: 'Unknown', role: 'worker' };
  const users = userModel.getAll();
  const userOptions = users.map(u => {
    const selected = req.session?.userId === u.id ? 'selected' : '';
    return `<option value="${u.id}" ${selected}>${u.email}</option>`;
  }).join('');
  
  const roleSelected = {
    worker: currentUser.role === 'worker' ? 'selected' : '',
    manager: currentUser.role === 'office-manager' ? 'selected' : '',
    admin: currentUser.role === 'admin' ? 'selected' : '',
  };
  
  const navActive = {
    worker: activeNav === 'worker' ? 'font-bold' : '',
    manager: activeNav === 'manager' ? 'font-bold' : '',
    admin_projects: activeNav === 'admin_projects' ? 'font-bold' : '',
    admin_users: activeNav === 'admin_users' ? 'font-bold' : '',
    admin_reports: activeNav === 'admin_reports' ? 'font-bold' : '',
  };
  
  layout = layout.replace('{{user_options}}', userOptions);
  layout = layout.replace('{{worker_selected}}', roleSelected.worker);
  layout = layout.replace('{{manager_selected}}', roleSelected.manager);
  layout = layout.replace('{{admin_selected}}', roleSelected.admin);
  layout = layout.replace('{{current_user_email}}', currentUser.email);
  layout = layout.replace('{{current_role}}', currentUser.role);
  layout = layout.replace('{{worker_nav_active}}', navActive.worker);
  layout = layout.replace('{{manager_nav_active}}', navActive.manager);
  layout = layout.replace('{{admin_projects_nav_active}}', navActive.admin_projects);
  layout = layout.replace('{{admin_users_nav_active}}', navActive.admin_users);
  layout = layout.replace('{{admin_reports_nav_active}}', navActive.admin_reports);
  layout = layout.replace('{{content}}', content);
  
  return layout;
}

