import {
  type RunnableResponse,
  type RunnableResponseChunk,
  type RunnableResponseStream,
  isRunnableResponseDelta,
} from "../runnable";

export function objectToRunnableResponseStream<
  T extends { [key: string]: any },
>(obj: T): RunnableResponseStream<T> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue({ $text: obj.$text || undefined, delta: obj });
      controller.close();
    },
  });
}

export async function runnableResponseStreamToObject<
  T extends { [key: string]: any },
>(
  stream: RunnableResponseStream<T> | AsyncGenerator<RunnableResponseChunk<T>>,
): Promise<T> {
  let $text = "";
  const result: T = {} as T;

  for await (const value of stream) {
    if (isRunnableResponseDelta(value)) {
      $text += value.$text || "";
      Object.assign(result, value.delta);
    }
  }

  Object.assign(result, { $text: result.$text || $text || undefined });

  return result;
}

/**
 * Extracts the outputs from a runnable output stream and run the
 * resolve function on the result before the stream closes. It can be
 * used to update the memories of an agent.
 * @param output The runnable output stream or object
 * @param resolve The function to run on the result
 * @returns The runnable output stream or object
 */
export async function extractOutputsFromRunnableOutput<
  T extends { [key: string]: any },
>(
  output: RunnableResponse<T> | AsyncGenerator<RunnableResponseChunk<T>>,
  resolve: (result: T) => Promise<void> | void,
): Promise<RunnableResponse<T>> {
  if (
    output instanceof ReadableStream ||
    isAsyncGenerator<AsyncGenerator<RunnableResponseChunk<T>>>(output)
  ) {
    return new ReadableStream({
      async start(controller) {
        try {
          const result: T = {} as T;
          let $text = "";

          for await (const value of output) {
            if (isRunnableResponseDelta(value)) {
              controller.enqueue(value);

              $text += value.$text || "";
              Object.assign(result, value.delta);
            }
          }

          Object.assign(result, { $text: result.$text || $text || undefined });

          await resolve(result);
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });
  }

  await resolve(output);

  return output;
}

export function asyncGeneratorToReadableStream<T>(
  generator: AsyncGenerator<T>,
): ReadableStream<T> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const value of generator) {
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

export function isAsyncGenerator<T extends AsyncGenerator>(
  value: any,
): value is T {
  return Symbol.asyncIterator in value;
}
