import { AuthContext } from "../middleware/auth_stub";
import { NavButtons } from "./layout";


export function NavBar(req: AuthContext, activeNav: string = ""): JSX.Element {
  const currentUser = req.currentUser || { email: "Unknown", role: "account", roles: ["account"] };
  const availableRoles: string[] = currentUser.roles || ["account"];

  return (
    <div class="flex items-center gap-1">
      <NavButtons availableRoles={availableRoles} activeNav={activeNav} />
    </div>
  );
}
