import { test } from "bun:test";

test("should successfully execute the mcp-puppeteer", () => import("./index.js"), {
  timeout: 100000,
});
