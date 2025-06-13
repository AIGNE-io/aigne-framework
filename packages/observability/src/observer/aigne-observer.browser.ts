import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "./type.js";

export class AIGNEObserver {
  private server: AIGNEObserverOptions["server"];
  private storage: AIGNEObserverOptions["storage"];
  private initPort?: number;

  constructor(options?: AIGNEObserverOptions) {
    const parsed = AIGNEObserverOptionsSchema.parse(options);
    const host = parsed.server?.host ?? process.env.AIGNE_OBSERVER_HOST ?? "localhost";
    const initPort = parsed.server?.port ?? process.env.AIGNE_OBSERVER_PORT;
    this.initPort = initPort ? Number(initPort) : undefined;
    const port = this.initPort ?? 7890;
    this.server = { host, port };
    this.storage = parsed.storage;
  }

  async serve(): Promise<void> {}
  async close(): Promise<void> {}
  async record(_: unknown): Promise<{ success: boolean; id: string }> {
    return { success: true, id: "" };
  }
  async update(_: unknown): Promise<{ success: boolean }> {
    return { success: true };
  }
}
