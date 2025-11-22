import { client } from "../../lib/client";

export type UserRole = "account" | "office-manager" | "admin";

const roleLabels: Record<UserRole, string> = {
  account: "Account",
  "office-manager": "Office Manager",
  admin: "Admin",
} as const;

const setUserUrl = "/auth/set-user";
const setRoleUrl = "/auth/set-role";
const userOptions = [
  { value: "1", label: "User 1" },
  { value: "2", label: "User 2" },
  { value: "3", label: "User 3" },
];
const roleOptions = [
  { value: "account", label: "Account" },
  { value: "office-manager", label: "Office Manager" },
  { value: "admin", label: "Admin" },
];
const currentUser = {
  id: "1",
  email: "test@example.com",
  role: "account",
} satisfies { id: string; email: string; role: UserRole };

export const AuthPage = () => (
  <div class="bg-gray-950 text-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-gray-900 rounded-lg p-8 border border-gray-800 shadow-xl">
        <h1 class="text-3xl font-bold mb-2 text-center bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Select User
        </h1>
        <p class="text-sm text-gray-400 text-center mb-8">
          POC: Choose a user to continue
        </p>

        <div class="space-y-6">
          <form method="post" action={setUserUrl}>
            <div>
              <label
                for="user_id"
                class="block text-sm font-medium mb-2 text-gray-300"
              >
                User
              </label>
              <select
                id="user_id"
                name="user_id"
                value={currentUser.id}
                onchange="this.form.submit()"
                class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {userOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <form method="post" action={setRoleUrl}>
            <div>
              <label
                for="role"
                class="block text-sm font-medium mb-2 text-gray-300"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div class="pt-4">
            <a
              href={client.index.$url().pathname}
              hx-target="body"
              hx-push-url="true"
              class="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-center"
            >
              Continue to Dashboard →
            </a>
          </div>
        </div>

        {currentUser.email ? (
          <div class="mt-6 pt-6 border-t border-gray-800">
            <p class="text-xs text-gray-500 text-center">
              Current:{" "}
              <span safe class="text-gray-400">
                {currentUser.email}
              </span>
              {currentUser.role ? (
                <span safe class="text-gray-500">
                  {` as ${roleLabels[currentUser.role]}`}
                </span>
              ) : (
                ""
              )}
            </p>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  </div>
);
