import { client } from "../../../lib/client";
import { toUrlString } from "../../../lib/url";
import { PageLayout } from "../../quickTimeReport/PageLayout";

export default function ReportsPage() {
  const timeTrackingReportUrl = client.partials.timeTrackingReport.$url();
  return (
    <PageLayout title="Reports" description="View your time tracking reports">
      <div
        hx-get={toUrlString(timeTrackingReportUrl)}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
