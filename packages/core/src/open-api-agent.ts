import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import {
  Agent,
  type AgentDefinition,
  type AgentMemories,
  type AgentPreloads,
  type AgentProcessInput,
  type CreateAgentInputSchema,
  type CreateAgentMemoriesSchema,
  type CreateAgentMemoriesType,
  type CreateAgentOptions,
  type CreateAgentOutputSchema,
  type CreateAgentPreloadsSchema,
  type CreateAgentPreloadsType,
} from "./agent";
import { TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import { type SchemaToType, schemaToDataType } from "./definitions/data-schema";
import { toRunnableMemories } from "./definitions/memory";
import type {
  AuthConfig,
  FetchRequest,
  HTTPMethod,
  OpenAPIDataType,
} from "./definitions/open-api";
import { preloadCreatorsToPreloads } from "./definitions/preload";
import type { RunnableInput, RunnableOutput } from "./runnable";
import type { OrderedRecord } from "./utils";
import { fetchOpenApi } from "./utils/fetch-open-api";
import { formatOpenAPIRequest } from "./utils/open-api-parameter";

@injectable()
export class OpenAPIAgent<
  I extends RunnableInput = RunnableInput,
  O extends RunnableOutput = RunnableOutput,
  State extends ContextState = ContextState,
  Preloads extends AgentPreloads = AgentPreloads,
  Memories extends AgentMemories = AgentMemories,
> extends Agent<I, O, State, Preloads, Memories> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: OpenAPIAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
  ) {
    super(definition, context);
  }

  async process(input: AgentProcessInput<I, Preloads, Memories>): Promise<O> {
    const { url, method = "get", auth, inputs } = this.definition;
    if (!url) throw new Error("API url is required");

    const request = await formatOpenAPIRequest(
      { url, method, auth },
      inputs,
      input,
    );

    return this.fetch(request);
  }

  async fetch<T>(request: FetchRequest): Promise<T> {
    return fetchOpenApi(request);
  }
}

export interface OpenAPIAgentDefinition extends AgentDefinition {
  type: "open_api_agent";

  inputs: OrderedRecord<OpenAPIDataType>;

  url: string;

  method?: HTTPMethod;

  auth?: AuthConfig;
}

function create<
  I extends CreateAgentInputSchema,
  O extends CreateAgentOutputSchema,
  State extends ContextState,
  Preloads extends CreateAgentPreloadsSchema<I>,
  Memories extends CreateAgentMemoriesSchema<I>,
>(
  options: CreateAgentOptions<I, O, State, Preloads, Memories> & {
    url: string;
    method?: HTTPMethod;
    auth?: AuthConfig;
  },
): OpenAPIAgent<
  SchemaToType<I>,
  SchemaToType<O>,
  State,
  CreateAgentPreloadsType<I, Preloads>,
  CreateAgentMemoriesType<I, Memories>
> {
  const agentId = options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  const preloads = preloadCreatorsToPreloads(inputs, options.preloads);
  const memories = toRunnableMemories(agentId, inputs, options.memories || {});

  return new OpenAPIAgent(
    {
      id: agentId,
      name: options.name,
      type: "open_api_agent",
      inputs,
      preloads,
      memories,
      outputs,
      url: options.url,
      method: options.method,
      auth: options.auth,
    },
    options.context,
  );
}
