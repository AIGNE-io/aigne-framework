import { expect, test } from "vitest";
import { spawnAsync } from "./utils.js";

test("AIGNE DocSmith should work", async () => {
  const { status, stdout, stderr } = await spawnAsync("aigne", ["doc", "--version"], {
    shell: true,
  });

  if (stderr) console.error(stderr);

  expect({ status, stdout }).toEqual({
    status: 0,
    stdout: expect.stringMatching(/\d+\.\d+\.\d+/),
  });
}, 600e3);
