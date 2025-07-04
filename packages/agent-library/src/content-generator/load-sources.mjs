import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

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
  includePatterns,
  excludePatterns,
}) {
  let files = Array.isArray(sources) ? [...sources] : [];
  if (sourcesPath) {
    const paths = Array.isArray(sourcesPath) ? sourcesPath : [sourcesPath];
    let allFiles = [];
    for (const dir of paths) {
      try {
        const filesInDir = await walk(dir);
        allFiles = allFiles.concat(filesInDir);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    }
    let includeRegexps = null;
    if (includePatterns) {
      const patterns = Array.isArray(includePatterns) ? includePatterns : [includePatterns];
      includeRegexps = patterns.map((p) => new RegExp(p));
    }
    let excludeRegexps = null;
    if (excludePatterns) {
      const patterns = Array.isArray(excludePatterns) ? excludePatterns : [excludePatterns];
      excludeRegexps = patterns.map((p) => new RegExp(p));
    }
    files = files.concat(
      allFiles.filter((f) => {
        const fileName = path.basename(f);
        if (includeRegexps?.some((r) => r.test(fileName)) === false) return false;
        if (excludeRegexps?.some((r) => r.test(fileName)) === true) return false;
        return true;
      }),
    );
  }
  files = [...new Set(files)];
  let allSources = "";
  const sourceFiles = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, "utf8");
      allSources += `// sourceId: ${file}\n${content}\n`;
      return {
        sourceId: file,
        content,
      };
    }),
  );

  return {
    datasourcesList: sourceFiles,
    datasources: allSources,
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
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "Directory or directories to recursively read files from",
    },
    includePatterns: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description:
        "Regex patterns to filter files by file name (not path). If not set, include all.",
    },
    excludePatterns: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description:
        "Regex patterns to exclude files by file name (not path). If not set, exclude none.",
    },
  },
  required: [],
};

loadSources.output_schema = {
  type: "object",
  properties: {
    datasources: {
      type: "string",
    },
    datasourcesList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceId: { type: "string" },
          content: { type: "string" },
        },
      },
    },
  },
};
