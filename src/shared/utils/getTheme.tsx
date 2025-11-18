import { AuthContext } from "../middleware/auth_stub";
import { Theme } from "./ThemeToggleButton";

export function getTheme(req: AuthContext): Theme {
  if (req.cookies?.theme === "dark") {
    return "dark";
  } else {
    return "light";
  }
}
