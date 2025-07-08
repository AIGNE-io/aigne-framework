import { spawn } from "node:child_process";
import { join } from "node:path";

export interface TestConfig {
  initialCall?: string;
  scriptPath?: string;
}

export function runExampleTest(config?: TestConfig): Promise<{ code: number | null }> {
  const scriptPath = config?.scriptPath ?? join(process.cwd(), "index.ts");
  return new Promise((resolve, reject) => {
    const child = spawn("bun", [scriptPath], {
      stdio: ["inherit", "inherit", "inherit"],
      env: {
        ...process.env,
        INITIAL_CALL: config?.initialCall ?? process.env.INITIAL_CALL,
      },
    });

    child.on("exit", (code) => {
      resolve({ code });
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}
