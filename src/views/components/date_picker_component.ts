// Date Picker Web Component
class DatePickerComponent extends HTMLElement {
  private shadow: ShadowRoot;

  static get observedAttributes(): string[] {
    return ["value", "hx-get", "hx-target", "hx-trigger"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
    `;
    this.shadow.appendChild(style);
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
      <div class="mb-6 w-full max-w-full box-border">
        <label for="date-picker" class="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">${label}</label>
        <input 
          type="date" 
          id="date-picker" 
          class="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3.5 py-2.5 text-sm w-full focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10"
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
