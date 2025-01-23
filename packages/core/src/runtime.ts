import { produce } from "immer";
import { merge } from "lodash";
import { nanoid } from "nanoid";
import { type DependencyContainer, container, injectable } from "tsyringe";
import type { constructor as Constructor } from "tsyringe/dist/typings/types";
import { TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import { FunctionAgent } from "./function-agent";
import { LLMAgent } from "./llm-agent";
import { LLMDecisionAgent } from "./llm-decision-agent";
import type { LLMModel, LLMModelConfiguration } from "./llm-model";
import type { Memorable } from "./memorable";
import { OpenAPIAgent } from "./open-api-agent";
import { PipelineAgent } from "./pipeline-agent";
import { Runnable, type RunnableDefinition } from "./runnable";
import { SandboxFunctionAgent } from "./sandbox-function-agent";
import type { SandboxFunctionRunner } from "./sandbox-function-runner";
import { OrderedRecord } from "./utils/ordered-map";
import type { DeepPartial } from "./utils/partial";

export interface RuntimeConfiguration {
  llmModel?: LLMModelConfiguration;
}

export interface RuntimeOptions<
  Agents extends { [name: string]: Runnable },
  State extends ContextState,
> {
  id?: string;

  name?: string;

  config?: RuntimeConfiguration;

  state?: State;

  agents?: Agents;

  historyManager?: Memorable<{ input: object; output: object }>;

  llmModel?: LLMModel | Constructor<LLMModel>;

  sandboxFunctionRunner?:
    | SandboxFunctionRunner
    | Constructor<SandboxFunctionRunner>;
}

@injectable()
export class Runtime<
  Agents extends { [name: string]: Runnable } = {},
  State extends ContextState = ContextState,
> implements Context<State>
{
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

  protected inner: RuntimeInner<Agents, State>;

  get options() {
    return this.inner.options;
  }

  get id() {
    return this.inner.id;
  }

  get name() {
    return this.inner.name;
  }

  get historyManager() {
    return this.inner.options.historyManager;
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
    this.name = options.name;
    this.id = options.id || this.name || nanoid();
    this.config = options.config || {};
    this.state = options.state || ({} as State);

    this.container.register("pipeline_agent", { useClass: PipelineAgent });
    this.container.register("llm_agent", { useClass: LLMAgent });
    this.container.register("sandbox_function_agent", {
      useClass: SandboxFunctionAgent,
    });
    this.container.register("llm_decision_agent", {
      useClass: LLMDecisionAgent,
    });
    this.container.register("function_agent", {
      useClass: FunctionAgent,
    });
    this.container.register("open_api_agent", { useClass: OpenAPIAgent });

    if (options.sandboxFunctionRunner)
      this.registerDependency(
        TYPES.sandboxFunctionRunner,
        options.sandboxFunctionRunner,
      );
    if (options.llmModel)
      this.registerDependency(TYPES.llmModel, options.llmModel);
  }

  readonly id: string;

  readonly name?: string;

  config: RuntimeConfiguration;

  state: State;

  container: DependencyContainer = container.createChildContainer();

  runnableDefinitions: OrderedRecord<RunnableDefinition> =
    OrderedRecord.fromArray([]);

  registerDependency<T>(
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
