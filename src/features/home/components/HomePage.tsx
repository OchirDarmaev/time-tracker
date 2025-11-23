import { client } from "../../../lib/client";

export default function HomePage() {
  return (
    <div class="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
      <div class="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 class="mb-6 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-6xl font-bold text-transparent">
          TimeTrack
        </h1>
        <p class="mx-auto mb-16 max-w-xl text-xl text-gray-400">
          Track time across projects. Get warnings. View reports.
        </p>

        <section class="mb-16">
          <h2 class="mb-8 text-2xl font-semibold">
            How We Solve the Time Tracking Problem
          </h2>
          <div class="grid gap-6 md:grid-cols-3">
            <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <div class="mb-3 text-3xl">📊</div>
              <h3 class="mb-2 font-semibold">Track Multiple Projects</h3>
              <p class="text-sm text-gray-400">
                Log time across all your projects in one place
              </p>
            </div>
            <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <div class="mb-3 text-3xl">⚠️</div>
              <h3 class="mb-2 font-semibold">Smart Warnings</h3>
              <p class="text-sm text-gray-400">
                Automatic alerts when hours fall short
              </p>
            </div>
            <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
              <div class="mb-3 text-3xl">📈</div>
              <h3 class="mb-2 font-semibold">Better Reports</h3>
              <p class="text-sm text-gray-400">
                Aggregated insights for managers and admins
              </p>
            </div>
          </div>
        </section>

        <div hx-boost="true" hx-push-url="true">
          <a
            href={client.auth.$url().pathname}
            class="inline-block rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-indigo-700"
          >
            Get Started →
          </a>
        </div>
      </div>
    </div>
  );
}
