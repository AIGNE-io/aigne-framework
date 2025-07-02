import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { $ } from "zx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../");
const uiPath = path.resolve(root, "ui");
const apiPath = path.resolve(root, "api");

console.log("building ui...");
console.log(`run "cd ${uiPath} && pnpm install && pnpm run build"`);
await $({ cwd: uiPath })`pnpm install`;
await $({ cwd: uiPath })`pnpm run build`;

console.log("removing dist...");
await fs.remove(path.join(apiPath, "dist"));

console.log("copying dist...");
await fs.copy(path.join(uiPath, "dist"), path.join(apiPath, "dist"));

console.log("done");
