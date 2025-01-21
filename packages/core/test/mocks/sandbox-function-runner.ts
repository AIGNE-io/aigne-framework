import {
  AgentDefinition,
  type ContextState,
  type MemoryItemWithScore,
  type RunnableResponseChunk,
  SandboxFunctionRunner,
  type SandboxFunctionRunnerInput,
} from "../../src";

export class MockSandboxFunctionRunner<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
  Preloads extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> extends SandboxFunctionRunner<I, O, State, Preloads, Memories> {
  override async *process(
    input: SandboxFunctionRunnerInput<I, State, Preloads, Memories>,
  ) {
    const args = {
      ...input.input,
      $preloads: input.preloads,
      $memories: input.memories,
      $context: input.context,
    };

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
          if (chunk.done) {
            // NOTE: when return a result from a generator, it should be wrapped in `delta`
            yield { delta: chunk.value };
          } else {
            yield chunk.value;
          }
        }
      }

      if (chunk.done) break;
    }
  }
}
