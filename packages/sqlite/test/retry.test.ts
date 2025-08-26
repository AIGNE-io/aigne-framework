import { expect, spyOn, test } from "bun:test";
import { withRetry } from "../src/retry.js";

test("withRetry should retry on SQLITE_BUSY error", async () => {
  const db = {
    run: async (_sql: string) => {
      return { data: [] };
    },
  };

  const runSpy = spyOn(db, "run");

  runSpy
    .mockRejectedValueOnce(new Error("SQLITE_BUSY: database is locked"))
    .mockResolvedValueOnce({ data: [] });

  const result = await withRetry(db).run("INSERT INTO test (value) VALUES (1)");

  expect(result).toEqual({ data: [] });
  expect(runSpy).toHaveBeenCalledTimes(2);
});

test("withRetry should retry on SQLITE_BUSY error", async () => {
  const db = {
    run: async (_sql: string) => {
      return { data: [] };
    },
  };

  const runSpy = spyOn(db, "run");

  runSpy
    .mockRejectedValueOnce(new Error("SQLITE_BUSY: database is locked"))
    .mockRejectedValueOnce(new Error("SQLITE_BUSY: database is locked"))
    .mockResolvedValueOnce({ data: [] });

  const result = withRetry(db, { max: 2 }).run("INSERT INTO test (value) VALUES (1)");

  expect(result).rejects.toThrow("SQLITE_BUSY: database is locked");
  expect(runSpy).toHaveBeenCalledTimes(2);
});
