/* global HTMLElement, window, clearTimeout, CustomEvent, fetch, console, setTimeout, customElements */
// Time Slider Web Component
// Wraps the existing TimeSlider class in a web component
// Uses light DOM (no shadow) to work with existing TimeSlider class

class TimeSliderComponent extends HTMLElement {
  static get observedAttributes() {
    return ["total-hours", "segments", "projects", "date", "sync-url"];
  }

  constructor() {
    super();
    this.timeSliderInstance = null;
  }

  connectedCallback() {
    this.render();
    this.initializeTimeSlider();

    // Tell HTMX about this component
    if (window.htmx) {
      window.htmx.process(this);
    }
  }

  disconnectedCallback() {
    if (this.timeSliderInstance && this.timeSliderInstance.syncTimeout) {
      clearTimeout(this.timeSliderInstance.syncTimeout);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.timeSliderInstance) {
      this.updateFromAttributes();
    }
  }

  render() {
    const totalHours = this.getAttribute("total-hours") || "8";
    // segments and projects are used in initializeTimeSlider, not here

    // Get styles from the original component
    const styles = this.getStyles();

    this.innerHTML = `
      <style>${styles}</style>
      <div id="time-slider-container" class="time-slider-wrapper">
        <div class="time-slider-header">
          <h3 class="time-slider-title">Daily Time Allocation</h3>
          <div class="time-slider-controls">
            <div id="time-slider-sync-status" class="time-slider-sync-status" style="display: flex; align-items: center; gap: 8px; margin-right: 12px;">
              <span id="time-slider-sync-icon" class="time-slider-sync-icon" style="font-size: 14px; color: var(--success);">Synced</span>
            </div>
            <label class="time-slider-total-label">
              Total Hours:
              <input 
                type="number" 
                id="total-hours-input" 
                class="time-slider-total-input"
                min="1" 
                max="24" 
                step="0.5" 
                value="${totalHours}"
              />
            </label>
          </div>
        </div>

        <div class="time-slider-track-container">
          <div id="time-slider-track" class="time-slider-track">
            <!-- Segments and handles will be dynamically inserted here -->
          </div>
          <div class="time-slider-labels">
            <div class="time-slider-label">0h</div>
            <div class="time-slider-label" id="time-slider-end-label">${totalHours}h</div>
          </div>
        </div>

        <div class="time-slider-projects">
          <div class="time-slider-projects-header">
            <span class="time-slider-projects-title">Available Projects</span>
          </div>
          <div id="time-slider-project-chips" class="time-slider-project-chips">
            <!-- Project chips will be dynamically inserted here -->
          </div>
        </div>

        <div id="time-slider-segments-info" class="time-slider-segments-info">
          <!-- Segment information will be displayed here -->
        </div>
      </div>
    `;
  }

