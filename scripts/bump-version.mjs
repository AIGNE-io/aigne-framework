#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { platform } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const pkgs = await readFile(join(root, "release-please-config.json"), "utf-8")
  .then(JSON.parse)
  .then((data) => Object.keys(data.packages).filter((i) => i !== "."));

for (const pkg of pkgs) {
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
}
