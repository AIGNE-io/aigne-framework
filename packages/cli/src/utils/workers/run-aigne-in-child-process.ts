import { fork } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  invokeCLIAgentFromDirInChildProcess,
  loadAIGNEInChildProcess,
} from "./run-aigne-in-child-process-worker.js";

export type LoadAIGNEInChildProcessResult = Awaited<ReturnType<typeof loadAIGNEInChildProcess>>;

export interface ChildProcessAIGNEMethods {
  loadAIGNE: typeof loadAIGNEInChildProcess;
  invokeCLIAgentFromDir: typeof invokeCLIAgentFromDirInChildProcess;
}

export async function runAIGNEInChildProcess<M extends keyof ChildProcessAIGNEMethods>(
  method: M,
  ...args: Parameters<ChildProcessAIGNEMethods[M]>
): Promise<ReturnType<ChildProcessAIGNEMethods[M]>> {
  return await new Promise<ReturnType<ChildProcessAIGNEMethods[M]>>((resolve, reject) => {
    const child = fork(
      join(dirname(fileURLToPath(import.meta.url)), "./run-aigne-in-child-process-worker.js"),
    );

    child.on(
      "message",
      (event: { method: string; error?: { message: string }; result?: unknown }) => {
        if (event.method !== method)
          reject(new Error(`Unknown method: ${event.method} expected: ${method}`));
        else if (event.error) reject(new Error(`Failed to load AIGNE: ${event.error.message}`));
        else resolve(event.result as any);
      },
    );

    child.on("exit", (code) => {
      reject(new Error(`Child process exited with code ${code}`));
    });

    child.send({ method, args });
  });
}
