import { AIGNE } from "@aigne/core";

process.on(
  "message",
  async ({ method, args }: { method: string; args: Parameters<typeof AIGNE.load> }) => {
    try {
      if (method !== "AIGNE.load") throw new Error(`Unknown method: ${method}`);
      await AIGNE.load(...args);
      process.send?.({ method, status: "success" });
    } catch (error) {
      process.send?.({ method, status: "error", message: error.message });
    }

    process.exit(0);
  },
);
