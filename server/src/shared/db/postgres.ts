import { Pool } from "pg";
import { env } from "../../config/env";

export const postgres = new Pool({ connectionString: env.databaseUrl });

export async function checkPostgresConnection(): Promise<void> {
  await postgres.query("SELECT 1");
}
