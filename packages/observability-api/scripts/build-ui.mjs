import path from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../");
const uiPath = path.resolve(root, "observability-ui");
const apiPath = path.resolve(root, "observability-api");

console.log("building ui...");
console.log(`run "cd ${uiPath} && pnpm install && pnpm run build"`);
await $`cd ${uiPath} && pnpm install && pnpm run build`;
console.log("removing dist...");
console.log(`run "rm -rf ${apiPath}/dist"`);
await $`rm -rf ${apiPath}/dist`;
console.log("copying dist...");
console.log("run `cp -r ${uiPath}/dist ${apiPath}/dist`");
await $`cp -r ${uiPath}/dist ${apiPath}/dist`;
console.log("done");
