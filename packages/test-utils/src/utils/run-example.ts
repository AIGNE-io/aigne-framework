import { spawnSync } from "node:child_process";
import { join } from "node:path";

export interface TestConfig {
  initialCall: string;
  scriptPath?: string;
}

export function runExampleTest(config: TestConfig) {
  const scriptPath = config.scriptPath ?? join(process.cwd(), "..", "index.ts");
  const result = spawnSync("bun", [scriptPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      INITIAL_CALL: config.initialCall,
      SKIP_LOOP: "true",
      PUPPETEER_LAUNCH_OPTIONS:
        '{"headless": true, "args": ["--no-sandbox", "--disable-setuid-sandbox"]}',
      ALLOW_DANGEROUS: "true",
    },
  });
  return result;
}
