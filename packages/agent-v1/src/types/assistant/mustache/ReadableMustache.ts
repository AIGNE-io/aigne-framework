import { ReadableStream } from "node:stream/web";

import fastq from "fastq";

import { renderMessage } from "../../../utils/render-message";

export function renderMustacheStream(
  template: string,
  context: (
    enqueue: (
      fn: (template: string, render: Function, rendered: string) => any,
    ) => (template: string, render: Function) => any,
  ) => any,
) {
  return new ReadableStream<string>({
    async start(controller) {
      try {
        // 异步任务队列，每个任务完成之后都会重新渲染模板并返回最新的结果到流中
        const queue = fastq.promise(async (p: Promise<any>) => {
          await p;
          await render();
        }, 100);

        let reject: ((error: any) => void) | undefined;
        const errorPromise = new Promise((_, rej) => {
          reject = rej;
        });

        queue.error((error) => {
          if (error) reject?.(error);
        });

        // 任务缓存，每个任务的 key 为渲染后的子模板（其中可能包含参数）
        const cache = new Map<
          string,
          {
            promise?: Promise<any>;
            result?: { data: any };
            error?: { error: any };
          }
        >();

        const ctx = context((fn) => {
          return async (template, render) => {
            const rendered = await render(template);
            const key = rendered;

            let task = cache.get(key);
            if (!task) {
              const res = fn(template, render, rendered);

              if (res instanceof Promise) {
                task = { promise: res };
                res
                  .then((value) => {
                    task!.result = { data: value };
                  })
                  .catch((error) => {
                    task!.error = { error };
                  });
                queue.push(res);
              } else {
                task = { result: { data: res } };
              }

              cache.set(key, task);
            }

            if (task.error) throw task.error.error;

            // 返回 promise 完成后的数据，没完成则返回 undefined，避免阻塞 mustache 渲染
            return task.result?.data;
          };
        });

        const render = async () =>
          controller.enqueue(
            await renderMessage(template, ctx, { escapeJsonSymbols: true }),
          );

        await render();

        // wait for all promise in the queue to be resolved
        await Promise.race([queue.drained(), errorPromise]);
      } catch (error) {
        controller.error(error);
      }
      controller.close();
    },
  });
}
