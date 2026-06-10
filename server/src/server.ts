import { app } from "./app";
import { env } from "./config/env";
import { checkPostgresConnection } from "./shared/db/postgres";

async function bootstrap(): Promise<void> {
  await checkPostgresConnection();

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
