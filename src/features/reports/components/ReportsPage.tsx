import { PageLayout } from "../../quickTimeReport/PageLayout";

export default function ReportsPage() {
  return (
    <PageLayout title="Reports" description="View your time tracking reports">
      <div
        hx-get={`/partials/timeTrackingReport`}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
