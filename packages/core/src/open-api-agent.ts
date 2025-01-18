import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import { Agent } from "./agent";
import { TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import {
  type DataTypeSchema,
  type SchemaMapType,
  schemaToDataType,
} from "./definitions/data-type-schema";
import type { CreateRunnableMemory } from "./definitions/memory";
import type {
  AuthConfig,
  FetchRequest,
  HTTPMethod,
  OpenAPIDataType,
  OpenAPIDataTypeSchema,
} from "./definitions/open-api";
import type { MemorableSearchOutput, MemoryItemWithScore } from "./memorable";
import type { RunnableDefinition } from "./runnable";
import type { OrderedRecord } from "./utils";
import { fetchOpenApi } from "./utils/fetch-open-api";
import { formatOpenAPIRequest } from "./utils/open-api-parameter";

@injectable()
export class OpenAPIAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends Agent<I, O, Memories, State> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: OpenAPIAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
  ) {
    super(definition, context);
  }

  async process(input: I): Promise<O> {
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

export interface OpenAPIAgentDefinition extends RunnableDefinition {
  type: "open_api_agent";

  inputs: OrderedRecord<OpenAPIDataType>;

  url: string;

  method?: HTTPMethod;

  auth?: AuthConfig;
}

export interface CreateOpenAPIAgentOptions<
  I extends { [name: string]: OpenAPIDataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  State extends ContextState,
> {
  context?: Context<State>;

  id?: string;

  name?: string;

  inputs: I;

  outputs: O;

  memories?: Memories;

  url: string;
  method?: HTTPMethod;
  auth?: AuthConfig;
}

function create<
  I extends { [name: string]: OpenAPIDataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  State extends ContextState,
>({
  context,
  ...options
}: CreateOpenAPIAgentOptions<I, O, Memories, State>): OpenAPIAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> },
  State
> {
  const agentId = options.id || options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  return new OpenAPIAgent(
    {
      id: agentId,
      name: options.name,
      type: "open_api_agent",
      inputs,
      outputs,
      url: options.url,
      method: options.method,
      auth: options.auth,
    },
    context,
  );
}
