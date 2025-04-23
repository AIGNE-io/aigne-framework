import { test } from "bun:test";

test("should successfully execute the workflow-handoff", () => import("./index.js"), {
  timeout: 60000,
});
