import { html } from "../../utils/html";

export interface TimeSummaryProps {
  date?: string;
  hxGet?: string;
  hxTrigger?: string;
}

export function renderTimeSummary(props: TimeSummaryProps = {}): string {
  const date = props.date || "";
  const hxGet = props.hxGet || "";
  const hxTrigger = props.hxTrigger || "load";

  // Build the URL with date parameter if provided
  const url = hxGet
    ? hxGet.includes("?")
      ? `${hxGet}&date=${date}`
      : `${hxGet}?date=${date}`
    : "";

  // Determine the trigger attribute
  let triggerAttr = "";
  if (hxGet && hxTrigger) {
    if (hxTrigger.includes("entries-changed")) {
      triggerAttr = `hx-trigger="entries-changed from:body"`;
    } else {
      triggerAttr = `hx-trigger="${hxTrigger}"`;
    }
  }

  return html`
    <div
      id="summary-content"
      class="block w-full max-w-full box-border min-h-[60px]"
      ${url ? `hx-get="${url}"` : ""}
      ${url ? `hx-target="this"` : ""}
      ${url ? `hx-swap="innerHTML"` : ""}
      ${triggerAttr}
    >
      <div class="text-gray-500 dark:text-gray-400 text-center py-5">Loading...</div>
    </div>
  `;
}
