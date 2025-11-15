import { AuthStubRequest } from '../middleware/auth_stub.js';
import { timeEntryModel } from '../models/time_entry.js';
import { projectModel } from '../models/project.js';
import { formatDate, getCurrentMonth, getMonthFromDate, minutesToHours, getWorkingDaysInMonth, parseDate } from '../utils/date_utils.js';
import { validateDate, validateMinutes } from '../utils/validation.js';
import { renderBaseLayout } from '../utils/layout.js';

function renderTimeTrackingPage(req: AuthStubRequest) {
  const currentUser = req.currentUser!;
  const today = formatDate(new Date());
  const selectedDate = (req.query.date as string) || today;
  
  const projects = projectModel.getByUserId(currentUser.id);
  const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, selectedDate);
  const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, selectedDate);
  const totalHours = minutesToHours(totalMinutes);
  
  const month = getMonthFromDate(selectedDate);
  const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
  const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);
  
  const dateObj = parseDate(selectedDate);
  const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
  const requiredMonthlyHours = workingDays * 8;
  
  const dailyWarning = totalHours < 8;
  const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">My Time Tracking</h1>
      
      <div class="mb-6">
        <label for="date-picker" class="block text-sm font-medium mb-2">Date</label>
        <input 
          type="date" 
          id="date-picker" 
          value="${selectedDate}"
          hx-get="/worker/time"
          hx-target="body"
          hx-trigger="change"
          hx-include="this"
          name="date"
          class="border rounded px-3 py-2"
        />
      </div>
      
      <div id="entries-container" hx-get="/worker/time/entries?date=${selectedDate}" hx-trigger="load, entries-changed from:body">
        ${renderEntriesTable(entries, projects)}
      </div>
      
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Add Entry</h2>
        <form 
          hx-post="/worker/time/entries"
          hx-target="#entries-container"
          hx-swap="innerHTML"
          hx-trigger="submit"
          hx-on::after-request="document.getElementById('add-entry-form').reset(); htmx.trigger('body', 'entries-changed')"
          id="add-entry-form"
          class="grid grid-cols-4 gap-4"
        >
          <input type="hidden" name="date" value="${selectedDate}" />
          <select name="project_id" required class="border rounded px-3 py-2">
            <option value="">Select Project</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <input 
            type="number" 
            name="hours" 
            step="0.5" 
            min="0.5" 
            max="24" 
            placeholder="Hours" 
            required 
            class="border rounded px-3 py-2"
          />
          <input 
            type="text" 
            name="comment" 
            placeholder="Comment (e.g., #meeting #setup)" 
            class="border rounded px-3 py-2"
          />
          <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Add Entry</button>
        </form>
      </div>
      
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Summary</h2>
        <div id="summary-container" hx-get="/worker/time/summary?date=${selectedDate}" hx-trigger="load, entries-changed from:body">
          ${renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, dailyWarning, monthlyWarning)}
        </div>
      </div>
    </div>
  `;
  
  return renderBaseLayout(content, req, 'worker');
}

function renderEntriesTable(entries: any[], projects: any[]): string {
  if (entries.length === 0) {
    return '<p class="text-gray-500">No entries for this date.</p>';
  }
  
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  
  return `
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2">Project</th>
          <th class="border border-gray-300 px-4 py-2">Hours</th>
          <th class="border border-gray-300 px-4 py-2">Comment</th>
          <th class="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map(entry => `
          <tr>
            <td class="border border-gray-300 px-4 py-2">${projectMap.get(entry.project_id) || 'Unknown'}</td>
            <td class="border border-gray-300 px-4 py-2">${minutesToHours(entry.minutes).toFixed(1)}</td>
            <td class="border border-gray-300 px-4 py-2">${entry.comment || ''}</td>
            <td class="border border-gray-300 px-4 py-2">
              <button 
                hx-delete="/worker/time/entries/${entry.id}"
                hx-target="#entries-container"
                hx-swap="innerHTML"
                hx-confirm="Delete this entry?"
                hx-on::after-request="htmx.trigger('body', 'entries-changed')"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderSummary(totalHours: number, monthlyTotalHours: number, requiredMonthlyHours: number, dailyWarning: boolean, monthlyWarning: boolean): string {
  return `
    <div class="space-y-4">
      <div class="p-4 border rounded ${dailyWarning ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}">
        <div class="flex items-center justify-between">
          <span class="font-semibold">Daily Total: ${totalHours.toFixed(1)} hours</span>
          ${dailyWarning ? '<span class="text-red-600">❗ Less than 8 hours</span>' : '<span class="text-green-600">✓ Complete</span>'}
        </div>
      </div>
      <div class="p-4 border rounded ${monthlyWarning ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}">
        <div class="flex items-center justify-between">
          <span class="font-semibold">Monthly Total: ${monthlyTotalHours.toFixed(1)} / ${requiredMonthlyHours} hours</span>
          ${monthlyWarning ? '<span class="text-yellow-600">⚠️ Below target</span>' : '<span class="text-green-600">✓ On track</span>'}
        </div>
      </div>
    </div>
  `;
}

