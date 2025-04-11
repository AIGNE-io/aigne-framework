import { expect, test } from "bun:test";
import { parseDuration } from "@aigne/cli/utils/time";

test("parseDuration should parse duration correctly", async () => {
  expect(parseDuration(1)).toBe("0s");
  expect(parseDuration(5)).toBe("0.01s");
  expect(parseDuration(1000)).toBe("1s");
  expect(parseDuration(900)).toBe("0.9s");
  expect(parseDuration(930)).toBe("0.93s");
});
