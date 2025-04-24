import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/run-example-test.js";

test(
  "should successfully run the chatbot",
  () => {
    const { status } = runExampleTest();
    expect(status).toBe(0);
  },
  { timeout: 60000 },
);
