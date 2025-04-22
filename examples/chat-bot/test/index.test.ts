import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the chatbot",
  () => {
    const result = runExampleTest({
      initialCall: "Show your main function by performing a basic task you're designed for.",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
