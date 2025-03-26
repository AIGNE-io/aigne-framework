import { writeFileSync } from "node:fs";
import { join } from "node:path";

writeFileSync(
  join(import.meta.dirname, "../lib/cjs/package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2),
);
writeFileSync(
  join(import.meta.dirname, "../lib/esm/package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);
