// Date Picker Web Component
class DatePickerComponent extends HTMLElement {
  private shadow: ShadowRoot;

  static get observedAttributes(): string[] {
    return ["value", "hx-get", "hx-target", "hx-trigger"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();

    // Process HTMX in shadow DOM
    const win = window as Window & {
      htmx?: { process: (element: ShadowRoot | HTMLElement) => void };
    };
    if (win.htmx) {
      win.htmx.process(this.shadow);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.render();
      const win = window as Window & {
        htmx?: { process: (element: ShadowRoot | HTMLElement) => void };
      };
      if (win.htmx) {
        win.htmx.process(this.shadow);
      }
    }
  }

  private render(): void {
    const value = this.getAttribute("value") || "";
    const hxGet = this.getAttribute("hx-get") || "";
    const hxTarget = this.getAttribute("hx-target") || "body";
    const hxTrigger = this.getAttribute("hx-trigger") || "change";
    const label = this.getAttribute("label") || "Date";

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .date-picker-wrapper {
          margin-bottom: 24px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        input {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          width: 100%;
        }
        input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(107, 117, 216, 0.08);
        }
      </style>
      <div class="date-picker-wrapper">
        <label for="date-picker">${label}</label>
        <input 
          type="date" 
          id="date-picker" 
          value="${value}"
          ${hxGet ? `hx-get="${hxGet}"` : ""}
          ${hxTarget ? `hx-target="${hxTarget}"` : ""}
          ${hxTrigger ? `hx-trigger="${hxTrigger}"` : ""}
          hx-include="this"
          name="date"
        />
      </div>
    `;
  }
}

if (!customElements.get("date-picker")) {
  customElements.define("date-picker", DatePickerComponent);
}
