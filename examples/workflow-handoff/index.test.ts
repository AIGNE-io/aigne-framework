import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/run-example-test.js";

test("should successfully run the workflow-handoff", () => {
  const { output, status } = runExampleTest();
  console.log(output.toString());
  expect(status).toBe(0);
});
