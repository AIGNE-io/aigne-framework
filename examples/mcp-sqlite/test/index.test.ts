import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the mcp-sqlite",
  () => {
    const result = runExampleTest({
      initialCall: "View available database tables",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 100000 },
);
