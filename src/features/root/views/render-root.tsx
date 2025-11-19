import { tsBuildUrl } from "@/shared/utils/paths";
import { authContract } from "@/features/auth/contract";

export function renderRoot(): JSX.Element {
  const authUrl = tsBuildUrl(authContract.auth, {});
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TimeTrack - Internal Time Reporting Tool</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="/static/styles/output.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-950 text-gray-100 min-h-screen flex items-center justify-center">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 class="text-6xl font-bold mb-6 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            TimeTrack
          </h1>
          <p class="text-xl text-gray-400 mb-16 max-w-xl mx-auto">
            Track time across projects. Get warnings. View reports.
          </p>

          <section class="mb-16">
            <h2 class="text-2xl font-semibold mb-8">How We Solve the Time Tracking Problem</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div class="text-3xl mb-3">📊</div>
                <h3 class="font-semibold mb-2">Track Multiple Projects</h3>
                <p class="text-sm text-gray-400">Log time across all your projects in one place</p>
              </div>
              <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div class="text-3xl mb-3">⚠️</div>
                <h3 class="font-semibold mb-2">Smart Warnings</h3>
                <p class="text-sm text-gray-400">Automatic alerts when hours fall short</p>
              </div>
              <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div class="text-3xl mb-3">📈</div>
                <h3 class="font-semibold mb-2">Better Reports</h3>
                <p class="text-sm text-gray-400">Aggregated insights for managers and admins</p>
              </div>
            </div>
          </section>

          <a
            href={authUrl}
            class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 text-lg"
          >
            Get Started →
          </a>
        </div>
      </body>
    </html>
  );
}
