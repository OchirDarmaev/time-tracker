import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AuthStubRequest } from '../middleware/auth_stub.js';
import { userModel } from '../models/user.js';
import { projectModel } from '../models/project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const roleLabels: Record<string, string> = {
  'worker': 'Worker',
  'office-manager': 'Office Manager',
  'admin': 'Admin'
};

function getNavButtons(availableRoles: string[], activeNav: string): string {
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
  
  return navItems.map(item => {
    const hasAccess = item.requiredRoles.some(role => availableRoles.includes(role));
    const isActive = activeNav === item.activeNav;
    const activeClass = isActive ? 'active' : '';
    
    if (hasAccess) {
      return `<a href="${item.href}" class="nav-link ${activeClass}">${item.label}</a>`;
    } else {
      const requiredRolesText = item.requiredRoles
        .map(r => `'${roleLabels[r] || r}'`)
        .join(' or ');
      const tooltipText = `role ${requiredRolesText} required`;
      return `<span style="color: var(--text-tertiary); cursor: not-allowed; padding: 8px 12px; font-size: 14px;" title="${tooltipText}">${item.label}</span>`;
    }
  }).join('');
}

function getRoleSelector(availableRoles: string[], currentRole: string | undefined): string {
  if (availableRoles.length <= 1) return '';
  
  return `
    <select 
      hx-post="/auth-stub/set-role"
      hx-target="body"
      hx-swap="transition:true"
      hx-trigger="change"
      hx-include="[name='role']"
      name="role"
      class="select-modern"
      style="min-width: 140px;"
    >
      ${availableRoles.map(role => {
        const selected = currentRole === role ? 'selected' : '';
        return `<option value="${role}" ${selected}>${roleLabels[role] || role}</option>`;
      }).join('')}
    </select>
  `;
}

function getProjectSelector(availableRoles: string[], userId: number | undefined): string {
  if (!availableRoles.includes('worker') || !userId) return '';
  
  const userProjects = projectModel.getByUserId(userId);
  if (userProjects.length === 0) return '';
  
  return `
    <select 
      class="select-modern"
      style="min-width: 160px;"
      onchange="if(this.value) window.location.href='/worker/time?project=' + this.value"
    >
      <option value="">All Projects</option>
      ${userProjects.map(project => {
        return `<option value="${project.id}">${project.name}</option>`;
      }).join('')}
    </select>
  `;
}

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
  
  // Get available roles for current user - use currentUser.roles directly (set by middleware)
  const availableRoles: string[] = currentUser.roles || ['worker'];
  const allRolesDisplay = availableRoles.map(role => roleLabels[role] || role).join(', ') || 'None';
  
  // Generate nav bar components
  const navButtons = getNavButtons(availableRoles, activeNav);
  const currentRole = req.session?.userRole as string | undefined;
  const roleSelector = getRoleSelector(availableRoles, currentRole);
  const userId = 'id' in currentUser ? currentUser.id : undefined;
  const projectSelector = getProjectSelector(availableRoles, userId);
  
  // Replace all placeholders
  layout = layout.replace(/\{\{user_options\}\}/g, userOptions || '');
  layout = layout.replace(/\{\{current_user_email\}\}/g, currentUser.email || 'Unknown');
  layout = layout.replace(/\{\{all_roles\}\}/g, allRolesDisplay);
  layout = layout.replace('{{nav_buttons}}', navButtons);
  layout = layout.replace('{{role_selector}}', roleSelector);
  layout = layout.replace('{{project_selector}}', projectSelector);
  layout = layout.replace('{{content}}', content);
  
  return layout;
}

export function renderNavBar(req: AuthStubRequest, activeNav: string = ''): string {
  const currentUser = req.currentUser || { email: 'Unknown', role: 'worker', roles: ['worker'] };
  const availableRoles: string[] = currentUser.roles || ['worker'];
  
  const navButtons = getNavButtons(availableRoles, activeNav);
  const currentRole = req.session?.userRole as string | undefined;
  const roleSelector = getRoleSelector(availableRoles, currentRole);
  const userId = 'id' in currentUser ? currentUser.id : undefined;
  const projectSelector = getProjectSelector(availableRoles, userId);
  
  return `
    <div class="flex items-center gap-1">
      ${navButtons}
    </div>
    <div class="flex items-center gap-3">
      ${roleSelector}
      ${projectSelector}
    </div>
  `;
}