  initializeTimeSlider() {
    // Wait for TimeSlider class to be available
    const tryInit = () => {
      if (window.TimeSlider) {
        try {
          const totalHours = parseFloat(this.getAttribute("total-hours")) || 8;
          const segments = JSON.parse(this.getAttribute("segments") || "[]");
          const projects = JSON.parse(this.getAttribute("projects") || "[]");
          const date = this.getAttribute("date") || new Date().toISOString().split("T")[0];

          const container = this.querySelector("#time-slider-container");
          if (!container) return;

          // Create unique ID for this instance
          const uniqueId = `time-slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          container.id = uniqueId;

          this.timeSliderInstance = new window.TimeSlider(uniqueId, {
            totalHours: totalHours,
            segments: segments,
            projects: projects,
            date: date,
            onChange: (data) => {
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
                  .then((result) => {
                    if (result.success) {
                      // Trigger summary update
                      if (window.htmx) {
                        window.htmx.trigger("body", "entries-changed");
                      }
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

  updateFromAttributes() {
    if (!this.timeSliderInstance) return;

    const totalHours = parseFloat(this.getAttribute("total-hours")) || 8;
    const segments = JSON.parse(this.getAttribute("segments") || "[]");
    const projects = JSON.parse(this.getAttribute("projects") || "[]");

    this.timeSliderInstance.totalHours = totalHours;
    this.timeSliderInstance.setSegments(segments);
    this.timeSliderInstance.setProjects(projects);
  }

  getStyles() {
    return `
      :host {
        display: block;
      }
      .time-slider-wrapper {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 24px;
        box-shadow: var(--shadow-sm);
        margin: 24px 0;
      }
      .time-slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .time-slider-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
      .time-slider-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .time-slider-total-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
      }
      .time-slider-total-input {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border);
        color: var(--text-primary);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 14px;
        width: 70px;
      }
      .time-slider-total-input:focus {
        outline: none;
        border-color: #14b8a6;
        box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
      }
      .time-slider-track-container {
        position: relative;
        margin: 32px 0;
      }
      .time-slider-track {
        position: relative;
        height: 80px;
        background: linear-gradient(to right, 
          var(--bg-tertiary) 0%, 
          rgba(20, 184, 166, 0.05) 50%, 
          var(--bg-tertiary) 100%);
        border-radius: 8px;
        border: 1px solid var(--border);
        overflow: visible;
        cursor: pointer;
      }
      .time-slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-tertiary);
      }
      .time-slider-label {
        font-weight: 500;
      }
      .time-slider-segment {
        position: absolute;
        top: 0;
        height: 100%;
        border-radius: 8px;
        transition: left 0.2s ease, width 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
      }
      .time-slider-segment:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .time-slider-segment-content {
        position: relative;
        z-index: 2;
        text-align: center;
        pointer-events: none;
      }
      .time-slider-segment-name {
        font-size: 13px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        margin-bottom: 2px;
      }
      .time-slider-segment-duration {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.9);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
      .time-slider-handle {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 48px;
        background: var(--bg-primary);
        border: 2px solid #14b8a6;
        border-radius: 6px;
        cursor: grab;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: left 0.2s ease;
      }
      .time-slider-handle:hover {
        border-color: #0d9488;
        box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        transform: translate(-50%, -50%) scale(1.1);
      }
      .time-slider-handle:active {
        cursor: grabbing;
      }
      .time-slider-handle.active {
        border-color: #06b6d4;
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.2), 
                    0 4px 16px rgba(20, 184, 166, 0.4);
        transform: translate(-50%, -50%) scale(1.15);
      }
      .time-slider-handle-bars {
        display: flex;
        gap: 2px;
        align-items: center;
      }
      .time-slider-handle-bar {
        width: 2px;
        height: 20px;
        background: #14b8a6;
        border-radius: 1px;
      }
      .time-slider-handle.active .time-slider-handle-bar {
        background: #06b6d4;
      }
      .time-slider-projects {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--border);
      }
      .time-slider-projects-header {
        margin-bottom: 12px;
      }
      .time-slider-projects-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .time-slider-project-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .time-slider-project-chip {
        display: inline-flex;
        align-items: center;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid var(--border);
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }
      .time-slider-project-chip:hover:not(.disabled) {
        background-color: var(--bg-secondary);
        border-color: #14b8a6;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(20, 184, 166, 0.2);
      }
      .time-slider-project-chip.active {
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
        color: white;
        border-color: #0d9488;
        box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
      }
      .time-slider-project-chip.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background-color: var(--bg-tertiary);
      }
      .time-slider-segments-info {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border);
      }
      .time-slider-segment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--bg-tertiary);
        border-radius: 8px;
        margin-bottom: 8px;
        border: 1px solid var(--border);
      }
      .time-slider-segment-item:hover {
        background-color: var(--bg-secondary);
        border-color: #14b8a6;
      }
      .time-slider-segment-item-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .time-slider-segment-item-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .time-slider-segment-item-name {
        font-weight: 500;
        color: var(--text-primary);
        font-size: 14px;
      }
      .time-slider-segment-item-duration {
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 600;
      }
      .time-slider-segment-item-remove {
        background: none;
        border: none;
        color: var(--text-tertiary);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      .time-slider-segment-item-remove:hover {
        background-color: rgba(248, 113, 113, 0.1);
        color: var(--error);
      }
      .time-slider-empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--text-tertiary);
        font-size: 14px;
      }
      .time-slider-empty-state-text {
        margin-bottom: 16px;
      }
      .time-slider-sync-status {
        display: flex;
        align-items: center;
      }
      .time-slider-sync-icon {
        font-size: 14px;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      .pulse-animation {
        animation: pulse 1.5s ease-in-out infinite;
      }
    `;
  }

  // Public method to update data
  updateData(data) {
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
