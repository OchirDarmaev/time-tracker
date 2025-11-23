import { PageLayout } from "../../quickTimeReport/PageLayout";

export function CalendarPage() {
  return (
    <PageLayout title="Calendar" description="Manage your calendar">
      <div
        hx-get={`/partials/calendarManagement`}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
