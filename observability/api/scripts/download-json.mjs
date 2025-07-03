import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, "../api");
const outDirs = [path.resolve(__dirname, "../lib/cjs"), path.resolve(__dirname, "../lib/esm")];
const jsonUrl =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const destFile = path.resolve(__dirname, "../api/server/utils/modelPricesAndContextWindow.json");

async function copyJsonFiles(src, rel = "") {
  const fullSrc = path.join(src, rel);
  const entries = await fs.readdir(fullSrc, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = path.join(rel, entry.name);
    const srcPath = path.join(src, relPath);

    if (entry.isDirectory()) {
      await copyJsonFiles(src, relPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      for (const outDir of outDirs) {
        const destPath = path.join(outDir, relPath);
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  }
}

async function downloadJson(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const data = await res.text();
  await fs.writeFile(destPath, data, "utf8");
  console.log("Downloaded to", destPath);
}

async function main() {
  await downloadJson(jsonUrl, destFile);
  await copyJsonFiles(srcDir);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
