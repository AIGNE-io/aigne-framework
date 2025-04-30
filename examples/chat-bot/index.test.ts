import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/run-example-test.js";

test(
  "should successfully run the chatbot",
  async () => {
    const { code, stderr } = await runExampleTest();
    expect(code).toBe(0);
    expect(stderr).not.toContain("FAILED");
  },
  { timeout: 600000 },
);
