import { type Agent, AIGNE } from "@aigne/core";
import type { DatasetItem, Runner, RunOptions, RunResult } from "./type.js";

export class DefaultRunner implements Runner {
  name = "default-runner";

  constructor(
    private agent: Agent,
    private aigne: AIGNE = new AIGNE(),
  ) {}

  async *run(dataset: DatasetItem[], options?: RunOptions): AsyncGenerator<RunResult> {
    const timeoutMs = options?.timeoutMs ?? 0;

    const runTask = async (item: DatasetItem): Promise<RunResult> => {
      const start = Date.now();
      options?.hooks?.onBeforeRun?.(item);

      try {
        const execPromise = this.aigne.invoke(this.agent, item.input, { returnMetadata: true });
        const result =
          timeoutMs > 0 ? await withTimeout(execPromise, timeoutMs, item.id) : await execPromise;
        const { $meta, ...output } = result;

        options?.hooks?.onAfterRun?.(result);

        return {
          ...item,
          output,
          latency: (Date.now() - start) / 1000,
          usage: $meta?.usage || {},
        };
      } catch (err: any) {
        options?.hooks?.onError?.(err);

        return {
          ...item,
          error: err.message,
        };
      }
    };

    for (const item of dataset) {
      yield await runTask(item);
    }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, id: string | number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Task ${id} timed out after ${ms}ms`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export class DefaultRunnerWithConcurrency implements Runner {
  name = "default-runner-with-concurrency";

  constructor(
    private agent: Agent,
    private aigne: AIGNE = new AIGNE(),
  ) {}

  async *run(dataset: DatasetItem[], options?: RunOptions): AsyncGenerator<RunResult> {
    const concurrency = options?.concurrency ?? 1;
    const timeoutMs = options?.timeoutMs ?? 0;

    let index = 0;
    const yieldQueue: RunResult[] = [];
    let waitingResolve: (() => void) | null = null;
    let activeWorkers = 0;

    const runTask = async (item: DatasetItem): Promise<RunResult> => {
      const start = Date.now();
      options?.hooks?.onBeforeRun?.(item);

      try {
        const execPromise = this.aigne.invoke(this.agent, item.input, { returnMetadata: true });
        const result =
          timeoutMs > 0 ? await withTimeout(execPromise, timeoutMs, item.id) : await execPromise;
        const { $meta, ...output } = result;

        options?.hooks?.onAfterRun?.(result);

        return {
          ...item,
          output,
          latency: (Date.now() - start) / 1000,
          usage: $meta?.usage || {},
        };
      } catch (err: any) {
        options?.hooks?.onError?.(err);

        return {
          ...item,
          error: err.message,
        };
      }
    };

    const worker = async () => {
      activeWorkers++;
      try {
        while (true) {
          const currentIndex = index++;
          if (currentIndex >= dataset.length) break;

          const item = dataset[currentIndex];
          if (!item) continue;
          const res = await runTask(item);

          yieldQueue.push(res);
          waitingResolve?.();
        }
      } finally {
        activeWorkers--;
        waitingResolve?.();
      }
    };

    Array.from({ length: Math.min(concurrency, dataset.length) }, () => worker());

    while (yieldQueue.length > 0 || activeWorkers > 0) {
      if (yieldQueue.length > 0) {
        const result = yieldQueue.shift();
        if (result) yield result;
      } else {
        await new Promise<void>((resolve) => {
          waitingResolve = resolve;
        });
        waitingResolve = null;
      }
    }
  }
}
