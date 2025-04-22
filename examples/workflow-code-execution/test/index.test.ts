import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the workflow-code-execution", () => {
  const result = runExampleTest("10! = ?");
  expect(result.status).toBe(0);
});
