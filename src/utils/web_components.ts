// Web components registry and utilities

interface HtmxInstance {
  process: (element: ShadowRoot | HTMLElement) => void;
  trigger: (target: string | HTMLElement, event: string) => void;
  ajax: (
    method: string,
    url: string,
    options: { target: HTMLElement | null; swap: string }
  ) => void;
}

interface WindowWithHtmx extends Window {
  htmx?: HtmxInstance;
}

export function registerWebComponent(name: string, componentClass: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, componentClass);
  }
}

// Helper to process HTMX in shadow DOM
export function processHtmxInShadow(root: ShadowRoot | HTMLElement) {
  if (typeof window !== "undefined") {
    const win = window as WindowWithHtmx;
    if (win.htmx) {
      win.htmx.process(root);
    }
  }
}

// Helper to get HTMX instance
export function getHtmx(): HtmxInstance | null {
  if (typeof window !== "undefined") {
    const win = window as WindowWithHtmx;
    return win.htmx || null;
  }
  return null;
}
