import startServer from "./src/index.js";

import("vite-plugin-blocklet").then(async ({ setupClient }) => {
  const { app, server } = await startServer();
  setupClient(app, { server });
});
