/**
 * Basic example of using AFS Explorer
 *
 * This example demonstrates how to:
 * 1. Create an AFS instance
 * 2. Mount various AFS modules
 * 3. Start the explorer web server
 *
 * Run this example:
 *   cd examples && bun basic.ts
 */

import { join } from "node:path";
import { AFS } from "@aigne/afs";
import { AFSGit } from "@aigne/afs-git";
import { AFSJSON } from "@aigne/afs-json";
import { LocalFS } from "@aigne/afs-local-fs";
import { fileURLToPath } from "bun";
import { startExplorer } from "../src/index.js";

async function main() {
  console.log("Creating AFS instance...");

  // Create AFS instance
  const afs = new AFS();

  // Mount local filesystem module
  console.log("Mounting LocalFS module...");
  afs.mount(
    new LocalFS({
      localPath: "../..",
      name: "workspace",
    }),
  );

  // Mount JSON module (configuration file)
  console.log("Mounting AFSJSON module...");
  afs.mount(
    new AFSJSON({
      name: "config",
      jsonPath: "../../package.json",
    }),
  );

  console.log("Mounting AFSGit module...");
  afs.mount(
    new AFSGit({
      name: "repo",
      repoPath: join(import.meta.dirname, "../../.."),
    }),
  );

  // List all mounted modules
  const modules = await afs.listModules();
  console.log("Mounted modules:");
  for (const module of modules) {
    console.log(`  - ${module.name} (${module.path})`);
  }

  // Start the explorer server
  console.log("\nStarting AFS Explorer...");
  const server = await startExplorer(afs, {
    port: 3000,
    host: "localhost",
    distPath: fileURLToPath(import.meta.resolve("../dist")),
  });

  console.log("\n✅ AFS Explorer is ready!");
  console.log("   Open http://localhost:3000 in your browser");
  console.log("\n   Press Ctrl+C to stop the server");

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\nShutting down...");
    await server.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
