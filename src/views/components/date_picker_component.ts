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

  return html`
    <div class="mb-6 w-full max-w-full box-border">
      <label
        for="date-picker"
        class="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400"
        >${label}</label
      >
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
