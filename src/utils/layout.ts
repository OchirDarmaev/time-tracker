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
  
  // Get available roles for current user
  const currentUserId = 'id' in currentUser ? currentUser.id : undefined;
  const currentUserObj = currentUserId ? users.find(u => u.id === currentUserId) : null;
  const availableRoles: string[] = currentUserObj?.roles || currentUser.roles || ['worker'];
  
  // Format all roles for display
  const roleLabels: Record<string, string> = {
    'worker': 'Worker',
    'office-manager': 'Office Manager',
    'admin': 'Admin'
  };
  const allRolesDisplay = availableRoles.map(role => roleLabels[role] || role).join(', ') || 'None';
  
  // Generate navigation buttons based on available roles
  const navItems = [
    {
      href: '/worker/time',
      label: 'My Time',
      requiredRoles: ['worker'],
      activeNav: 'worker'
    },
    {
      href: '/manager/reports',
      label: 'Reports',
      requiredRoles: ['office-manager', 'admin'],
      activeNav: 'manager'
    },
    {
      href: '/admin/projects',
      label: 'Projects',
      requiredRoles: ['admin'],
      activeNav: 'admin_projects'
    },
    {
      href: '/admin/users-projects',
      label: 'Assign Workers',
      requiredRoles: ['admin'],
      activeNav: 'admin_users'
    },
    {
      href: '/admin/system-reports',
      label: 'System Reports',
      requiredRoles: ['admin'],
      activeNav: 'admin_reports'
    }
  ];
  
  const navButtons = navItems.map(item => {
    const hasAccess = item.requiredRoles.some(role => availableRoles.includes(role));
    const isActive = activeNav === item.activeNav;
    const activeClass = isActive ? 'font-bold' : '';
    
    if (hasAccess) {
      return `<a href="${item.href}" class="text-blue-600 hover:text-blue-800 ${activeClass}">${item.label}</a>`;
    } else {
      const requiredRolesText = item.requiredRoles.map(r => roleLabels[r] || r).join(' or ');
      return `<span class="text-gray-400 cursor-not-allowed" title="Requires ${requiredRolesText} role">${item.label}</span>`;
    }
  }).join('');
  
  // Replace all placeholders
  layout = layout.replace(/\{\{user_options\}\}/g, userOptions || '');
  layout = layout.replace(/\{\{current_user_email\}\}/g, currentUser.email || 'Unknown');
  layout = layout.replace(/\{\{all_roles\}\}/g, allRolesDisplay);
  layout = layout.replace('{{nav_buttons}}', navButtons);
  layout = layout.replace('{{content}}', content);
  
  return layout;
}

