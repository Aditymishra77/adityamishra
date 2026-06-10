import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

export function authMiddleware(request: Request, response: Response, next: NextFunction): void {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authorization.replace("Bearer ", "");

  try {
    request.user = verifyJwt(token);
    next();
  } catch {
    response.status(401).json({ message: "Invalid token" });
  }
}
