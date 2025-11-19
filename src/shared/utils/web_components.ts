import type * as htmx from "htmx.org";
type HtmxInstance = typeof htmx.default;

export function registerWebComponent(name: string, componentClass: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, componentClass);
  }
}
interface WindowWithHtmx extends Window {
  htmx?: HtmxInstance;
}

export function processHtmxInShadow(root: HTMLElement) {
  if (typeof window !== "undefined") {
    const win = window as WindowWithHtmx;
    if (win.htmx) {
      win.htmx.process(root);
    }
  }
}
