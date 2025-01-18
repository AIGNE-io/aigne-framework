import {
  type ContextState,
  FunctionRunner,
  type FunctionRunnerInput,
  type MemoryItemWithScore,
  type RunnableResponseChunk,
} from "../../src";

export class MockFunctionRunner<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends FunctionRunner<I, O, Memories, State> {
  override async *process(input: FunctionRunnerInput<I, Memories, State>) {
    const args = { ...input.input, ...input.memories, $context: input.context };

    const argKeys = Object.keys(args);

    const fnStr = `\
return async function* ({${argKeys.join(", ")}}) {
  ${input.code}
}
  `;

    const fn = new Function(fnStr)();

    const gen: AsyncGenerator<
      RunnableResponseChunk<O>,
      RunnableResponseChunk<O> | undefined
    > = await fn(args);

    for (;;) {
      const chunk = await gen.next();

      if (chunk.value) {
        if (chunk.value instanceof ReadableStream) {
          const reader = chunk.value.getReader();

          for (;;) {
            const { done, value } = await reader.read();
            if (value) yield value;
            if (done) break;
          }
        } else {
          yield chunk.value;
        }
      }

      if (chunk.done) break;
    }
  }
}
