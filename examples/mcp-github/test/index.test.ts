import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the chatbot", () => {
  const result = runExampleTest("Search for repositories related to 'aigne-framework'");
  expect(result.status).toBe(0);
});
