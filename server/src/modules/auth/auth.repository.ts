import { postgres } from "../../shared/db/postgres";
import type { RegisterPayload, UserRecord } from "./auth.types";

export class AuthRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await postgres.query<UserRecord>(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    return result.rows[0] ?? null;
  }

  async createUser(payload: RegisterPayload, passwordHash: string): Promise<UserRecord> {
    const result = await postgres.query<UserRecord>(
      `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [payload.email, passwordHash, payload.fullName, payload.role ?? "staff"],
    );

    return result.rows[0];
  }
}
