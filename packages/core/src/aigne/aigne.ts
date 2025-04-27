import { z } from "zod";
import { Agent } from "../agents/agent.js";
import { load } from "../loader/index.js";
import { ChatModel } from "../models/chat-model.js";
import { checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { AIGNEContext, type Context } from "./context.js";
import { MessageQueue } from "./message-queue.js";
import type { ContextLimits } from "./usage.js";

export interface AIGNEOptions {
  name?: string;
  description?: string;
  model?: ChatModel;
  skills?: Agent[];
  agents?: Agent[];
  limits?: ContextLimits;
}

export class AIGNE {
  static async load({ path, ...options }: { path: string } & AIGNEOptions): Promise<AIGNE> {
    const { model, agents, skills, ...aigne } = await load({ path });
    return new AIGNE({
      ...options,
      model: options.model || model,
      name: options.name || aigne.name || undefined,
      description: options.description || aigne.description || undefined,
      agents: agents.concat(options.agents ?? []),
      skills: skills.concat(options.skills ?? []),
    });
  }

  constructor(options?: AIGNEOptions) {
    if (options) checkArguments("AIGNE", aigneOptionsSchema, options);

    this.name = options?.name;
    this.description = options?.description;
    this.model = options?.model;
    this.limits = options?.limits;
    if (options?.skills?.length) this.skills.push(...options.skills);
    if (options?.agents?.length) this.addAgent(...options.agents);

    this.initProcessExitHandler();
  }

  name?: string;

  description?: string;

  readonly messageQueue = new MessageQueue();

  model?: ChatModel;

  readonly skills = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  readonly agents = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  limits?: ContextLimits;

  addAgent(...agents: Agent[]) {
    checkArguments("AIGNE.addAgent", aigneAddAgentArgsSchema, agents);

    for (const agent of agents) {
      this.agents.push(agent);

      agent.attach(this);
    }
  }

  newContext() {
    return new AIGNEContext(this);
  }

  publish = ((...args) => {
    return new AIGNEContext(this).publish(...args);
  }) as Context["publish"];

  invoke = ((...args: Parameters<Context["invoke"]>) => {
    return new AIGNEContext(this).invoke(...args);
  }) as Context["invoke"];

  subscribe = ((...args) => {
    return this.messageQueue.subscribe(...args);
  }) as Context["subscribe"];

  unsubscribe = ((...args) => {
    this.messageQueue.unsubscribe(...args);
  }) as Context["unsubscribe"];

  async shutdown() {
    for (const tool of this.skills) {
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

const aigneOptionsSchema = z.object({
  model: z.instanceof(ChatModel).optional(),
  skills: z.array(z.instanceof(Agent)).optional(),
  agents: z.array(z.instanceof(Agent)).optional(),
});

const aigneAddAgentArgsSchema = z.array(z.instanceof(Agent));
