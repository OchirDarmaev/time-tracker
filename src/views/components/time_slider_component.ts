import { html } from "../../utils/html";

export interface Segment {
  project_id: number;
  minutes: number;
  comment?: string | null;
}

export interface Project {
  id: number;
  name: string;
  suppressed?: boolean;
}

export interface TimeSliderProps {
  totalHours?: number;
  segments?: Segment[];
  projects?: Project[];
  date?: string;
  syncUrl?: string;
}

export function renderTimeSlider(props: TimeSliderProps = {}): string {
  const totalHours = props.totalHours || 8;
  const segmentsJson = JSON.stringify(props.segments || []);
  const projectsJson = JSON.stringify(props.projects || []);
  const date = props.date || new Date().toISOString().split("T")[0];
  const syncUrl = props.syncUrl || "";

  return html`
    <div
      id="time-slider-container"
      class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm my-6 w-full max-w-full box-border"
      data-total-hours="${totalHours}"
      data-segments="${segmentsJson.replace(/"/g, "&quot;")}"
      data-projects="${projectsJson.replace(/"/g, "&quot;")}"
      data-date="${date}"
      data-sync-url="${syncUrl}"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 m-0">
          Daily Time Allocation
        </h3>
        <div class="flex items-center gap-4">
          <div id="time-slider-sync-status" class="flex items-center gap-2 mr-3">
            <span id="time-slider-sync-icon" class="text-sm text-green-500 dark:text-green-400"
              >Synced</span
            >
          </div>
          <label
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium"
          >
            Total Hours:
            <input
              type="number"
              id="total-hours-input"
              class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md px-2.5 py-1.5 text-sm w-[70px] focus:outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/10"
              min="1"
              max="24"
              step="0.5"
              value="${totalHours}"
            />
          </label>
        </div>
      </div>

      <div class="relative my-8">
        <div
          id="time-slider-track"
          class="relative h-20 bg-gradient-to-r from-gray-200 via-teal-50/5 to-gray-200 dark:from-gray-700 dark:via-teal-900/5 dark:to-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-visible cursor-pointer"
        >
          <!-- Segments and handles will be dynamically inserted here -->
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div class="font-medium">0h</div>
          <div class="font-medium" id="time-slider-end-label">${totalHours}h</div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
        <div class="mb-3">
          <span
            class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
            >Available Projects</span
          >
        </div>
        <div id="time-slider-project-chips" class="flex flex-wrap gap-2">
          <!-- Project chips will be dynamically inserted here -->
        </div>
      </div>

      <div
        id="time-slider-segments-info"
        class="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700"
      >
        <!-- Segment information will be displayed here -->
      </div>
    </div>
    <script>
      (function() {
        const container = document.getElementById('time-slider-container');
        if (!container) return;
        
        const tryInit = () => {
          if (window.TimeSlider) {
            try {
              const totalHours = parseFloat(container.getAttribute('data-total-hours') || '8');
              const segments = JSON.parse(container.getAttribute('data-segments') || '[]');
              const projects = JSON.parse(container.getAttribute('data-projects') || '[]');
              const date = container.getAttribute('data-date') || new Date().toISOString().split('T')[0];
              const syncUrl = container.getAttribute('data-sync-url') || '';
              
              const uniqueId = 'time-slider-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
              container.id = uniqueId;
              
              window.timeSliderInstance = new window.TimeSlider(uniqueId, {
                totalHours: totalHours,
                segments: segments,
                projects: projects,
                date: date,
                onChange: (data) => {
                  if (syncUrl) {
                    fetch(syncUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        date: data.date,
                        segments: data.segments,
                      }),
                    })
                    .then(response => response.json())
                    .then(result => {
                      if (result.success && window.htmx) {
                        window.htmx.trigger('body', 'entries-changed');
                      }
                    })
                    .catch(error => console.error('Sync error:', error));
                  }
                },
              });
            } catch (error) {
              console.error('Error initializing TimeSlider:', error);
            }
          } else {
            setTimeout(tryInit, 50);
          }
        };
        
        tryInit();
      })();
    </script>
  `;
}
