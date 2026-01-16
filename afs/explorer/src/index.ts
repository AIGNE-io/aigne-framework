import type { AFS } from "@aigne/afs";
import { ExplorerServer, type ExplorerServerOptions } from "./server.js";

export { ExplorerServer, type ExplorerServerOptions };

/**
 * Start the AFS Explorer web server
 * @param afs - The AFS instance to explore
 * @param options - Server options
 * @returns The ExplorerServer instance
 */
export async function startExplorer(
  afs: AFS,
  options: ExplorerServerOptions = {},
): Promise<ExplorerServer> {
  const server = new ExplorerServer(afs, options);
  await server.start();
  return server;
}
