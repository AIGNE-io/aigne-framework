import path from "node:path";
import { startServer } from "./src/server/index.js";

import("vite-plugin-blocklet").then(async ({ setupClient }) => {
  const { app, server } = await startServer({
    dbUrl: "file:dev-observer.db",
    distPath: path.resolve(process.env.BLOCKLET_APP_DIR || "", "dist"),
    port: 3000,
  });

  setupClient(app, { server });
});
