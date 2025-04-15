import { expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { downloadAndExtract } from "@aigne/cli/utils/download.js";
import { mockAIGNEPackage } from "../_mocks_/mock-aigne-package.js";

test("downloadPackage should work", async () => {
  const url = "https://www.aigne.io/projects/xxx/test-package.tgz";
  const dir = join(tmpdir(), randomUUID());
  await mkdir(dir, { recursive: true });

  try {
    spyOn(globalThis, "fetch").mockReturnValueOnce(
      Promise.resolve(new Response(await mockAIGNEPackage())),
    );

    await downloadAndExtract(url, dir);

    expect((await stat(join(dir, "aigne.yaml"))).isFile()).toBeTrue();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
