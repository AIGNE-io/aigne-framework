import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

// 简单 glob pattern 转正则，仅支持 * 和 **
function globToRegExp(pattern) {
  const regex = pattern.replace(/\./g, "\\.").replace(/\*\*/g, "(.|/)*").replace(/\*/g, "[^/]*");
  return new RegExp(`^${regex}$`);
}

async function walk(dir) {
  let files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

export default async function loadSources({
  sources = [],
  sourcesPath,
  includePatterns = ["*", "**/*"],
}) {
  let files = Array.isArray(sources) ? [...sources] : [];
  if (sourcesPath) {
    const allFiles = await walk(sourcesPath);
    const patterns = Array.isArray(includePatterns) ? includePatterns : [includePatterns];
    const regexps = patterns.map(globToRegExp);
    files = files.concat(
      allFiles.filter((f) => regexps.some((r) => r.test(path.relative(sourcesPath, f)))),
    );
  }
  // 去重
  files = [...new Set(files)];
  const contents = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, "utf8");
      return `// file: ${file}\n${content}`;
    }),
  );
  return {
    datasources: contents.join("\n"),
    sourceFiles: files,
  };
}

loadSources.input_schema = {
  type: "object",
  properties: {
    sources: {
      type: "array",
      items: { type: "string" },
      description: "Array of paths to the sources files",
    },
    sourcesPath: {
      type: "string",
      description: "Directory to recursively read files from",
    },
    includePatterns: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "Glob patterns to filter files in sourcesPath (supports * and **)",
    },
  },
  required: [],
};

loadSources.output_schema = {
  type: "object",
  properties: {
    datasources: {
      type: "string",
      description:
        "Concatenated contents of the sources files, each prefixed with // file: filename",
    },
  },
};
