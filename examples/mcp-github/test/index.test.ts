import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the mcp-github",
  () => {
    const result = runExampleTest({
      initialCall: "Search for repositories related to 'aigne-framework'",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 60000 },
);
