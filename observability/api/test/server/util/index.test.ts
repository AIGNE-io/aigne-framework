import { beforeEach, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import * as utils from "../../../api/server/utils/index.js";

const observerDir = join(homedir(), ".aigne", "observability");
const dbFilePath = resolve(observerDir, "mock-setting.yaml");

beforeEach(() => {
  rmSync(dbFilePath, { recursive: true, force: true });
});

test("should create the observability directory if not exists and return correct setting file path", () => {
  const dbUrl = utils.getGlobalSettingPath("mock-setting.yaml");
  expect(dbUrl).toBe(dbFilePath);
});
