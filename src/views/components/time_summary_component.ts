// Time Summary Web Component

import { html } from "../../html";

// Uses light DOM (no shadow) for simpler HTMX integration and CSS class access
interface HtmxInstance {
  process: (element: ShadowRoot | HTMLElement) => void;
  ajax: (
    method: string,
    url: string,
    options: { target: HTMLElement | null; swap: string }
  ) => void;
}

class TimeSummaryComponent extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["date", "hx-get", "hx-trigger", "data-hx-get", "data-hx-trigger"];
  }

  constructor() {
    super();
    this.className = "block w-full max-w-full box-border";
  }

  connectedCallback(): void {
    this.render();

    // Wait for DOM to be ready before loading summary
    requestAnimationFrame(() => {
      // Get hx-get from data-hx-get attribute (to prevent HTMX from processing it automatically)
      const hxGet = this.getAttribute("data-hx-get") || this.getAttribute("hx-get");
      const htmx = (window as Window & { htmx?: HtmxInstance }).htmx;
      if (hxGet) {
        const date = this.getAttribute("date") || "";
        const url = hxGet.includes("?") ? `${hxGet}&date=${date}` : `${hxGet}?date=${date}`;
        const contentDiv = this.querySelector("#summary-content") as HTMLElement;
        if (contentDiv) {
          // Use fetch directly to avoid HTMX body replacement issues
          fetch(url)
            .then((response) => response.text())
            .then((html) => {
              if (contentDiv && contentDiv.parentElement) {
                contentDiv.innerHTML = html;
              }
            })
            .catch((error) => {
              console.error("Error loading summary:", error);
            });
        }
      }

      // Process HTMX for future updates (entries-changed trigger)
      setTimeout(() => {
        if (htmx) {
          const contentDiv = this.querySelector("#summary-content") as HTMLElement;
          if (contentDiv) {
            // Set up HTMX for entries-changed trigger
            const trigger = this.getAttribute("data-hx-trigger") || this.getAttribute("hx-trigger");
            if (trigger && trigger.includes("entries-changed")) {
              contentDiv.setAttribute("hx-get", hxGet || "");
              contentDiv.setAttribute("hx-target", "this");
              contentDiv.setAttribute("hx-swap", "innerHTML");
              contentDiv.setAttribute("hx-trigger", "entries-changed from:body");
              htmx.process(contentDiv);
            }
          }
        }
      }, 100);
    });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && name === "date") {
      // Reload summary when date changes
      const hxGet = this.getAttribute("data-hx-get") || this.getAttribute("hx-get");
      if (hxGet) {
        const date = newValue || "";
        const url = hxGet.includes("?") ? `${hxGet}&date=${date}` : `${hxGet}?date=${date}`;
        const contentDiv = this.querySelector("#summary-content") as HTMLElement;
        if (contentDiv) {
          fetch(url)
            .then((response) => response.text())
            .then((html) => {
              if (contentDiv && contentDiv.parentElement) {
                contentDiv.innerHTML = html;
              }
            })
            .catch((error) => {
              console.error("Error loading summary:", error);
            });
        }
      }
    }
  }

  private render(): void {
    const hxGet = this.getAttribute("data-hx-get") || this.getAttribute("hx-get") || "";
    const hxTrigger =
      this.getAttribute("data-hx-trigger") || this.getAttribute("hx-trigger") || "load";

    this.innerHTML = html`
      <div
        id="summary-content"
        class="block w-full max-w-full box-border min-h-[60px]"
        ${hxGet && hxTrigger.includes("entries-changed")
          ? `hx-get="${hxGet}" hx-target="this" hx-swap="innerHTML" hx-trigger="entries-changed from:body"`
          : ""}
      >
        <div class="text-gray-500 dark:text-gray-400 text-center py-5">Loading...</div>
      </div>
    `;
  }
}

if (!customElements.get("time-summary")) {
  customElements.define("time-summary", TimeSummaryComponent);
}
