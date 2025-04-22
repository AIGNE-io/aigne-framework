import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the workflow-sequential",
  () => {
    const result = runExampleTest({
      initialCall: "AIGNE is a No-code Generative AI Apps Engine",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
