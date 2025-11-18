import { authContract } from "../../features/auth/contract";
import { tsBuildUrl } from "./paths";

export function LogoutButton(): JSX.Element {
  return (
    <form method="POST" action={tsBuildUrl(authContract.logout, {})} class="inline">
      <button
        type="submit"
        class="text-gray-600 dark:text-gray-400 text-sm font-medium px-3 py-2 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Logout
      </button>
    </form>
  );
}
