import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { JwtPayload } from "../../modules/auth/auth.types";

export function createJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
