// Time Slider Web Component
// Wraps the existing TimeSlider class in a web component
// Uses light DOM (no shadow) to work with existing TimeSlider class

import { html } from "../../html";

interface TimeSliderInstance {
  totalHours: number;
  setSegments: (segments: Segment[]) => void;
  setProjects: (projects: Project[]) => void;
  syncTimeout?: ReturnType<typeof setTimeout> | null;
}

interface Segment {
  project_id: number;
  minutes: number;
  comment?: string | null;
}

interface Project {
  id: number;
  name: string;
  suppressed?: boolean;
}

interface TimeSliderData {
  segments: Segment[];
  totalHours: number;
  date: string;
}

interface TimeSliderOptions {
  totalHours: number;
  segments: Segment[];
  projects: Project[];
  date: string;
  onChange: (data: TimeSliderData) => void;
}

interface WindowWithTimeSlider extends Window {
  TimeSlider?: new (containerId: string, options: TimeSliderOptions) => TimeSliderInstance;
  htmx?: {
    process: (element: ShadowRoot | HTMLElement) => void;
    trigger: (target: string | HTMLElement, event: string) => void;
  };
}

class TimeSliderComponent extends HTMLElement {
  private timeSliderInstance: TimeSliderInstance | null = null;

  static get observedAttributes(): string[] {
    return ["total-hours", "segments", "projects", "date", "sync-url"];
  }

  constructor() {
    super();
    this.className = "block w-full max-w-full box-border";
  }

  connectedCallback(): void {
    this.render();
    this.initializeTimeSlider();

    // Tell HTMX about this component
    const win = window as WindowWithTimeSlider;
    if (win.htmx) {
      win.htmx.process(this);
    }
  }

  disconnectedCallback(): void {
    if (this.timeSliderInstance?.syncTimeout) {
      clearTimeout(this.timeSliderInstance.syncTimeout);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && this.timeSliderInstance) {
      this.updateFromAttributes();
    }
  }

  private render(): void {
    const totalHours = this.getAttribute("total-hours") || "8";

    this.innerHTML = html`
      <div
        id="time-slider-container"
        class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-sm my-6 w-full max-w-full box-border"
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
    `;
  }

  private initializeTimeSlider(): void {
    // Wait for TimeSlider class to be available
    const tryInit = (): void => {
      const win = window as WindowWithTimeSlider;
      if (win.TimeSlider) {
        try {
          const totalHours = parseFloat(this.getAttribute("total-hours") || "8");
          const segments: Segment[] = JSON.parse(this.getAttribute("segments") || "[]");
          const projects: Project[] = JSON.parse(this.getAttribute("projects") || "[]");
          const date = this.getAttribute("date") || new Date().toISOString().split("T")[0];

          const container = this.querySelector("#time-slider-container");
          if (!container) return;

          // Create unique ID for this instance
          const uniqueId = `time-slider-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          container.id = uniqueId;

          this.timeSliderInstance = new win.TimeSlider(uniqueId, {
            totalHours: totalHours,
            segments: segments,
            projects: projects,
            date: date,
            onChange: (data: TimeSliderData) => {
              // Dispatch custom event for parent to handle
              this.dispatchEvent(
                new CustomEvent("time-slider-change", {
                  detail: data,
                  bubbles: true,
                  composed: true,
                })
              );

              // Also sync to backend if sync-url is provided
              const syncUrl = this.getAttribute("sync-url");
              if (syncUrl) {
                fetch(syncUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    date: data.date,
                    segments: data.segments,
                  }),
                })
                  .then((response) => response.json())
                  .then((result: { success?: boolean }) => {
                    if (result.success && win.htmx) {
                      // Trigger summary update
                      win.htmx.trigger("body", "entries-changed");
                    }
                  })
                  .catch((error) => {
                    console.error("Sync error:", error);
                  });
              }
            },
          });
        } catch (error) {
          console.error("Error initializing TimeSlider:", error);
        }
      } else {
        // TimeSlider not loaded yet, try again in 50ms
        setTimeout(tryInit, 50);
      }
    };

    tryInit();
  }

  private updateFromAttributes(): void {
    if (!this.timeSliderInstance) return;

    const totalHours = parseFloat(this.getAttribute("total-hours") || "8");
    const segments: Segment[] = JSON.parse(this.getAttribute("segments") || "[]");
    const projects: Project[] = JSON.parse(this.getAttribute("projects") || "[]");

    this.timeSliderInstance.totalHours = totalHours;
    this.timeSliderInstance.setSegments(segments);
    this.timeSliderInstance.setProjects(projects);
  }

  // Public method to update data
  public updateData(data: Partial<TimeSliderData & { projects: Project[] }>): void {
    if (data.totalHours !== undefined) {
      this.setAttribute("total-hours", data.totalHours.toString());
    }
    if (data.segments) {
      this.setAttribute("segments", JSON.stringify(data.segments));
    }
    if (data.projects) {
      this.setAttribute("projects", JSON.stringify(data.projects));
    }
    if (data.date) {
      this.setAttribute("date", data.date);
    }
    this.updateFromAttributes();
  }
}

// Register the component
if (!customElements.get("time-slider")) {
  customElements.define("time-slider", TimeSliderComponent);
}