export async function handleWorkerTimeRoutes(
  action: 'index' | 'entries' | 'createEntry' | 'deleteEntry' | 'summary',
  context: any
) {
  const { req, query, body, params } = context;
  const authReq = req as AuthStubRequest;
  
  // Check authentication and role
  if (!authReq.currentUser) {
    return { status: 401 as const, body: { body: 'Unauthorized' } };
  }
  if (authReq.currentUser.role !== 'worker') {
    return { status: 403 as const, body: { body: 'Forbidden' } };
  }
  
  const currentUser = authReq.currentUser;
  
  if (action === 'index') {
    const html = renderTimeTrackingPage(authReq);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'entries') {
    const date = (query?.date as string) || formatDate(new Date());
    
    if (!validateDate(date)) {
      return { status: 400 as const, body: { body: 'Invalid date' } };
    }
    
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'createEntry') {
    const { project_id, date, hours, comment } = body;
    
    if (!validateDate(date)) {
      return { status: 400 as const, body: { body: 'Invalid date' } };
    }
    
    const minutes = Math.round(parseFloat(hours) * 60);
    if (!validateMinutes(minutes)) {
      return { status: 400 as const, body: { body: 'Invalid hours' } };
    }
    
    const project = projectModel.getById(parseInt(project_id));
    if (!project) {
      return { status: 400 as const, body: { body: 'Invalid project' } };
    }
    
    const userProjects = projectModel.getByUserId(currentUser.id);
    if (!userProjects.find(p => p.id === project.id)) {
      return { status: 403 as const, body: { body: 'Access denied to this project' } };
    }
    
    timeEntryModel.create(currentUser.id, project.id, date, minutes, comment || null);
    
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'deleteEntry') {
    const entryId = parseInt(params.id);
    
    const entry = timeEntryModel.getById(entryId);
    if (!entry) {
      return { status: 404 as const, body: { body: 'Entry not found' } };
    }
    
    if (entry.user_id !== currentUser.id) {
      return { status: 403 as const, body: { body: 'Access denied' } };
    }
    
    timeEntryModel.delete(entryId);
    
    const date = entry.date;
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return { status: 200 as const, body: { body: html } };
  }
  
  if (action === 'summary') {
    const date = (query?.date as string) || formatDate(new Date());
    
    if (!validateDate(date)) {
      return { status: 400 as const, body: { body: 'Invalid date' } };
    }
    
    const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
    const totalHours = minutesToHours(totalMinutes);
    
    const month = getMonthFromDate(date);
    const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
    const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);
    
    const dateObj = parseDate(date);
    const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
    const requiredMonthlyHours = workingDays * 8;
    
    const dailyWarning = totalHours < 8;
    const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;
    
    const html = renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, dailyWarning, monthlyWarning);
    return { status: 200 as const, body: { body: html } };
  }
  
  return { status: 500 as const, body: { body: 'Internal server error' } };
}

