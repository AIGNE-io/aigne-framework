import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the chatbot", () => {
  const result = runExampleTest("What is the content of https://www.arcblock.io");
  expect(result.status).toBe(0);
});
