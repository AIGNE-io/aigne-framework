import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the workflow-router", () => {
  const result = runExampleTest("How do I use this product?");
  expect(result.status).toBe(0);
});
