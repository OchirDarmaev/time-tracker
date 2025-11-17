import { Request, Response, NextFunction } from "express";
import { userModel, UserRole } from "@/shared/models/user.js";

export interface AuthContext extends Request {
  currentUser: {
    id: number;
    email: string;
    role: UserRole;
    roles: UserRole[];
  };
}

export function authStubMiddleware(req: Request, res: Response, next: NextFunction) {
  const selectedUserId = req.session?.userId as number | undefined;
  const selectedRole = req.session?.userRole as UserRole | undefined;

  if (selectedUserId && selectedRole) {
    const user = userModel.getById(selectedUserId);
    if (user && user.roles.includes(selectedRole)) {
      (req as unknown as AuthContext).currentUser = {
        id: user.id,
        email: user.email,
        role: selectedRole,
        roles: user.roles,
      };
    }
  }

  // Default to first account if no user selected
  if (!(req as unknown as AuthContext).currentUser) {
    const accounts = userModel.getAccounts();
    if (accounts.length > 0) {
      const account = accounts[0];
      (req as unknown as AuthContext).currentUser = {
        id: account.id,
        email: account.email,
        role: account.roles[0] || "account",
        roles: account.roles,
      };
    }
  }

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthContext, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).send("Unauthorized");
    }
    // Check if user has any of the required roles
    const hasRequiredRole = roles.some((role) => req.currentUser!.roles.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).send("Forbidden");
    }
    next();
  };
}
