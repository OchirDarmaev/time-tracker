import { quickTimeReporturl } from "../../quickTimeReport/quickTimeReporturl";

export default function DashboardPage() {
  return (
    <div class="mb-8">
      <h1 class="mb-2 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
        Dashboard
      </h1>
      <p class="text-gray-400">Track your time and view reports</p>
      <div
        hx-get={quickTimeReporturl({
          query: {
            date: new Date().toISOString().split("T")[0],
          },
        })}
        hx-swap="outerHTML"
        hx-trigger="load" />
    </div>
  );
}
