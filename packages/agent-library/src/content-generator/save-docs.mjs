import { writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * @param {Object} params
 * @param {Array<{path: string, content: string, title: string}>} params.structurePlan
 * @param {string} params.docsDir
 * @returns {Promise<Array<{ path: string, success: boolean, error?: string }>>}
 */
export default async function saveDocs({ structurePlanResult: structurePlan, docsDir }) {
  const results = [];

  // 生成 _sidebar.md
  try {
    const sidebar = generateSidebar(structurePlan);
    const sidebarPath = join(docsDir, "_sidebar.md");
    await writeFile(sidebarPath, sidebar, "utf8");
    results.push({ path: sidebarPath, success: true });
  } catch (err) {
    results.push({ path: "_sidebar.md", success: false, error: err.message });
  }

  return { saveDocsResult: results };
}

// 生成 sidebar 内容，支持多级嵌套，顺序与 structurePlan 一致
function generateSidebar(structurePlan) {
  // 构建树结构
  const root = {};
  for (const { path, title, parentId } of structurePlan) {
    const relPath = path.replace(/^\//, "");
    const segments = relPath.split("/");
    let node = root;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!node[seg])
        node[seg] = {
          __children: {},
          __title: null,
          __fullPath: segments.slice(0, i + 1).join("/"),
          __parentId: parentId,
        };
      if (i === segments.length - 1) node[seg].__title = title;
      node = node[seg].__children;
    }
  }
  // 递归生成 sidebar 文本，link 路径为拉平后的文件名
  function walk(node, parentSegments = [], indent = "") {
    let out = "";
    for (const key of Object.keys(node)) {
      const item = node[key];
      const fullSegments = [...parentSegments, key];
      const flatFile = fullSegments.join("-") + ".md";
      if (item.__title) {
        const realIndent = item.__parentId === null ? "" : indent;
        out += `${realIndent}* [${item.__title}](/${flatFile})\n`;
      }
      const children = item.__children;
      if (Object.keys(children).length > 0) {
        out += walk(children, fullSegments, `${indent}  `);
      }
    }
    return out;
  }
  return walk(root).replace(/\n+$/, "");
}
