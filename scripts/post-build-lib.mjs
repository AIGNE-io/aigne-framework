import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const cwd = process.cwd();

function writeJson(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(content, null, 2));
}

writeJson(join(cwd, "lib/esm/package.json"), { type: "module" });
writeJson(join(cwd, "lib/cjs/package.json"), { type: "commonjs" });
