/* global HTMLElement, window, customElements */
// Time Summary Web Component
class TimeSummaryComponent extends HTMLElement {
  static get observedAttributes() {
    return ["date", "hx-get", "hx-trigger"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();

    // Process HTMX in shadow DOM
    if (window.htmx) {
      window.htmx.process(this.shadow);
    }

    // Load summary if hx-get is provided
    const hxGet = this.getAttribute("hx-get");
    if (hxGet && window.htmx) {
      const date = this.getAttribute("date") || "";
      const url = hxGet.includes("?") ? `${hxGet}&date=${date}` : `${hxGet}?date=${date}`;
      window.htmx.ajax("GET", url, {
        target: this.shadow.querySelector("#summary-content"),
        swap: "innerHTML",
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === "date") {
      // Reload summary when date changes
      const hxGet = this.getAttribute("hx-get");
      if (hxGet && window.htmx) {
        const date = newValue || "";
        const url = hxGet.includes("?") ? `${hxGet}&date=${date}` : `${hxGet}?date=${date}`;
        window.htmx.ajax("GET", url, {
          target: this.shadow.querySelector("#summary-content"),
          swap: "innerHTML",
        });
      }
    }
  }

  render() {
    const hxGet = this.getAttribute("hx-get") || "";
    const hxTrigger = this.getAttribute("hx-trigger") || "load";

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .summary-wrapper {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-primary);
        }
        #summary-content {
          min-height: 60px;
        }
      </style>
      <div class="summary-wrapper">
        <h2>Summary</h2>
        <div id="summary-content" ${hxGet ? `hx-get="${hxGet}" hx-trigger="${hxTrigger}"` : ""}>
          <div style="color: var(--text-secondary); text-align: center; padding: 20px;">
            Loading...
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("time-summary")) {
  customElements.define("time-summary", TimeSummaryComponent);
}
