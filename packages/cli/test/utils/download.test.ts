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

test("downloadPackage should raise error with custom message", async () => {
  const url = "https://www.aigne.io/projects/xxx/test-package.tgz";
  const dir = join(tmpdir(), randomUUID());
  await mkdir(dir, { recursive: true });

  try {
    spyOn(globalThis, "fetch").mockReturnValueOnce(Promise.reject(new Error("Network error")));

    expect(downloadAndExtract(url, dir)).rejects.toThrow(
      "Failed to download package from https://www.aigne.io/projects/xxx/test-package.tgz: Network error",
    );

    spyOn(globalThis, "fetch").mockReturnValueOnce(
      Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" })),
    );

    expect(downloadAndExtract(url, dir)).rejects.toThrow(
      "Failed to download package from https://www.aigne.io/projects/xxx/test-package.tgz: Not Found",
    );

    spyOn(globalThis, "fetch").mockReturnValueOnce(Promise.resolve(new Response(null)));

    expect(downloadAndExtract(url, dir)).rejects.toThrow(
      "Failed to download package from https://www.aigne.io/projects/xxx/test-package.tgz: Unexpected to get empty response",
    );

    spyOn(globalThis, "fetch").mockReturnValueOnce(
      Promise.resolve(new Response("invalid tgz file content")),
    );

    expect(downloadAndExtract(url, dir)).rejects.toThrow(
      "Failed to extract package from https://www.aigne.io/projects/xxx/test-package.tgz: TAR_BAD_ARCHIVE: Unrecognized archive format",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
