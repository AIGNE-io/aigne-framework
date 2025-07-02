import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * @param {Object} params
 * @param {Array<{path: string, content: string, title: string}>} params.structurePlan
 * @param {string} params.docsDir
 * @returns {Promise<Array<{ path: string, success: boolean, error?: string }>>}
 */
export default async function saveDocs({ structurePlan, docsDir }) {
  const results = [];
  // 1. 保存每个 markdown 文件
  for (const item of structurePlan) {
    try {
      const relPath = item.path.replace(/^\//, "");
      const segments = relPath.split("/");
      const fileName = `${segments.pop()}.md`;
      const dir = join(docsDir, ...segments);
      const filePath = join(dir, fileName);
      await mkdir(dir, { recursive: true });
      await writeFile(filePath, item.content, "utf8");
      results.push({ path: filePath, success: true });
    } catch (err) {
      results.push({ path: item.path, success: false, error: err.message });
    }
  }

  // 2. 生成 _sidebar.md
  try {
    const sidebar = generateSidebar(structurePlan);
    const sidebarPath = join(docsDir, "_sidebar.md");
    await writeFile(sidebarPath, sidebar, "utf8");
    results.push({ path: sidebarPath, success: true });
  } catch (err) {
    results.push({ path: "_sidebar.md", success: false, error: err.message });
  }

  return results;
}

// 生成 sidebar 内容，支持多级嵌套，顺序与 structurePlan 一致
function generateSidebar(structurePlan) {
  // 构建树结构
  const root = {};
  for (const { path, title } of structurePlan) {
    const relPath = path.replace(/^\//, "");
    const segments = relPath.split("/");
    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!node[seg]) node[seg] = { __children: {}, __title: null };
      if (i === segments.length - 1) node[seg].__title = title;
      node = node[seg].__children;
    }
  }
  // 递归生成 sidebar 文本
  function walk(node, parentPath = "", indent = "") {
    let out = "";
    for (const key of Object.keys(node)) {
      const item = node[key];
      const filePath = `${parentPath}/${key}.md`;
      if (item.__title) {
        out += `${indent}* [${item.__title}](${filePath})\n`;
      }
      const children = item.__children;
      if (Object.keys(children).length > 0) {
        out += walk(children, `${parentPath}/${key}`, `${indent}  `);
      }
    }
    return out;
  }
  return walk(root).replace(/\n+$/, "");
}
