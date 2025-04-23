import { test } from "bun:test";

test("should successfully execute the workflow-router", () => import("./index.js"), {
  timeout: 60000,
});
