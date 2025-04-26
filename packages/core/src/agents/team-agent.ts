import type { Context } from "../aigne/context.js";
import { mergeAgentResponseChunk, readableStreamToAsyncIterator } from "../utils/stream-utils.js";
import { type PromiseOrValue, isEmpty } from "../utils/type-utils.js";
import {
  Agent,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponseChunk,
  type Message,
} from "./agent.js";

export type TeamAgentProcessMethod = "sequential" | "parallel";

export interface TeamAgentOptions<I extends Message, O extends Message> extends AgentOptions<I, O> {
  /**
   * The method to process the agents in the team.
   * - `sequential`: Process the agents one by one, passing the output of each agent to the next.
   * - `parallel`: Process all agents in parallel, merging the output of all agents.
   * @default "sequential"
   */
  processMethod?: TeamAgentProcessMethod;
}

export class TeamAgent<I extends Message, O extends Message> extends Agent<I, O> {
  static from<I extends Message, O extends Message>(options: TeamAgentOptions<I, O>) {
    return new TeamAgent(options);
  }

  constructor(options: TeamAgentOptions<I, O>) {
    super(options);
    this.processMethod = options.processMethod ?? "sequential";
  }

  processMethod: TeamAgentProcessMethod;

  process(input: I, context: Context): PromiseOrValue<AgentProcessResult<O>> {
    switch (this.processMethod) {
      case "sequential":
        return this._processSequential(input, context);
      case "parallel":
        return this._processParallel(input, context);
    }
  }

  async *_processSequential(input: I, context: Context): PromiseOrValue<AgentProcessResult<O>> {
    const output: Message = {};

    // Clone the agents to run, so that we can update the agents list during the loop
    const agents = [...this.tools];
    const newAgents: Agent[] = [];

    for (const agent of agents) {
      const [o, transferToAgent] = await context.call(
        agent,
        { ...input, ...output },
        { returnActiveAgent: true, streaming: true },
      );

      for await (const chunk of readableStreamToAsyncIterator(o)) {
        yield chunk;
        mergeAgentResponseChunk(output, chunk);
      }
      newAgents.push(await transferToAgent);
    }

    this.tools.splice(0);
    this.tools.push(...newAgents);
  }

  async *_processParallel(input: I, context: Context): PromiseOrValue<AgentProcessResult<O>> {
    const result = await Promise.all(
      this.tools.map((agent) =>
        context.call(agent, input, { returnActiveAgent: true, streaming: true }),
      ),
    );

    const streams = result.map((i) => i[0]);

    type Reader = ReadableStreamDefaultReader<AgentResponseChunk<Message>>;
    type ReaderResult = ReadableStreamReadResult<AgentResponseChunk<Message>>;

    type Task = Promise<{ index: number; reader: Reader } & ReaderResult>;

    const read = async (index: number, reader: Reader): Task => {
      const promise = reader.read();
      return promise.then((result) => ({ ...result, reader, index }));
    };

    const tasks = new Map(streams.map((stream, index) => [index, read(index, stream.getReader())]));

    // NOTE: Flag to check if the output key is used by agent at the index,
    const outputKeyUsed = new Map<string, number>();

    while (tasks.size) {
      const { value, done, reader, index } = await Promise.race(tasks.values());
      tasks.delete(index);
      if (!done) {
        tasks.set(index, read(index, reader));
      }

      if (value) {
        let {
          delta: { text, ...delta },
        } = value;

        if (text) {
          for (const key of Object.keys(text)) {
            // the output key is unused, add to map to lock it
            if (!outputKeyUsed.has(key)) {
              outputKeyUsed.set(key, index);
            }
            // the output key is used by the agent at the index, abandon it
            else if (outputKeyUsed.get(key) !== index) {
              delete text[key];
            }
          }
          if (isEmpty(text)) {
            text = undefined;
          }
        }

        if (!isEmpty(delta.json) || !isEmpty(text)) yield { delta: { ...delta, text } };
      }
    }

    const agents = await Promise.all(result.map((i) => i[1]));
    this.tools.splice(0);
    this.tools.push(...agents);
  }
}
