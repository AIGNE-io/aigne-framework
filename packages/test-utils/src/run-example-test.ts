import { spawn } from "node:child_process";
import { join } from "node:path";

export interface TestConfig {
  initialCall?: string;
  scriptPath?: string;
}

export function runExampleTest(
  config?: TestConfig,
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  const scriptPath = config?.scriptPath ?? join(process.cwd(), "index.ts");
  return new Promise((resolve, reject) => {
    const child = spawn("bun", [scriptPath], {
      stdio: ["inherit", "pipe", "pipe"],
      env: {
        ...process.env,
        INITIAL_CALL: config?.initialCall ?? process.env.INITIAL_CALL,
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
      stdout += data;
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
      stderr += data;
    });

    child.on("close", (code) => {
      resolve({ stdout, stderr, code });
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}
