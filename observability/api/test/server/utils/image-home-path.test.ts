import { beforeEach, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import dayjs from "@abtnode/util/lib/dayjs";
import getAIGNEHomePath from "../../../api/server/utils/image-home-path.js";

const observerDir = join(homedir(), ".aigne", "observability");

beforeEach(() => {
  if (existsSync(observerDir)) {
    rmSync(observerDir, { recursive: true, force: true });
  }
});

test("should create the observability directory structure if not exists", () => {
  const result = getAIGNEHomePath();
  const expectedPath = join(
    homedir(),
    ".aigne",
    "observability",
    "images",
    dayjs().format("YYYY-MM-DD"),
  );

  expect(result).toBe(expectedPath);
  expect(existsSync(result)).toBe(true);
  expect(existsSync(join(homedir(), ".aigne"))).toBe(true);
  expect(existsSync(join(homedir(), ".aigne", "observability"))).toBe(true);
  expect(existsSync(join(homedir(), ".aigne", "observability", "images"))).toBe(true);
});

test("should return existing directory path if already exists", () => {
  const firstCall = getAIGNEHomePath();

  const secondCall = getAIGNEHomePath();

  expect(firstCall).toBe(secondCall);
  expect(existsSync(firstCall)).toBe(true);
});

test("should create directory with correct date format", () => {
  const result = getAIGNEHomePath();
  const today = dayjs().format("YYYY-MM-DD");
  const expectedPath = join(homedir(), ".aigne", "observability", "images", today);

  expect(result).toBe(expectedPath);
  expect(result).toContain(today);
});

test("should handle multiple calls without errors", () => {
  const results = Array.from({ length: 5 }, () => getAIGNEHomePath());

  results.forEach((result) => {
    if (result) {
      expect(existsSync(result)).toBe(true);
    }
  });
});
