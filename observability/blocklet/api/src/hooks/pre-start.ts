import "@blocklet/sdk/lib/error-handler";
import * as path from "node:path";
import { migrate } from "@aigne/observability-api/migrate";
import { initDatabase } from "@aigne/sqlite";
import dotenv from "dotenv-flow";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

(async () => {
  try {
    const dbUrl = path.join(process.env.BLOCKLET_DATA_DIR || "", "observer.db");
    const db = await initDatabase({ url: dbUrl });
    await migrate(db);
    process.exit(0);
  } catch (err) {
    console.error("pre-start error", err);
    process.exit(1);
  }
})();
