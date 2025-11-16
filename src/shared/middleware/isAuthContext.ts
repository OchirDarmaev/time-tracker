import { AuthContext } from "./auth_stub";

export function isAuthContext<T>(req: T): req is T & AuthContext {
  return (req as unknown as AuthContext | undefined)?.currentUser !== undefined;
}
