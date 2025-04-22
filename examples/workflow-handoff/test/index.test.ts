import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the workflow-handoff", () => {
  const result = runExampleTest("I want a refund");
  expect(result.status).toBe(0);
});
