import { test } from "bun:test";

test("should successfully execute the mcp-sqlite", () => import("./index.js"), { timeout: 100000 });
