import { authContract } from "../../features/auth/contract";
import { tsBuildUrl } from "./paths";

export function LogoutButton(): JSX.Element {
  return (
    <form method="POST" action={tsBuildUrl(authContract.logout, {})} class="inline">
      <button
        type="submit"
        class="text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200"
        style="color: var(--text-secondary); letter-spacing: -0.01em;"
        onmouseover="this.style.color='var(--error)'; this.style.backgroundColor='var(--error-light)';"
        onmouseout="this.style.color='var(--text-secondary)'; this.style.backgroundColor='transparent';"
      >
        Logout
      </button>
    </form>
  );
}
