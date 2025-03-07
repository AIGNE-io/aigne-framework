import {
  Agent,
  type MemorableSearchOutput,
  type MemoryItemWithScore,
  type RunnableDefinition,
  TYPES,
  fetchOpenApi,
  formatOpenAPIRequest,
  schemaToDataType,
} from "@aigne/core";
import type {
  Context,
  ContextState,
  CreateRunnableMemory,
  DataSchema,
  FetchRequest,
  HTTPMethod,
  OpenAPIDataType,
  OpenAPIDataTypeSchema,
  OrderedRecord,
  SchemaToType,
} from "@aigne/core";
import { getComponentMountPoint } from "@blocklet/sdk/lib/component";
import config from "@blocklet/sdk/lib/config";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";
import { joinURL } from "ufo";

import { type BlockletOpenAPI, getBlockletOpenAPIs } from "../utils/blocklet-openapi";

let blockletAPIs: Promise<{ [id: string]: BlockletOpenAPI }> | undefined;

@injectable()
export class BlockletAPIAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> extends Agent<I, O, State, Memories> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: BlockletAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
  ) {
    super(definition, context);
  }

  async process(input: I): Promise<O> {
    const { apiId, inputs } = this.definition;

    if (!apiId) throw new Error("OpenAPI id is required");

    const blockletAPI = await getBlockletOpenAPI(apiId);

    if (!blockletAPI) throw new Error("Blocklet api not found.");

    const url = joinURL(
      config.env.appUrl,
      getComponentMountPoint(blockletAPI.did),
      blockletAPI.path,
    );

    const request = await formatOpenAPIRequest(
      {
        url,
        method: blockletAPI.method as HTTPMethod,
      },
      inputs,
      input,
    );

    const loginToken = this.context?.state.loginToken;
    const headers = loginToken
      ? { ...request.headers, Authorization: `Bearer ${loginToken}` }
      : request.headers;

    return this.fetch({ ...request, headers });
  }

  fetch(request: FetchRequest) {
    return fetchOpenApi<O>(request);
  }
}

export interface BlockletAgentDefinition extends RunnableDefinition {
  type: "blocklet_api_agent";

  apiId: string;

  inputs: OrderedRecord<OpenAPIDataType>;
}

export interface CreateBlockletAgentOptions<
  I extends { [name: string]: OpenAPIDataTypeSchema },
  O extends { [name: string]: DataSchema },
  State extends ContextState,
  Memories extends { [name: string]: CreateRunnableMemory<I> },
> {
  context?: Context<State>;

  id?: string;

  name?: string;

  inputs: I;

  outputs: O;

  memories?: Memories;

  apiId: string;
}

function create<
  I extends { [name: string]: OpenAPIDataTypeSchema },
  O extends { [name: string]: DataSchema },
  State extends ContextState,
  Memories extends { [name: string]: CreateRunnableMemory<I> },
>({
  context,
  ...options
}: CreateBlockletAgentOptions<I, O, State, Memories>): BlockletAPIAgent<
  SchemaToType<I>,
  SchemaToType<O>,
  State,
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> }
> {
  const agentId = options.id || options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  return new BlockletAPIAgent(
    {
      id: agentId,
      name: options.name,
      type: "blocklet_api_agent",
      inputs,
      outputs,
      apiId: options.apiId,
    },
    context,
  );
}

async function getBlockletOpenAPI(id: string): Promise<BlockletOpenAPI | undefined> {
  blockletAPIs ??= getBlockletOpenAPIs().then((apis) =>
    Object.fromEntries(apis.map((i) => [i.id, i])),
  );

  return (await blockletAPIs)[id];
}
