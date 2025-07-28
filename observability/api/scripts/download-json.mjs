import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonUrl =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const destFile = path.resolve(__dirname, "../dist/model-prices.json");

async function downloadJson(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const data = await res.text();
  await fs.writeFile(destPath, data, "utf8");
  console.log("Downloaded to", destPath);
}

async function main() {
  await downloadJson(jsonUrl, destFile);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
