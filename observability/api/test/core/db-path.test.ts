import { beforeEach, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import getObservabilityDbPath from "../../api/core/db-path.js";

const observerDir = join(homedir(), ".aigne", "observability");
const dbFilePath = resolve(observerDir, "mock-observer.db");

beforeEach(() => {
  rmSync(dbFilePath, { recursive: true, force: true });
});

test("should create the observability directory if not exists and return correct db url", () => {
  const dbUrl = getObservabilityDbPath("mock-observer.db");
  expect(existsSync(observerDir)).toBe(true);

  if (process.platform === "win32") {
    expect(dbUrl).toBe("file:observer.db");
  } else {
    expect(dbUrl).toBe(join("file:", dbFilePath));
  }
});

test("should not throw if directory already exists", () => {
  getObservabilityDbPath("mock-observer.db");
  expect(() => getObservabilityDbPath("mock-observer.db")).not.toThrow();
});
