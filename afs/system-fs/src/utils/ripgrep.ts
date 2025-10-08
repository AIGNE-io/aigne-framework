import { spawn } from "node:child_process";
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
