import { spawnSync } from "node:child_process";
import { join } from "node:path";

export interface TestConfig {
  initialCall?: string;
  scriptPath?: string;
}

export function runExampleTest(config?: TestConfig) {
  const scriptPath = config?.scriptPath ?? join(process.cwd(), "index.ts");
  return spawnSync("bun", [scriptPath], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      INITIAL_CALL: config?.initialCall ?? process.env.INITIAL_CALL,
    },
  });
}
