import { quickTimeReporturl } from "../quickTimeReport/quickTimeReporturl";
import { PageLayout } from "../quickTimeReport/PageLayout";

export default function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      description="Track your time and view reports"
    >
      <div
        hx-get={quickTimeReporturl({
          query: {
            date: new Date().toISOString().split("T")[0],
          },
        })}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
