import { client } from "../../../lib/client";
import { CurrentUser, RoleOption, UserOption } from "../types";

export default function AuthPage({
  currentUser,
  userOptions,
  roleOptions,
  currentUserRoleLabel,
}: {
  currentUser: CurrentUser;
  userOptions: UserOption[];
  roleOptions: RoleOption[];
  currentUserRoleLabel: string;
}) {
  return (
    <div class="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
      <div class="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-lg border border-gray-800 bg-gray-900 p-8 shadow-xl">
          <h1 class="mb-2 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-center text-3xl font-bold text-transparent">
            Select User
          </h1>
          <p class="mb-8 text-center text-sm text-gray-400">
            POC: Choose a user to continue
          </p>

          <div class="space-y-6">
            <form
              hx-post={client.auth.stubLogin.$url().pathname}
              hx-target="body"
              hx-push-url="true"
            >
              <div>
                <label
                  for="userId"
                  class="mb-2 block text-sm font-medium text-gray-300"
                >
                  User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={currentUser.id}
                  class="w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                >
                  {userOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  for="role"
                  class="mb-2 block text-sm font-medium text-gray-300"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={currentUser.role}
                  class="w-full cursor-pointer rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="hidden"
                name="redirectUrl"
                value={client.dashboard.$url().pathname}
              />
              <div class="pt-4">
                <button
                  type="submit"
                  class="block w-full rounded-lg bg-indigo-600 px-6 py-3 text-center font-semibold text-white transition-colors duration-200 hover:bg-indigo-700"
                >
                  Continue to Dashboard →
                </button>
              </div>
            </form>
          </div>

          {currentUser.email ? (
            <div class="mt-6 border-t border-gray-800 pt-6">
              <p class="text-center text-xs text-gray-500">
                Current:{" "}
                <span safe class="text-gray-400">
                  {currentUser.email}
                </span>
                {currentUser.role ? (
                  <span safe class="text-gray-500">
                    {` as ${currentUserRoleLabel}`}
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
}
