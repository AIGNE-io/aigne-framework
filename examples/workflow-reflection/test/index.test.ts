import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the workflow-reflection", () => {
  const result = runExampleTest("Write a function to find the sum of all even numbers in a list.");
  expect(result.status).toBe(0);
});
