import fs from "node:fs";
import { writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, "../api");
const outDirs = [path.resolve(__dirname, "../lib/cjs"), path.resolve(__dirname, "../lib/esm")];

function copyJsonFiles(src, rel = "") {
  const fullSrc = path.join(src, rel);
  const entries = fs.readdirSync(fullSrc, { withFileTypes: true });

  for (const entry of entries) {
    const relPath = path.join(rel, entry.name);
    const srcPath = path.join(src, relPath);

    if (entry.isDirectory()) {
      copyJsonFiles(src, relPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      for (const outDir of outDirs) {
        const destPath = path.join(outDir, relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  }
}

const url =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const dest = path.resolve(__dirname, "../api/server/utils/modelPricesAndContextWindow.json");

https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", async () => {
    await writeFile(dest, data, "utf8");
    console.log("Downloaded to", dest);
    copyJsonFiles(srcDir);
  });
});
