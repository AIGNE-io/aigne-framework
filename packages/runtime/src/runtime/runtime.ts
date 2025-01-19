import { join } from "node:path";

import { AgentV1, agentV1ToRunnableDefinition } from "@aigne/agent-v1";
import {
  type ContextState,
  OrderedRecord,
  type Runnable,
  type RunnableDefinition,
  Runtime,
  type RuntimeOptions,
  TYPES,
} from "@aigne/core";
import { readFile } from "fs-extra";
import { glob } from "glob";
import { injectable } from "tsyringe";
import { parse } from "yaml";

import { BlockletAPIAgent } from "../provider/blocklet-api-agent";
import { BlockletLLMModel } from "../provider/blocklet-llm-model";
import { QuickJSRunner } from "../provider/quickjs-runner";

export interface ProjectDefinition {
  id: string;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  runnables: OrderedRecord<RunnableDefinition>;
}

export interface AIGNERuntimeOptions<
  Agents extends { [name: string]: Runnable },
  State extends ContextState,
> extends RuntimeOptions<Agents, State> {
  projectDefinition?: ProjectDefinition;
}

@injectable()
export class AIGNERuntime<
  Agents extends { [name: string]: Runnable } = {},
  State extends ContextState = ContextState,
> extends Runtime<Agents, State> {
  // TODO: 拆分加载逻辑，避免 Runtime 代码臃肿
  static async load<
    Agents extends { [name: string]: Runnable } = {},
    State extends ContextState = ContextState,
  >(
    options: { path: string } & AIGNERuntimeOptions<Agents, State>,
  ): Promise<AIGNERuntime<Agents, State>> {
    const projectFilePath = join(options.path, "project.yaml");
    const project = parse((await readFile(projectFilePath)).toString());
    // TODO: validate parsed project

    const agentFilePaths = await glob(
      join(options.path, "prompts", "**/*.yaml"),
    );
    const runnables = await Promise.all(
      agentFilePaths.map(async (filename) => {
        const agent = parse((await readFile(filename)).toString());
        // TODO: validate parsed agent
        return agentV1ToRunnableDefinition(agent);
      }),
    );

    const projectDefinition: ProjectDefinition = {
      ...project,
      runnables: OrderedRecord.fromArray(runnables),
    };

    return new AIGNERuntime({
      ...options,
      projectDefinition,
    });
  }

  constructor(options: AIGNERuntimeOptions<Agents, State> = {}) {
    super({
      ...options,
      id: options?.id || options?.projectDefinition?.id || "default-runtime",
      name: options?.name || options?.projectDefinition?.name,
    });

    OrderedRecord.push(
      this.inner.runnableDefinitions,
      ...OrderedRecord.toArray(options?.projectDefinition?.runnables),
    );

    this.inner.container.register("blocklet_api_agent", {
      useClass: BlockletAPIAgent,
    });

    // NOTE: 兼容旧版的 Agent 定义，统一使用 AgentV1 来处理
    for (const type of [
      "function",
      "agent",
      "prompt",
      "image",
      "api",
      "router",
      "callAgent",
      "imageBlender",
    ]) {
      this.inner.container.register(type, { useClass: AgentV1 });
    }

    this.inner.registerDependency(
      TYPES.functionRunner,
      options.functionRunner || QuickJSRunner,
    );
    this.inner.registerDependency(
      TYPES.llmModel,
      options.llmModel || BlockletLLMModel,
    );
  }

  get options(): AIGNERuntimeOptions<Agents, State> {
    return this.inner.options;
  }
}
