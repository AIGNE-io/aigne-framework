import { realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, normalize, resolve } from "node:path";

export function expandHome(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return join(homedir(), filepath.slice(1));
  }
  return filepath;
}

export async function validatePath(requestedPath: string, allowedDirs: string[]): Promise<string> {
  const allowedDirectories = allowedDirs.map((dir) => normalize(resolve(expandHome(dir))));

  const expandedPath = expandHome(requestedPath);
  const absolute = isAbsolute(expandedPath)
    ? resolve(expandedPath)
    : resolve(process.cwd(), expandedPath);

  const normalizedRequested = normalize(absolute);

  // Check if path is within allowed directories
  const isAllowed = allowedDirectories.some((dir) => normalizedRequested.startsWith(dir));
  if (!isAllowed) {
    throw new Error(
      `Access denied - path outside allowed directories: ${absolute} not in ${allowedDirectories.join(", ")}`,
    );
  }

  // Handle symlinks by checking their real path
  try {
    const realPath = await realpath(absolute);
    const normalizedReal = normalize(realPath);
    const isRealPathAllowed = allowedDirectories.some((dir) => normalizedReal.startsWith(dir));
    if (!isRealPathAllowed) {
      throw new Error("Access denied - symlink target outside allowed directories");
    }
    return realPath;
  } catch {
    // For new files that don't exist yet, verify parent directory
    const parentDir = dirname(absolute);
    try {
      const realParentPath = await realpath(parentDir);
      const normalizedParent = normalize(realParentPath);
      const isParentAllowed = allowedDirectories.some((dir) => normalizedParent.startsWith(dir));
      if (!isParentAllowed) {
        throw new Error("Access denied - parent directory outside allowed directories");
      }
      return absolute;
    } catch {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }
}
