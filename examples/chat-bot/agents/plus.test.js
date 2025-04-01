import assert from "node:assert";
import test from "node:test";
import plus from "./plus.js";

test("plus should return the sum of two numbers", async () => {
  assert.deepEqual(plus({ a: 1, b: 2 }), { sum: 3 });
});
