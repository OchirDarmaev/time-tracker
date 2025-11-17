import { html } from "@/shared/utils/html";

export interface Segment {
  project_id: number;
  minutes: number;
  comment?: string | null;
}

export interface Project {
  id: number;
  name: string;
  suppressed?: boolean;
  color?: string;
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
      class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 shadow-sm my-4 w-full max-w-full box-border"
      data-total-hours="${totalHours}"
      data-segments="${segmentsJson.replace(/"/g, "&quot;")}"
      data-projects="${projectsJson.replace(/"/g, "&quot;")}"
      data-date="${date}"
      data-sync-url="${syncUrl}"
    >
      <div class="mb-4 pb-3 border-b border-gray-300 dark:border-gray-700">
        <div class="mb-2">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wide block"
            >Projects</span
          >
        </div>
        <div id="time-slider-project-chips" class="flex flex-wrap gap-1.5">
          <!-- Project chips will be dynamically inserted here -->
        </div>
      </div>

      <div class="flex justify-end items-center mb-3">
        <div class="flex items-center gap-3">
          <label
            class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium"
          >
            <span class="block">Total Hours:</span>
            <input
              type="number"
              id="total-hours-input"
              class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1 text-xs w-[60px] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 block"
              min="1"
              max="24"
              step="0.5"
              value="${totalHours}"
            />
          </label>
        </div>
      </div>

      <div class="relative my-4">
        <div
          id="time-slider-track"
          class="relative h-16 bg-linear-to-r from-gray-200 via-teal-50/5 to-gray-200 dark:from-gray-700 dark:via-teal-900/5 dark:to-gray-700 rounded-md border border-gray-300 dark:border-gray-600 overflow-visible cursor-pointer min-h-[64px]"
        >
          <!-- Segments and handles will be dynamically inserted here -->
        </div>
        <div class="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
          <span class="font-medium">0h</span>
          <span class="font-medium" id="time-slider-end-label">${totalHours}h</span>
        </div>
      </div>

      <div
        id="time-slider-segments-info"
        class="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700"
      >
        <!-- Segment information will be displayed here -->
      </div>
    </div>
    <script>
      (function () {
        const container = document.getElementById("time-slider-container");
        if (!container) return;

        const tryInit = () => {
          if (window.TimeSlider) {
            try {
              const totalHours = parseFloat(container.getAttribute("data-total-hours") || "8");
              const segments = JSON.parse(container.getAttribute("data-segments") || "[]");
              const projects = JSON.parse(container.getAttribute("data-projects") || "[]");
              const date =
                container.getAttribute("data-date") || new Date().toISOString().split("T")[0];
              const syncUrl = container.getAttribute("data-sync-url") || "";

              const uniqueId =
                "time-slider-" + Date.now() + "-" + Math.random().toString(36).substring(2, 11);
              container.id = uniqueId;

              window.timeSliderInstance = new window.TimeSlider(uniqueId, {
                totalHours: totalHours,
                segments: segments,
                projects: projects,
                date: date,
                onChange: (data) => {
                  if (syncUrl) {
                    fetch(syncUrl, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        date: data.date,
                        segments: data.segments,
                      }),
                    })
                      .then((response) => response.json())
                      .then((result) => {
                        if (result.success && window.htmx) {
                          window.htmx.trigger("body", "entries-changed");
                        }
                      })
                      .catch((error) => console.error("Sync error:", error));
                  }
                },
              });
            } catch (error) {
              console.error("Error initializing TimeSlider:", error);
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
