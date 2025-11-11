import { expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, beforeEach } from "node:test";
import { initDatabase } from "@aigne/sqlite";

let tmp: string;

beforeEach(() => {
  tmp = join(tmpdir(), randomUUID());
});

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true });
});

test("initDatabase should create parent directories automatically", async () => {
  const path = join(tmp, "nested", "dir", "test.db");

  await initDatabase({ url: `file:${path}` });

  expect((await stat(path)).isFile()).toBe(true);
});

test("initDatabase should create parent directories automatically (file:// url)", async () => {
  const path = join(tmp, "nested", "dir", "test.db");

  await initDatabase({ url: `file://${path}` });

  expect((await stat(path)).isFile()).toBe(true);
});

test("initDatabase should create parent directories automatically (relative path)", async () => {
  const path = join(tmp, "nested", "dir", "test.db");
  const relativePath = relative(process.cwd(), path);

  await initDatabase({ url: `file:${relativePath}` });

  expect((await stat(path)).isFile()).toBe(true);
});
