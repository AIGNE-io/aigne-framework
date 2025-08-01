import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

// Default file patterns for inclusion and exclusion
const DEFAULT_INCLUDE_PATTERNS = [
  "*.py",
  "*.js",
  "*.jsx",
  "*.ts",
  "*.tsx",
  "*.go",
  "*.java",
  "*.pyi",
  "*.pyx",
  "*.c",
  "*.cc",
  "*.cpp",
  "*.h",
  "*.md",
  "*.rst",
  "*.json",
  "*Dockerfile",
  "*Makefile",
  "*.yaml",
  "*.yml",
];

const DEFAULT_EXCLUDE_PATTERNS = [
  "assets/*",
  "data/*",
  "images/*",
  "public/*",
  "static/*",
  "temp/*",
  "*docs/*",
  "*venv/*",
  "*.venv/*",
  "*test*",
  "*tests/*",
  "*examples/*",
  "v1/*",
  "*dist/*",
  "*build/*",
  "*experimental/*",
  "*deprecated/*",
  "*misc/*",
  "*legacy/*",
  ".git/*",
  ".github/*",
  ".next/*",
  ".vscode/*",
  "*obj/*",
  "*bin/*",
  "*node_modules/*",
  "*.log",
];

/**
 * Load .gitignore patterns from a directory
 * @param {string} dir - Directory path
 * @returns {object|null} Ignore instance or null if no .gitignore found
 */
async function loadGitignore(dir) {
  const gitignorePath = path.join(dir, ".gitignore");
  try {
    await access(gitignorePath);
    const gitignoreContent = await readFile(gitignorePath, "utf8");
    // Create ignore patterns from .gitignore content
    const ignorePatterns = gitignoreContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.replace(/^\//, "")); // Remove leading slash

    return ignorePatterns.length > 0 ? ignorePatterns : null;
  } catch {
    // .gitignore file doesn't exist
    return null;
  }
}

/**
 * Get files using glob patterns
 * @param {string} dir - Directory to search
 * @param {string[]} includePatterns - Include patterns
 * @param {string[]} excludePatterns - Exclude patterns
 * @param {string[]} gitignorePatterns - .gitignore patterns
 * @returns {Promise<string[]>} Array of file paths
 */
async function getFilesWithGlob(dir, includePatterns, excludePatterns, gitignorePatterns) {
  // Prepare all ignore patterns
  const allIgnorePatterns = [];

  if (excludePatterns) {
    allIgnorePatterns.push(...excludePatterns);
  }

  if (gitignorePatterns) {
    allIgnorePatterns.push(...gitignorePatterns);
  }

  // Add default exclusions if not already present
  const defaultExclusions = ["node_modules/**", "test/**", "temp/**"];
  for (const exclusion of defaultExclusions) {
    if (!allIgnorePatterns.includes(exclusion)) {
      allIgnorePatterns.push(exclusion);
    }
  }

  // Convert patterns to be relative to the directory
  const patterns = includePatterns.map((pattern) => {
    // If pattern doesn't start with / or **, make it relative to dir
    if (!pattern.startsWith("/") && !pattern.startsWith("**")) {
      return `**/${pattern}`; // Use ** to search recursively
    }
    return pattern;
  });

  try {
    const files = await glob(patterns, {
      cwd: dir,
      ignore: allIgnorePatterns.length > 0 ? allIgnorePatterns : undefined,
      absolute: true,
      nodir: true, // Only return files, not directories
      dot: false, // Don't include dot files by default
      gitignore: true, // Enable .gitignore support
    });

    return files;
  } catch (error) {
    console.warn(`Warning: Error during glob search in ${dir}: ${error.message}`);
    return [];
  }
}

export default async function loadSources({
  sources = [],
  sourcesPath = [],
  includePatterns,
  excludePatterns,
  outputDir,
  docsDir,
  currentPath,
  useDefaultPatterns = true,
} = {}) {
  let files = Array.isArray(sources) ? [...sources] : [];

  if (sourcesPath) {
    const paths = Array.isArray(sourcesPath) ? sourcesPath : [sourcesPath];
    let allFiles = [];

    for (const dir of paths) {
      try {
        // Load .gitignore for this directory
        const gitignorePatterns = await loadGitignore(dir);

        // Prepare patterns
        let finalIncludePatterns = null;
        let finalExcludePatterns = null;

        if (useDefaultPatterns) {
          // Merge with default patterns
          const userInclude = includePatterns
            ? Array.isArray(includePatterns)
              ? includePatterns
              : [includePatterns]
            : [];
          const userExclude = excludePatterns
            ? Array.isArray(excludePatterns)
              ? excludePatterns
              : [excludePatterns]
            : [];

          finalIncludePatterns = [...DEFAULT_INCLUDE_PATTERNS, ...userInclude];
          finalExcludePatterns = [...DEFAULT_EXCLUDE_PATTERNS, ...userExclude];
        } else {
          // Use only user patterns
          if (includePatterns) {
            finalIncludePatterns = Array.isArray(includePatterns)
              ? includePatterns
              : [includePatterns];
          }
          if (excludePatterns) {
            finalExcludePatterns = Array.isArray(excludePatterns)
              ? excludePatterns
              : [excludePatterns];
          }
        }

        // Get files using glob
        const filesInDir = await getFilesWithGlob(
          dir,
          finalIncludePatterns,
          finalExcludePatterns,
          gitignorePatterns,
        );
        allFiles = allFiles.concat(filesInDir);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    }

    files = files.concat(allFiles);
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

  // Get the last structure plan result
  let originalStructurePlan;
  const structurePlanPath = path.join(outputDir, "structure-plan.json");
  try {
    await access(structurePlanPath);
    const structurePlanResult = await readFile(structurePlanPath, "utf8");
    if (structurePlanResult) {
      try {
        originalStructurePlan = JSON.parse(structurePlanResult);
      } catch (err) {
        console.error(`Failed to parse structure-plan.json: ${err.message}`);
      }
    }
  } catch {
    // The file does not exist, originalStructurePlan remains undefined
  }

  // Get the last output result of the specified path
  let content;
  if (currentPath) {
    const flatName = currentPath.replace(/^\//, "").replace(/\//g, "-");
    const fileFullName = `${flatName}.md`;
    const filePath = path.join(docsDir, fileFullName);
    try {
      await access(filePath);
      content = await readFile(filePath, "utf8");
    } catch {
      // The file does not exist, content remains undefined
    }
  }

  return {
    datasourcesList: sourceFiles,
    datasources: allSources,
    content,
    originalStructurePlan,
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
      description: "Glob patterns to filter files by path or filename. If not set, include all.",
    },
    excludePatterns: {
      anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "Glob patterns to exclude files by path or filename. If not set, exclude none.",
    },
    useDefaultPatterns: {
      type: "boolean",
      description: "Whether to use default include/exclude patterns. Defaults to true.",
    },
    currentPath: {
      type: "string",
      description: "The current path of the document",
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
