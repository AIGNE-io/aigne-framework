import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export default async function saveSingleDoc({ path, content, docsDir, translates }) {
  const results = [];
  try {
    const relPath = path.replace(/^\//, "");
    const segments = relPath.split("/");
    const fileName = segments.pop();
    const fileFullName = `${fileName}.md`;
    const dir = join(docsDir, ...segments);
    const filePath = join(dir, fileFullName);
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, content, "utf8");
    results.push({ path: filePath, success: true });

    for (const translate of translates || []) {
      const translatePath = join(dir, `${fileName}.${translate.language}.md`);
      await writeFile(translatePath, translate.translation, "utf8");
      results.push({ path: translatePath, success: true });
    }
  } catch (err) {
    results.push({ path, success: false, error: err.message });
  }
  return { saveSingleDocResult: results };
}
