import { client } from "../../../lib/client";
import { CurrentUser, RoleOption, UserOption } from "../types";

export const AuthPage = ({
  currentUser,
  userOptions,
  roleOptions,
  currentUserRoleLabel,
}: {
  currentUser: CurrentUser;
  userOptions: UserOption[];
  roleOptions: RoleOption[];
  currentUserRoleLabel: string;
}) => {
  
  return (
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
            <form
              hx-post={client.auth.stubLogin.$url().pathname}
              hx-target="body"
              hx-push-url="true"
            >
              <div>
                <label
                  for="userId"
                  class="block text-sm font-medium mb-2 text-gray-300"
                >
                  User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={currentUser.id}
                  class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
                  class="block text-sm font-medium mb-2 text-gray-300"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={currentUser.role}
                  class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
                  class="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-center"
                >
                  Continue to Dashboard →
                </button>
              </div>
            </form>
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
};
