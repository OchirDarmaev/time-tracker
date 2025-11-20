import { authContract } from "../../features/auth/contract";
import { tsBuildUrl } from "./paths";

export function LogoutButton(): JSX.Element {
  return (
    <form method="POST" action={tsBuildUrl(authContract.logout, {})} class="inline">
      <button
        type="submit"
        class="text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        Logout
      </button>
    </form>
  );
}
