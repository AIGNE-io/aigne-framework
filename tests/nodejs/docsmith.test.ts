import { spawnSync } from "node:child_process";
import { expect, test } from "vitest";

test("AIGNE DocSmith should work", async () => {
  const { status, stdout, stderr } = spawnSync("aigne", ["doc", "--version"], {
    encoding: "utf8",
    stdio: "pipe",
    shell: true,
  });

  if (stderr) console.error(stderr);

  expect({ status, stdout }).toEqual({
    status: 0,
    stdout: expect.stringMatching(/\d+\.\d+\.\d+/),
  });
}, 120e3);
