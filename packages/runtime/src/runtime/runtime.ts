import { join } from "node:path";

import { AgentV1, agentV1ToRunnableDefinition } from "@aigne/agent-v1";
import {
  type Context,
  type ContextState,
  FunctionAgent,
  type FunctionRunner,
  LLMAgent,
  LLMDecisionAgent,
  type LLMModel,
  type LLMModelConfiguration,
  LocalFunctionAgent,
  OpenAPIAgent,
  OrderedRecord,
  PipelineAgent,
  Runnable,
  type RunnableDefinition,
  TYPES,
} from "@aigne/core";
import { readFile } from "fs-extra";
import { glob } from "glob";
import { produce } from "immer";
import { merge } from "lodash";
import { nanoid } from "nanoid";
import { type DependencyContainer, container, injectable } from "tsyringe";
import type { constructor as Constructor } from "tsyringe/dist/typings/types";
import { parse } from "yaml";

import { BlockletAPIAgent } from "../provider/blocklet-api-agent";
import { BlockletLLMModel } from "../provider/blocklet-llm-model";
import { QuickJSRunner } from "../provider/quickjs-runner";
import type { DeepPartial } from "../utils/partial";

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

export interface RuntimeConfiguration {
  llmModel?: LLMModelConfiguration;
}

export interface RuntimeOptions<
  Agents extends { [name: string]: Runnable },
  State extends ContextState,
> {
  id?: string;

  name?: string;

  projectDefinition?: ProjectDefinition;

  config?: RuntimeConfiguration;

  state?: State;

  agents?: Agents;

  llmModel?: LLMModel | Constructor<LLMModel>;

  functionRunner?: FunctionRunner | Constructor<FunctionRunner>;
}

@injectable()
export class Runtime<
  Agents extends { [name: string]: Runnable } = {},
  State extends ContextState = ContextState,
> implements Context<State>
{
  // TODO: 拆分加载逻辑，避免 Runtime 代码臃肿
  static async load<
    Agents extends { [name: string]: Runnable } = {},
    State extends ContextState = ContextState,
  >(
    options: { path: string } & RuntimeOptions<Agents, State>,
  ): Promise<Runtime<Agents, State>> {
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

    return new Runtime({
      ...options,
      projectDefinition,
    });
  }

  constructor(options: RuntimeOptions<Agents, State> = {}) {
    // support copy inner from a existing runtime, but not expose to public
    const inner = (options as any).inner;
    if (inner instanceof RuntimeInner) this.inner = inner;
    else this.inner = new RuntimeInner(options);

    this.container = this.inner.container.createChildContainer();
    this.container.register(TYPES.context, { useValue: this });

    this.config = options.config || { ...this.inner.config };
    this.state = options.state || { ...this.inner.state };
  }

  private inner: RuntimeInner<Agents, State>;

  get options() {
    return this.inner.options;
  }

  get id() {
    return this.inner.id;
  }

  get name() {
    return this.inner.name;
  }

  config: RuntimeConfiguration;

  state: State;

  agents: Agents = new Proxy(
    {},
    { get: (_, prop) => this.resolveSync(prop.toString()) },
  ) as Agents;

  private container: DependencyContainer;

  setup(config: DeepPartial<RuntimeConfiguration>) {
    this.config = produce(this.config, (draft) => {
      merge(draft, config);
    });
  }

  register<R extends Array<RunnableDefinition | Runnable> = []>(
    ...runnables: R
  ): void {
    for (const runnable of runnables) {
      OrderedRecord.pushOrUpdate(
        this.inner.runnableDefinitions,
        runnable instanceof Runnable ? runnable.definition : runnable,
      );
    }
  }

  private resolveSync<T extends Runnable>(
    idOrRunnable: string | RunnableDefinition | T,
  ): T {
    const runnableId =
      typeof idOrRunnable === "string" ? idOrRunnable : idOrRunnable.id;

    // Find runnable definition by id or name
    let definition: RunnableDefinition | undefined =
      this.inner.runnableDefinitions[runnableId] ??
      OrderedRecord.find(
        this.inner.runnableDefinitions,
        (def) => def.name === runnableId,
      );

    if (!definition) {
      // extract definition from runnable
      if (idOrRunnable instanceof Runnable)
        definition = idOrRunnable.definition;
      // directly use runnable as definition
      else if (typeof idOrRunnable === "object") definition = idOrRunnable;
    }

    if (definition) {
      const childContainer = this.container
        .createChildContainer()
        .register(TYPES.definition, { useValue: definition });
      const result = childContainer.resolve<T>(definition.type);
      childContainer.dispose();
      return result;
    }

    throw new Error(`Runnable not found: ${idOrRunnable}`);
  }

  async resolve<T extends Runnable>(
    id: string | RunnableDefinition | T,
  ): Promise<T> {
    return this.resolveSync<T>(id);
  }

  resolveDependency<T>(token: string | symbol): T {
    return this.container.resolve(token);
  }

  copy<State extends ContextState = ContextState>(
    options: Pick<RuntimeOptions<Agents, State>, "state" | "config">,
  ): Runtime<Agents, State> {
    const clone = new Runtime<Agents, State>({
      ...options,
      // Copy inner runtime
      ...{ inner: this.inner },
    });

    return clone;
  }
}

class RuntimeInner<
  Agents extends { [name: string]: Runnable } = {},
  State extends ContextState = ContextState,
> {
  constructor(public options: RuntimeOptions<Agents, State>) {
    this.name = options.name || options.projectDefinition?.name;
    this.id =
      options.id || options.projectDefinition?.id || this.name || nanoid();
    this.config = options.config || {};
    this.state = options.state || ({} as State);

    OrderedRecord.push(
      this.runnableDefinitions,
      ...OrderedRecord.toArray(options.projectDefinition?.runnables),
    );

    this.container.register("pipeline_agent", { useClass: PipelineAgent });
    this.container.register("llm_agent", { useClass: LLMAgent });
    this.container.register("function_agent", { useClass: FunctionAgent });
    this.container.register("llm_decision_agent", {
      useClass: LLMDecisionAgent,
    });
    this.container.register("local_function_agent", {
      useClass: LocalFunctionAgent,
    });
    this.container.register("open_api_agent", { useClass: OpenAPIAgent });
    this.container.register("blocklet_api_agent", {
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
      this.container.register(type, { useClass: AgentV1 });
    }

    this.registerDependency(
      TYPES.functionRunner,
      options.functionRunner || QuickJSRunner,
    );
    this.registerDependency(
      TYPES.llmModel,
      options.llmModel || BlockletLLMModel,
    );
  }

  readonly id: string;

  readonly name?: string;

  config: RuntimeConfiguration;

  state: State;

  container: DependencyContainer = container.createChildContainer();

  runnableDefinitions: OrderedRecord<RunnableDefinition> =
    OrderedRecord.fromArray([]);

  private registerDependency<T>(
    token: string | symbol,
    dependency: Constructor<T> | T,
  ) {
    if (typeof dependency === "function")
      this.container.register(token, {
        useClass: dependency as Constructor<T>,
      });
    else this.container.register(token, { useValue: dependency });
  }
}
