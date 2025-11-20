import { registerWebComponent, processHtmxInShadow } from "./web_components";

class MultiSlider extends HTMLElement {
  static get observedAttributes() {
    return ["values", "total"];
  }

  private total: number = 8;
  private values: number[] = [2, 5, 1];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.total = Number(this.getAttribute("total") || 8);
    this.values = JSON.parse(this.getAttribute("values") || "[2,5,1]");
  }

  connectedCallback() {
    this.renderShadow();
    this.attachEvents();
    this.render();
    // Tell HTMX about this component's shadow DOM
    processHtmxInShadow(this.shadowRoot as unknown as HTMLElement);
  }

  attributeChangedCallback() {
    this.total = Number(this.getAttribute("total") || this.total);
    this.values = JSON.parse(this.getAttribute("values") || "[]");
    if (this.shadowRoot) {
      this.renderShadow();
      this.attachEvents();
      this.render();
      // Re-process HTMX after attribute changes
      processHtmxInShadow(this.shadowRoot as unknown as HTMLElement);
    }
  }

  // ============= RENDER SHADOW DOM STRUCTURE =============
  renderShadow() {
    this.shadowRoot!.innerHTML = `
      <style>
        /* Tailwind mini utility block */
        .slider { 
          width: 100%; 
          height: 2.5rem; 
          border-radius: 0.5rem; 
          overflow: hidden; 
          display: flex; 
          background-color: var(--bg-tertiary); 
          user-select: none; 
        }
        .seg { 
          height: 100%; 
          transition: all 0.2s; 
        }
        .handle { 
          width: 0.5rem; 
          background-color: rgba(0, 0, 0, 0.3); 
          cursor: ew-resize; 
        }
        .color0 { background-color: var(--info); }
        .color1 { background-color: var(--accent); }
        .color2 { background-color: var(--success); }
        .color3 { background-color: var(--project-default); }
        .color4 { background-color: var(--orange); }
        .color5 { background-color: var(--warning); }
      </style>

      <div class="slider">
        ${this.values
          .map(
            (v, i) => `
            <div class="seg color${i % 6}" data-seg="${i}"></div>
            ${i < this.values.length - 1 ? `<div class="handle" data-handle="${i}"></div>` : ""}
        `
          )
          .join("")}
      </div>
    `;
  }

  // ============= MAIN RENDER ===================
  render() {
    const segs = this.shadowRoot!.querySelectorAll(".seg");

    segs.forEach((seg, i) => {
      (seg as HTMLElement).style.flexGrow = String(this.values[i]);
    });

    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { values: [...this.values] },
      })
    );
  }

  // ============= EVENT HANDLERS (GENERIC) =================
  attachEvents() {
    const slider = this.shadowRoot!.querySelector(".slider") as HTMLElement;
    const handles = this.shadowRoot!.querySelectorAll(".handle");

    handles.forEach((h) => {
      const index = Number((h as HTMLElement).dataset.handle);
      const handleElement = h as HTMLElement;

      handleElement.onmousedown = () => {
        const rect = slider.getBoundingClientRect();

        const move = (ev: MouseEvent) => {
          const x = Math.min(rect.width, Math.max(0, ev.clientX - rect.left));
          const ratio = (x / rect.width) * this.total;

          // Sum before index (left side)
          const leftSum = this.values.slice(0, index).reduce((a, b) => a + b, 0);
          const rightSum = this.values.slice(index + 2).reduce((a, b) => a + b, 0);

          // ratio = leftSum + newValue(index)
          let newLeftValue = ratio - leftSum;
          newLeftValue = Math.max(
            0,
            Math.min(newLeftValue, this.values[index] + this.values[index + 1])
          );

          this.values[index] = newLeftValue;
          this.values[index + 1] = this.total - leftSum - rightSum - newLeftValue;

          this.render();
        };

        const up = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      };
    });
  }
}

registerWebComponent("multi-slider", MultiSlider);
