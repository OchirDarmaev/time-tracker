import { Request, Response, NextFunction } from "express";
import { userModel, UserRole } from "../models/user.js";

export interface AuthStubRequest extends Request {
  currentUser?: {
    id: number;
    email: string;
    role: UserRole;
    roles: UserRole[];
  };
}

export function authStubMiddleware(req: AuthStubRequest, res: Response, next: NextFunction) {
  const selectedUserId = req.session?.userId as number | undefined;
  const selectedRole = req.session?.userRole as UserRole | undefined;

  if (selectedUserId && selectedRole) {
    const user = userModel.getById(selectedUserId);
    if (user && user.roles.includes(selectedRole)) {
      req.currentUser = {
        id: user.id,
        email: user.email,
        role: selectedRole,
        roles: user.roles,
      };
    }
  }

  // Default to first worker if no user selected
  if (!req.currentUser) {
    const workers = userModel.getWorkers();
    if (workers.length > 0) {
      const worker = workers[0];
      req.currentUser = {
        id: worker.id,
        email: worker.email,
        role: worker.roles[0] || "worker",
        roles: worker.roles,
      };
    }
  }

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthStubRequest, res: Response, next: NextFunction) => {
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
