import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/run-example-test.js";

test(
  "should successfully run the workflow-sequential",
  () => {
    const { stdout, status } = runExampleTest();
    console.log(stdout.toString());
    expect(status).toBe(0);
  },
  {
    timeout: 60000,
  },
);
