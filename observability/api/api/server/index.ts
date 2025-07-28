import type { Server } from "node:http";
import type express from "express";

import { type StartServerOptions, startServer } from "./base.js";

export async function startObservabilityBlockletServer(
  options: StartServerOptions,
): Promise<{ app: express.Express; server: Server }> {
  const { app, server } = await startServer(options);
  return { app, server };
}
