import { app, server } from "./src/index.js";

import("vite-plugin-blocklet").then(({ setupClient }) => {
  setupClient(app, {
    server,
  });
});
