import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.resolve(__dirname, "../");
const uiDistPath = path.resolve(apiPath, "node_modules/@aigne/observability-ui/dist");
const targetDistPath = path.join(apiPath, "dist");

console.log("removing old dist...");
await fs.remove(targetDistPath);

console.log("copying dist from @aigne/observability-ui...");
await fs.copy(uiDistPath, targetDistPath);

console.log("done");
