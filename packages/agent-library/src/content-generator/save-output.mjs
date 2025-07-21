import { promises as fs } from "node:fs";
import { join } from "node:path";

export default async function saveOutput({ savePath, fileName, saveKey, ...rest }) {
  console.log("saveOutput", savePath, fileName, saveKey, rest);
  if (!(saveKey in rest)) {
    console.warn(`saveKey "${saveKey}" not found in input, skip saving.`);
    return {
      saveOutputStatus: false,
      saveOutputPath: null,
    };
  }

  const value = rest[saveKey];
  const content =
    typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value);
  await fs.mkdir(savePath, { recursive: true });
  const filePath = join(savePath, fileName);
  await fs.writeFile(filePath, content, "utf8");

  return {
    saveOutputStatus: true,
    saveOutputPath: filePath,
  };
}
