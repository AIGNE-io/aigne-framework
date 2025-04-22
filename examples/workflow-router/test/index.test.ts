import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the workflow-router",
  () => {
    const result = runExampleTest({
      initialCall: "How do I use this product?",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
