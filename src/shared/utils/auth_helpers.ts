import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { UserRole } from "@/shared/models/user.js";

type ErrorResponse = {
  status: 401 | 403;
  body: { body: string };
};

type AuthCheckResult =
  | { success: true; authReq: AuthContext }
  | { success: false; response: ErrorResponse };

/**
 * Validates authentication and authorization for a request.
 * Returns either the authenticated request or an error response.
 */
export function checkAuth<
  T extends { req?: unknown; headers?: Record<string, string | string[] | undefined> },
>(req: T & { req: unknown }, ...requiredRoles: UserRole[]): AuthCheckResult {
  if (!isAuthContext(req.req as AuthContext)) {
    return {
      success: false,
      response: {
        status: 401,
        body: { body: "Unauthorized" },
      },
    };
  }

  const authReq = req.req as unknown as AuthContext;

  if (!authReq.currentUser) {
    return {
      success: false,
      response: {
        status: 401,
        body: { body: "Unauthorized" },
      },
    };
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => authReq.currentUser!.roles.includes(role));

    if (!hasRequiredRole) {
      return {
        success: false,
        response: {
          status: 403,
          body: { body: "Forbidden" },
        },
      };
    }
  }

  return {
    success: true,
    authReq,
  };
}

/**
 * Validates authentication for a request that already has AuthContext.
 * Used when req is already cast to AuthContext.
 */
export function checkAuthFromContext(
  authReq: AuthContext,
  ...requiredRoles: UserRole[]
): ErrorResponse | null {
  if (!authReq.currentUser) {
    return {
      status: 401,
      body: { body: "Unauthorized" },
    };
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => authReq.currentUser!.roles.includes(role));

    if (!hasRequiredRole) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }
  }

  return null;
}
