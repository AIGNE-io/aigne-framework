import assert from "node:assert";
import test from "node:test";
import evaluateJs from "./sandbox.js";

test("evaluateJs should execute script correctly", async () => {
  assert.deepEqual(await evaluateJs({ jsCode: "1 + 2" }), { result: 3 });
});
