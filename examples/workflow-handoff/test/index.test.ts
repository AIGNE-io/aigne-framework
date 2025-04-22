import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the workflow-handoff",
  () => {
    const result = runExampleTest({
      initialCall: "I want a refund",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
