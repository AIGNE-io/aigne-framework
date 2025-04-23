import { test } from "bun:test";

test("should successfully execute the workflow-code-execution", () => import("./index.js"), {
  timeout: 60000,
});
