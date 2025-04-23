import { test } from "bun:test";

test("should successfully execute the workflow-concurrency", () => import("./index.js"), {
  timeout: 60000,
});
