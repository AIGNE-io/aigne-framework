import { z } from "zod";
import { Agent } from "../agents/agent.js";
import { load } from "../loader/index.js";
import { ChatModel } from "../models/chat-model.js";
import { checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { type Context, ExecutionContext } from "./context.js";
import { MessageQueue } from "./message-queue.js";
import type { ContextLimits } from "./usage.js";

export interface ExecutionEngineOptions {
  name?: string;
  description?: string;
  model?: ChatModel;
  tools?: Agent[];
  agents?: Agent[];
  limits?: ContextLimits;
}

export interface ExecutionEngineRunOptions {
  returnActiveAgent?: boolean;
}

export class ExecutionEngine {
  static async load({
    path,
    ...options
  }: { path: string } & ExecutionEngineOptions): Promise<ExecutionEngine> {
    const { model, agents, tools, ...aigne } = await load({ path });
    return new ExecutionEngine({
      ...options,
      model: options.model || model,
      name: options.name || aigne.name || undefined,
      description: options.description || aigne.description || undefined,
      agents: agents.concat(options.agents ?? []),
      tools: tools.concat(options.tools ?? []),
    });
  }

  constructor(options?: ExecutionEngineOptions) {
    if (options) checkArguments("ExecutionEngine", executionEngineOptionsSchema, options);

    this.name = options?.name;
    this.description = options?.description;
    this.model = options?.model;
    this.limits = options?.limits;
    if (options?.tools?.length) this.tools.push(...options.tools);
    if (options?.agents?.length) this.addAgent(...options.agents);

    this.initProcessExitHandler();
  }

  name?: string;

  description?: string;

  readonly messageQueue = new MessageQueue();

  model?: ChatModel;

  readonly tools = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  readonly agents = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  limits?: ContextLimits;

  addAgent(...agents: Agent[]) {
    checkArguments("ExecutionEngine.addAgent", executionEngineAddAgentArgsSchema, agents);

    for (const agent of agents) {
      this.agents.push(agent);

      agent.attach(this);
    }
  }

  newContext() {
    return new ExecutionContext(this);
  }

  publish = ((...args) => {
    return new ExecutionContext(this).publish(...args);
  }) as Context["publish"];

  call = ((...args: Parameters<Context["call"]>) => {
    return new ExecutionContext(this).call(...args);
  }) as Context["call"];

  subscribe = ((...args) => {
    return this.messageQueue.subscribe(...args);
  }) as Context["subscribe"];

  unsubscribe = ((...args) => {
    this.messageQueue.unsubscribe(...args);
  }) as Context["unsubscribe"];

  async shutdown() {
    for (const tool of this.tools) {
      await tool.shutdown();
    }
    for (const agent of this.agents) {
      await agent.shutdown();
    }
  }

  private initProcessExitHandler() {
    const shutdownAndExit = () => this.shutdown().finally(() => process.exit(0));
    process.on("SIGINT", shutdownAndExit);
    process.on("exit", shutdownAndExit);
  }
}

const executionEngineOptionsSchema = z.object({
  model: z.instanceof(ChatModel).optional(),
  tools: z.array(z.instanceof(Agent)).optional(),
  agents: z.array(z.instanceof(Agent)).optional(),
});

const executionEngineAddAgentArgsSchema = z.array(z.instanceof(Agent));
