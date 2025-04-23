import { test } from "bun:test";

test("should successfully execute the workflow-sequential", () => import("./index.js"), {
  timeout: 60000,
});
