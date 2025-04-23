import { test } from "bun:test";

test("should successfully execute the workflow-reflection", () => import("./index.js"), {
  timeout: 60000,
});
