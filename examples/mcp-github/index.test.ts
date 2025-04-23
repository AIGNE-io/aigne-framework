import { test } from "bun:test";

test("should successfully execute the mcp-github", () => import("./index.js"), { timeout: 60000 });
