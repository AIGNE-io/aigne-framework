#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { platform } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const releaseManifestPath = join(root, ".release-please-manifest.json");

const releaseManifest = await readFile(releaseManifestPath, "utf-8").then(JSON.parse);

for (const pkg of Object.keys(releaseManifest)) {
  const pkgRoot = join(root, pkg);

  const currentVersion = await readFile(join(pkgRoot, "package.json"), "utf-8")
    .then(JSON.parse)
    .then((data) => data.version);

  if (!/alpha|beta|rc|pre/.test(currentVersion)) continue;

  spawnSync("npm", ["version", "--no-git-tag-version", "--no-commit-hooks", "release"], {
    cwd: pkgRoot,
    shell: platform() === "win32",
    stdio: "ignore",
  });

  const newVersion = await readFile(join(pkgRoot, "package.json"), "utf-8")
    .then(JSON.parse)
    .then((data) => data.version);

  console.log(`Bump ${pkg} version from ${currentVersion} to ${newVersion}`);

  const blockletYml = join(pkgRoot, "blocklet.yml");
  if (existsSync(blockletYml)) {
    await readFile(blockletYml, "utf-8")
      .then((data) => data.replace(/version: .*/, `version: ${newVersion}`))
      .then((data) => writeFile(blockletYml, data));
  }

  releaseManifest[pkg] = newVersion;
}

await writeFile(releaseManifestPath, `${JSON.stringify(releaseManifest, null, 2)}\n`);
