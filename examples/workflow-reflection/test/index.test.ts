import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the workflow-reflection",
  () => {
    const result = runExampleTest({
      initialCall: "Write a function to find the sum of all even numbers in a list.",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
