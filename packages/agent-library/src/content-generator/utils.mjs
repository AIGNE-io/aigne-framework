import fs from "node:fs/promises";
import path from "node:path";

export function processContent({ content }) {
  // 匹配 markdown 普通链接 [text](link)，排除图片 ![text](link)
  return content.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
    const trimLink = link.trim();
    // 排除外部链接和 mailto
    if (/^(https?:\/\/|mailto:)/.test(trimLink)) return match;
    // 保留锚点
    const [path, hash] = trimLink.split("#");
    // 已有扩展名则跳过
    if (/\.[a-zA-Z0-9]+$/.test(path)) return match;
    // 只处理相对路径或以 / 开头的路径
    if (!path) return match;
    // 拉平成 ./xxx-yyy.md
    let finalPath = path;
    if (path.startsWith(".")) {
      finalPath = path.replace(/^\./, "");
    }
    let flatPath = finalPath.replace(/^\//, "").replace(/\//g, "-");
    flatPath = `./${flatPath}.md`;
    const newLink = hash ? `${flatPath}#${hash}` : flatPath;
    return `[${text}](${newLink})`;
  });
}

/**
 * 保存单个文档及其翻译内容到文件
 * @param {Object} params
 * @param {string} params.path - 相对路径（不带扩展名）
 * @param {string} params.content - 主文档内容
 * @param {string} params.docsDir - 根目录
 * @param {Array<{language: string, translation: string}>} [params.translates] - 翻译内容
 * @returns {Promise<Array<{ path: string, success: boolean, error?: string }>>}
 */
export async function saveDocWithTranslations({
  path: docPath,
  content,
  docsDir,
  translates = [],
}) {
  const results = [];
  try {
    // 拉平路径：去除前导 /，将所有 / 替换为 -
    const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
    const fileFullName = `${flatName}.md`;
    const filePath = path.join(docsDir, fileFullName);
    await fs.mkdir(docsDir, { recursive: true });
    await fs.writeFile(filePath, processContent({ content }), "utf8");
    results.push({ path: filePath, success: true });

    for (const translate of translates) {
      const translateFileName = `${flatName}.${translate.language}.md`;
      const translatePath = path.join(docsDir, translateFileName);
      await fs.writeFile(translatePath, processContent({ content: translate.translation }), "utf8");
      results.push({ path: translatePath, success: true });
    }
  } catch (err) {
    results.push({ path: docPath, success: false, error: err.message });
  }
  return results;
}
