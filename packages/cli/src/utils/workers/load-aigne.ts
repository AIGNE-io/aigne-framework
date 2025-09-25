import { fork } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AIGNE } from "@aigne/core";

export async function safeLoadAIGNE(
  ...args: Parameters<typeof AIGNE.load>
): Promise<ReturnType<typeof AIGNE.load>> {
  await new Promise<void>((resolve, reject) => {
    const child = fork(join(dirname(fileURLToPath(import.meta.url)), "./load-aigne-worker.js"), {
      timeout: 600e3,
    });

    child.on(
      "message",
      ({ method, message, status }: { method: string; message?: string; status: string }) => {
        if (method !== "AIGNE.load") reject(new Error(`Unknown method: ${method}`));
        else if (status === "error") reject(new Error(`Failed to load AIGNE: ${message}`));
        else if (status === "success") resolve();
      },
    );

    child.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Child process exited with code ${code}`));
      else resolve();
    });

    child.send({ method: "AIGNE.load", args });
  });

  return AIGNE.load(...args);
}
