import { promises as fs } from "fs";
import { join } from "path";

export default async function saveOutput({ outputDir, saveKey, ...rest }) {
  if (!(saveKey in rest)) {
    console.warn(`saveKey "${saveKey}" not found in input, skip saving.`);
    return;
  }
  const value = rest[saveKey];
  let content;
  if (typeof value === "object" && value !== null) {
    content = JSON.stringify(value, null, 2);
  } else {
    content = String(value);
  }
  await fs.mkdir(outputDir, { recursive: true });
  const filePath = join(outputDir, `${saveKey}.txt`);
  await fs.writeFile(filePath, content, "utf8");
}
