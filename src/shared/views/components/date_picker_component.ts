import { html } from "../../utils/html";

export interface DatePickerProps {
  value?: string;
  hxGet?: string;
  hxTarget?: string;
  hxTrigger?: string;
  label?: string;
}

export function renderDatePicker(props: DatePickerProps = {}): string {
  const value = props.value || "";
  const hxGet = props.hxGet || "";
  const hxTarget = props.hxTarget || "body";
  const hxTrigger = props.hxTrigger || "change";
  const label = props.label || "Date";

  const labelHtml = label
    ? html`<label
        for="date-picker"
        class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400"
        >${label}</label
      >`
    : "";

  return html`
    <div class="mb-0 w-full max-w-full box-border">
      ${labelHtml}
      <input
        type="date"
        id="date-picker"
        class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
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
