import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the chatbot", () => {
  const result = runExampleTest(
    "Show your main function by performing a basic task you're designed for.",
  );
  expect(result.status).toBe(0);
});
