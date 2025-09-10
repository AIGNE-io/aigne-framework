import { expect, test } from "bun:test";
import { isUrl } from "@aigne/cli/utils/url";

test("isUrl should work correctly", () => {
  expect(isUrl("http://xxx.xxx.xxx")).toBe(true);
  expect(isUrl("https://xxx.xxx.xxx")).toBe(true);
  expect(isUrl("ftp://xxx.xxx.xxx")).toBe(false);
  expect(isUrl("http://")).toBe(false);
  expect(isUrl("https://")).toBe(false);
});
