import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the workflow-code-execution",
  () => {
    const result = runExampleTest({
      initialCall: "10! = ?",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
