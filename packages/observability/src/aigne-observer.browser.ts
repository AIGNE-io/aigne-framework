export class AIGNEObserver {
  async serve(): Promise<void> {}
  async close(): Promise<void> {}
  async record(_: unknown): Promise<{ success: boolean; id: string }> {
    return { success: true, id: "" };
  }
  async update(_: unknown): Promise<{ success: boolean }> {
    return { success: true };
  }
}
