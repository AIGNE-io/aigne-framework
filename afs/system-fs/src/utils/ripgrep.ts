import { spawn } from "node:child_process";
import { rm, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { rgPath } from "@vscode/ripgrep";

export interface RipgrepMatch {
  type: "match" | "begin" | "end" | "context";
  data: {
    path?: { text: string };
    lines?: { text: string };
    line_number?: number;
    absolute_offset?: number;
    submatches?: Array<{
      match: { text: string };
      start: number;
      end: number;
    }>;
  };
}

export async function searchWithRipgrep(basePath: string, query: string): Promise<RipgrepMatch[]> {
  await ensureNativeDependenciesInstalled();

  return new Promise((resolve, reject) => {
    const args = ["--json", "--no-heading", "--with-filename", query, basePath];

    const rg = spawn(rgPath, args);
    let output = "";
    let errorOutput = "";

    rg.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    rg.stderr.on("data", (data: Buffer) => {
      errorOutput += data.toString();
    });

    rg.on("close", (code) => {
      if (code === 0 || code === 1) {
        // 0 = found, 1 = not found
        try {
          const lines = output
            .trim()
            .split("\n")
            .filter((line) => line);
          const matches: RipgrepMatch[] = lines.map((line) => JSON.parse(line));
          resolve(matches);
        } catch (error) {
          reject(new Error(`Failed to parse ripgrep output: ${error}`));
        }
      } else {
        reject(new Error(`Ripgrep failed with code ${code}: ${errorOutput}`));
      }
    });

    rg.on("error", (error) => {
      reject(new Error(`Failed to spawn ripgrep: ${error}`));
    });
  });
}

let installPromise: Promise<void> | null = null;

async function ensureNativeDependenciesInstalled() {
  if (installPromise) return installPromise;

  installPromise = (async () => {
    if (await isFileExists(rgPath)) {
      return;
    }

    // Remove the existing bin folder to ensure a clean install
    const binFolder = dirname(rgPath);
    await rm(binFolder, { recursive: true, force: true });

    await new Promise<void>((resolve, reject) => {
      const child = spawn("npm", ["run", "postinstall"], {
        cwd: dirname(binFolder),
        stdio: "pipe",
        shell: process.platform === "win32",
      });

      let stderr = "";
      child.stderr.on("data", (data) => {
        const str = data.toString();
        stderr += str;
      });

      child.on("error", (error) => reject(error));

      child.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`npm install failed with code ${code} ${stderr}`));
      });
    });
  })().catch((error) => {
    console.error(`Failed to install native dependencies: ${error}`);
    installPromise = null;
  });

  return installPromise;
}

async function isFileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}
