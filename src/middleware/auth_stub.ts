import { Request, Response, NextFunction } from 'express';
import { userModel, UserRole } from '../models/user.js';

export interface AuthStubRequest extends Request {
  currentUser?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export function authStubMiddleware(req: AuthStubRequest, res: Response, next: NextFunction) {
  const selectedUserId = req.session?.userId as number | undefined;
  const selectedRole = req.session?.userRole as UserRole | undefined;

  if (selectedUserId && selectedRole) {
    const user = userModel.getById(selectedUserId);
    if (user && user.role === selectedRole) {
      req.currentUser = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
  }

  // Default to first worker if no user selected
  if (!req.currentUser) {
    const workers = userModel.getWorkers();
    if (workers.length > 0) {
      req.currentUser = {
        id: workers[0].id,
        email: workers[0].email,
        role: workers[0].role,
      };
    }
  }

  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthStubRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).send('Unauthorized');
    }
    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
}

