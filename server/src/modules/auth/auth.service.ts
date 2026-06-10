import bcrypt from "bcryptjs";
import { AuthRepository } from "./auth.repository";
import type { LoginPayload, RegisterPayload, UserRole } from "./auth.types";
import { createJwt } from "../../shared/utils/jwt";

const allowedRoles: UserRole[] = ["admin", "manager", "staff"];

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async register(payload: RegisterPayload): Promise<{ token: string }> {
    if (payload.role && !allowedRoles.includes(payload.role)) {
      throw new Error("Invalid role.");
    }

    const existing = await this.repository.findByEmail(payload.email);

    if (existing) {
      throw new Error("Email is already in use.");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await this.repository.createUser(payload, passwordHash);

    return {
      token: createJwt({ sub: user.id, email: user.email, role: user.role }),
    };
  }

  async login(payload: LoginPayload): Promise<{ token: string }> {
    const user = await this.repository.findByEmail(payload.email);

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const valid = await bcrypt.compare(payload.password, user.password_hash);

    if (!valid) {
      throw new Error("Invalid credentials.");
    }

    return {
      token: createJwt({ sub: user.id, email: user.email, role: user.role }),
    };
  }
}
