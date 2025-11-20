import { AuthContext } from "./auth_stub";

export function isAuthContext(
  req: { headers?: Record<string, string | string[] | undefined> } & AuthContext
): req is AuthContext {
  return (req as unknown as AuthContext | undefined)?.currentUser !== undefined;
}
