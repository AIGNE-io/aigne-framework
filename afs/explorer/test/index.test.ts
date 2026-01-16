import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFS } from "@aigne/afs";
import { ExplorerServer, startExplorer } from "../src/index.js";

let testDir: string;
let afs: AFS;
let server: ExplorerServer;

beforeAll(async () => {
  // Create a temporary test directory
  testDir = join(tmpdir(), `afs-explorer-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });

  // Create some test files
  await writeFile(join(testDir, "test.txt"), "Hello World");
  await writeFile(join(testDir, "test.json"), JSON.stringify({ key: "value" }));

  // Create AFS instance
  afs = new AFS();
});

afterAll(async () => {
  // Clean up
  if (server) {
    await server.stop();
  }
  await rm(testDir, { recursive: true, force: true });
});

test("ExplorerServer can be instantiated", () => {
  const srv = new ExplorerServer(afs, { port: 3001 });
  expect(srv).toBeDefined();
});

test("startExplorer returns ExplorerServer instance", async () => {
  server = await startExplorer(afs, { port: 3002 });
  expect(server).toBeInstanceOf(ExplorerServer);
  await server.stop();
});

test("ExplorerServer can start and stop", async () => {
  const srv = new ExplorerServer(afs, { port: 3003 });
  await srv.start();
  expect(srv).toBeDefined();
  await srv.stop();
});
