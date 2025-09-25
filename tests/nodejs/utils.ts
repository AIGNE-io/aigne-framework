import { type SpawnOptionsWithoutStdio, spawn } from "node:child_process";

export async function spawnAsync(
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio,
): Promise<{ status: number | null; stdout?: string; stderr?: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      resolve({ status: code, stdout, stderr });
    });

    child.on("exit", (code) => {
      resolve({ status: code, stdout, stderr });
    });
  });
}
