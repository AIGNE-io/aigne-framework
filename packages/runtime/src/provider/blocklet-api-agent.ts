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
  DataTypeSchema,
  FetchRequest,
  HTTPMethod,
  OpenAPIDataType,
  OpenAPIDataTypeSchema,
  OrderedRecord,
  SchemaMapType,
} from "@aigne/core";
import { getComponentMountPoint } from "@blocklet/sdk/lib/component";
import config from "@blocklet/sdk/lib/config";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";
import { joinURL } from "ufo";

import {
  type BlockletOpenAPI,
  getBlockletOpenAPIs,
} from "../utils/blocklet-openapi";

let blockletAPIs: Promise<{ [id: string]: BlockletOpenAPI }> | undefined;

@injectable()
export class BlockletAPIAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends Agent<I, O, Memories, State> {
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

  apiId: string;
}

function create<
  I extends { [name: string]: OpenAPIDataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  State extends ContextState,
>({
  context,
  ...options
}: CreateBlockletAgentOptions<I, O, Memories, State>): BlockletAPIAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> },
  State
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

async function getBlockletOpenAPI(
  id: string,
): Promise<BlockletOpenAPI | undefined> {
  blockletAPIs ??= getBlockletOpenAPIs().then((apis) =>
    Object.fromEntries(apis.map((i) => [i.id, i])),
  );

  return (await blockletAPIs)[id];
}
