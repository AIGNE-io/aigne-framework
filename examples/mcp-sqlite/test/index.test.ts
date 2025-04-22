import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the mcp-sqlite", () => {
  const result = runExampleTest("");
  expect(result.status).toBe(0);
});
