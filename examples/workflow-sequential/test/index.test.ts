import { expect, test } from "bun:test";
import { runExampleTest } from "../../test-utils/index.js";

test("should successfully execute the workflow-sequential", () => {
  const result = runExampleTest("AIGNE is a No-code Generative AI Apps Engine");
  expect(result.status).toBe(0);
});
