import type { Mock } from "bun:test";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function waitLastCall<F extends (...args: any[]) => any>(mock: Mock<F>) {
  while (true) {
    const lastResult = mock.mock.results.at(-1);
    if (lastResult) {
      if (lastResult.type === "throw") throw lastResult.value;
      if (lastResult.type === "return") return lastResult.value;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
