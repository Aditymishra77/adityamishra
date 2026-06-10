import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../../modules/auth/auth.types";

export function requireRoles(...roles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const role = request.user?.role;

    if (!role || !roles.includes(role)) {
      response.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}
