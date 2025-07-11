import { spawnSync } from "node:child_process";
import { join } from "node:path";

export interface TestConfig {
  initialCall?: string;
  scriptPath?: string;
}

export async function runExampleTest(config?: TestConfig): Promise<{ status: number | null }> {
  const scriptPath = config?.scriptPath ?? join(process.cwd(), "index.ts");

  return spawnSync("bun", [scriptPath], {
    stdio: ["inherit", "inherit", "inherit"],
    env: {
      ...process.env,
      INITIAL_CALL: config?.initialCall ?? process.env.INITIAL_CALL,
    },
  });
}
