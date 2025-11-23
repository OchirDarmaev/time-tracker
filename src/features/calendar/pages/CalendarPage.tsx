import { client } from "../../../lib/client";
import { buildUrl } from "../../../lib/url";
import { PageLayout } from "../../quickTimeReport/PageLayout";

export function CalendarPage() {
  const calendarManagementUrl = buildUrl(client.partials.calendarManagement);
  return (
    <PageLayout title="Calendar" description="Manage your calendar">
      <div
        hx-get={calendarManagementUrl}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
