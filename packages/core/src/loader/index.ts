import { AFS, type AFSContext, type AFSContextPreset, type AFSDriver, type AFSModule } from "@aigne/afs";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import { Agent, type AgentHooks, type AgentOptions } from "../agents/agent.js";
import type { ChatModel } from "../agents/chat-model.js";
import type { ImageModel } from "../agents/image-model.js";
import type { AIGNEOptions } from "../aigne/aigne.js";
import type { AIGNECLIAgent } from "../aigne/type.js";
import type { MemoryAgent, MemoryAgentOptions } from "../memory/memory.js";
import { isAgent } from "../utils/agent-utils.js";
import {
  flat,
  isNil,
  isNonNullable,
  omitBy,
  type PromiseOrValue,
  tryOrThrow,
} from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import {
  type AFSContextPresetSchema,
  type HooksSchema,
  loadAgentFromYamlFile,
  type NestAgentSchema,
} from "./agent-yaml.js";
import { builtinAgents } from "./agents.js";
import { camelizeSchema, chatModelSchema, imageModelSchema, optionalize } from "./schema.js";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

export interface LoadOptions {
  memories?: { new (parameters?: MemoryAgentOptions): MemoryAgent }[];
  model?:
    | ChatModel
    | ((model?: z.infer<typeof aigneFileSchema>["model"]) => PromiseOrValue<ChatModel | undefined>);
  imageModel?:
    | ImageModel
    | ((
        model?: z.infer<typeof aigneFileSchema>["imageModel"],
      ) => PromiseOrValue<ImageModel | undefined>);
  afs?: {
    sharedAFS?: AFS;
    availableModules?: {
      module: string;
      alias?: string[];
      create: (options?: Record<string, any>) => PromiseOrValue<AFSModule>;
    }[];
    availableDrivers?: {
      driver: string;
      alias?: string[];
      create: (options?: Record<string, any>) => PromiseOrValue<AFSDriver>;
    }[];
  };
  aigne?: z.infer<typeof aigneFileSchema>;
  require?: (modulePath: string, options: { parent?: string }) => Promise<any>;
}

export interface AgentLoadOptions extends LoadOptions {
  loadNestAgent: (
    path: string,
    agent: NestAgentSchema,
    options: LoadOptions,
    agentOptions?: AgentOptions<any, any> & Record<string, unknown>,
  ) => Promise<Agent>;
}

export async function load(path: string, options: LoadOptions = {}): Promise<AIGNEOptions> {
  const { aigne, rootDir } = await loadAIGNEFile(path);

  const flatCliAgents = (cliAgent: CliAgent): string[] => {
    if (typeof cliAgent === "string") return [cliAgent];
    return flat(cliAgent.url, cliAgent.agents?.flatMap(flatCliAgents));
  };

  const allAgentPaths = new Set(
    flat(
      aigne.agents,
      aigne.skills,
      aigne.mcpServer?.agents,
      aigne.cli?.chat,
      aigne.cli?.agents?.flatMap((i) => (typeof i === "string" ? i : flatCliAgents(i))),
    ).map((i) => nodejs.path.join(rootDir, i)),
  );

  const allAgents: { [path: string]: Agent } = {};

  for (const path of allAgentPaths) {
    allAgents[path] = await loadAgent(path, { ...options, aigne });
  }

  const pickAgent = (path: string) => allAgents[nodejs.path.join(rootDir, path)];

  const pickAgents = (paths: string[]) =>
    paths.map((filename) => pickAgent(filename)).filter(isNonNullable);

  const mapCliAgents = (cliAgent: CliAgent): AIGNECLIAgent => {
    if (typeof cliAgent === "string") return { agent: pickAgent(cliAgent) };

    return {
      ...cliAgent,
      agent: cliAgent.url ? pickAgent(cliAgent.url) : undefined,
      agents: cliAgent.agents?.map(mapCliAgents),
    };
  };

  return {
    ...aigne,
    rootDir,
    model: typeof options.model === "function" ? await options.model(aigne.model) : options.model,
    imageModel:
      typeof options.imageModel === "function"
        ? aigne.imageModel
          ? await options.imageModel(aigne.imageModel)
          : undefined
        : options.imageModel,
    agents: pickAgents(aigne.agents ?? []),
    skills: pickAgents(aigne.skills ?? []),
    mcpServer: {
      agents: pickAgents(aigne.mcpServer?.agents ?? []),
    },
    cli: {
      chat: aigne.cli?.chat ? pickAgents([aigne.cli.chat])[0] : undefined,
      agents: aigne.cli?.agents?.map(mapCliAgents),
    },
  };
}

export async function loadAgent(
  path: string,
  options: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  if ([".js", ".mjs", ".ts", ".mts"].includes(nodejs.path.extname(path))) {
    const agent = await loadAgentFromJsFile(path, options);
    if (agent instanceof Agent) return agent;
    return parseAgent(path, agent, options, agentOptions);
  }

  if ([".yml", ".yaml"].includes(nodejs.path.extname(path))) {
    const agent = await loadAgentFromYamlFile(path, options);

    return parseAgent(path, agent, options, agentOptions);
  }

  throw new Error(`Unsupported agent file type: ${path}`);
}

export async function loadNestAgent(
  path: string,
  agent: NestAgentSchema,
  options: LoadOptions,
  agentOptions?: AgentOptions<any, any> & Record<string, unknown>,
): Promise<Agent> {
  return typeof agent === "object" && "type" in agent
    ? parseAgent(path, agent, options, agentOptions)
    : typeof agent === "string"
      ? loadAgent(nodejs.path.join(nodejs.path.dirname(path), agent), options, agentOptions)
      : loadAgent(nodejs.path.join(nodejs.path.dirname(path), agent.url), options, {
          ...agentOptions,
          defaultInput: agent.defaultInput,
          hooks: await parseHooks(path, agent.hooks, options),
        });
}

async function parseHooks(
  path: string,
  hooks: HooksSchema | HooksSchema[] | undefined,
  options: LoadOptions,
): Promise<AgentHooks[] | undefined> {
  hooks = [hooks].flat().filter(isNonNullable);
  if (!hooks.length) return undefined;

  type AllHooks = Required<AgentHooks>;

  return await Promise.all(
    hooks.map(
      async (hook): Promise<{ [key in keyof AllHooks]: AllHooks[key] | undefined }> => ({
        priority: hook.priority,
        onStart: hook.onStart ? await loadNestAgent(path, hook.onStart, options) : undefined,
        onSuccess: hook.onSuccess ? await loadNestAgent(path, hook.onSuccess, options) : undefined,
        onError: hook.onError ? await loadNestAgent(path, hook.onError, options) : undefined,
        onEnd: hook.onEnd ? await loadNestAgent(path, hook.onEnd, options) : undefined,
        onSkillStart: hook.onSkillStart
          ? await loadNestAgent(path, hook.onSkillStart, options)
          : undefined,
        onSkillEnd: hook.onSkillEnd
          ? await loadNestAgent(path, hook.onSkillEnd, options)
          : undefined,
        onHandoff: hook.onHandoff ? await loadNestAgent(path, hook.onHandoff, options) : undefined,
      }),
    ),
  );
}

async function loadSkills(
  path: string,
  skills: NestAgentSchema[],
  options: LoadOptions,
): Promise<Agent[]> {
  const loadedSkills: Agent[] = [];
  for (const skill of skills) {
    loadedSkills.push(await loadNestAgent(path, skill, options));
  }
  return loadedSkills;
}

export async function parseAgent(
  path: string,
  agent: Awaited<ReturnType<typeof loadAgentFromYamlFile>>,
  options: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  if (isAgent(agent)) return agent;

  const memory =
    "memory" in agent && options?.memories?.length
      ? await loadMemory(
          options.memories,
          typeof agent.memory === "object" ? agent.memory.provider : undefined,
          typeof agent.memory === "object" ? agent.memory : {},
        )
      : undefined;

  let afs: AFS | undefined;
  if (agent.afs !== false && (!agent.afs || agent.afs === true) && options?.afs?.sharedAFS) {
    afs = options.afs.sharedAFS;
  } else if (agent.afs === true) {
    afs = new AFS();
  } else if (agent.afs) {
    // Create modules
    const modules: AFSModule[] = [];
    for (const m of agent.afs.modules || []) {
      const moduleName = typeof m === "string" ? m : m.module;

      const mod = options?.afs?.availableModules?.find(
        (mod) => mod.module === moduleName || mod.alias?.includes(moduleName),
      );
      if (!mod) throw new Error(`AFS module not found: ${typeof m === "string" ? m : m.module}`);

      const module = await mod.create(typeof m === "string" ? {} : m.options);
      modules.push(module);
    }

    // Create drivers
    const drivers: AFSDriver[] = [];
    for (const d of agent.afs.drivers || []) {
      const driverName = typeof d === "string" ? d : d.driver;

      const drv = options?.afs?.availableDrivers?.find(
        (drv) => drv.driver === driverName || drv.alias?.includes(driverName),
      );
      if (!drv) throw new Error(`AFS driver not found: ${typeof d === "string" ? d : d.driver}`);

      const driver = await drv.create(typeof d === "string" ? {} : d.options);
      drivers.push(driver);
    }

    // Create AFS with modules, drivers, and storage options
    afs = new AFS({
      modules,
      drivers,
      storage: agent.afs.storage,
    });

    // Load and configure AFSContext presets
    const loadAFSContextPresets = async (
      presets: Record<string, AFSContextPresetSchema>,
    ): Promise<Record<string, AFSContextPreset>> => {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(presets).map<Promise<[string, AFSContextPreset]>>(async ([key, value]) => {
            const [select, per, dedupe] = await Promise.all(
              [value.select, value.per, value.dedupe].map(async (item) => {
                if (!item?.agent) return undefined;
                const agent = await loadNestAgent(path, item.agent, options, { afs });
                return {
                  invoke: (input: any, options: any) =>
                    options.context.invoke(agent, input, {
                      ...options,
                      streaming: false,
                    }),
                };
              }),
            );

            return [key, { ...value, select, per, dedupe }];
          }),
        ),
      );
    };

    const context: AFSContext = {
      search: {
        presets: await loadAFSContextPresets(agent.afs.context?.search?.presets || {}),
      },
      list: {
        presets: await loadAFSContextPresets(agent.afs.context?.list?.presets || {}),
      },
    };

    afs.options.context = context;
  }

  const skills =
    "skills" in agent && agent.skills
      ? await loadSkills(path, agent.skills, {
          ...options,
          afs: { ...options?.afs, sharedAFS: (agent.shareAFS && afs) || options?.afs?.sharedAFS },
        })
      : [];

  const model =
    agent.model && typeof options?.model === "function"
      ? await options.model({ ...options.aigne?.model, ...omitBy(agent.model, (v) => isNil(v)) })
      : undefined;
  const imageModel =
    agent.imageModel && typeof options?.imageModel === "function"
      ? await options.imageModel({
          ...options.aigne?.imageModel,
          ...omitBy(agent.imageModel, (v) => isNil(v)),
        })
      : undefined;

  const baseOptions: AgentOptions<any, any> = {
    ...agentOptions,
    ...agent,
    model,
    imageModel,
    memory,
    hooks: [
      ...((await parseHooks(path, agent.hooks, options)) ?? []),
      ...[agentOptions?.hooks].flat().filter(isNonNullable),
    ],
    skills: [...(agentOptions?.skills || []), ...skills],
    afs: afs || agentOptions?.afs,
  };

  let agentClass = builtinAgents[agent.type];

  if (!agentClass) {
    if (!options?.require)
      throw new Error(
        `Module loader is not provided to load agent type module ${agent.type} from ${path}`,
      );
    const Mod = await options.require(agent.type, { parent: path });
    if (typeof Mod?.default?.prototype?.constructor !== "function") {
      throw new Error(`The agent type module ${agent.type} does not export a default Agent class`);
    }

    agentClass = Mod.default;
  }

  if (!agentClass) {
    throw new Error(`Unsupported agent type: ${agent.type} from ${path}`);
  }

  return await agentClass.load({
    filepath: path,
    parsed: baseOptions,
    options: { ...options, loadNestAgent },
  });
}

async function loadMemory(
  memories: NonNullable<LoadOptions["memories"]>,
  provider?: string,
  options?: MemoryAgentOptions,
) {
  const M = !provider
    ? memories[0]
    : memories.find((i) => i.name.toLowerCase().includes(provider.toLowerCase()));
  if (!M) throw new Error(`Unsupported memory: ${provider}`);

  return new M(options);
}

type CliAgent =
  | string
  | {
      url?: string;
      name?: string;
      alias?: string[];
      description?: string;
      agents?: CliAgent[];
    };

const cliAgentSchema: ZodType<CliAgent> = z.union([
  z.string(),
  z.object({
    url: optionalize(z.string()),
    name: optionalize(z.string()),
    alias: optionalize(z.array(z.string())),
    description: optionalize(z.string()),
    agents: optionalize(z.array(z.lazy(() => cliAgentSchema))),
  }),
]);

const aigneFileSchema = camelizeSchema(
  z.object({
    name: optionalize(z.string()),
    description: optionalize(z.string()),
    model: optionalize(chatModelSchema),
    imageModel: optionalize(imageModelSchema),
    agents: optionalize(z.array(z.string())),
    skills: optionalize(z.array(z.string())),
    mcpServer: optionalize(
      z.object({
        agents: optionalize(z.array(z.string())),
      }),
    ),
    cli: optionalize(
      z.object({
        chat: optionalize(z.string()),
        agents: optionalize(z.array(cliAgentSchema)),
      }),
    ),
  }),
);

export async function loadAIGNEFile(path: string): Promise<{
  aigne: z.infer<typeof aigneFileSchema>;
  rootDir: string;
}> {
  const file = await findAIGNEFile(path);

  const raw = await tryOrThrow(
    () => nodejs.fs.readFile(file, "utf8"),
    (error) => new Error(`Failed to load aigne.yaml from ${file}: ${error.message}`),
  );

  const json = tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse aigne.yaml from ${file}: ${error.message}`),
  );

  const aigne = tryOrThrow(
    () =>
      aigneFileSchema.parse({ ...json, model: json.model || json.chatModel || json.chat_model }),
    (error) => new Error(`Failed to validate aigne.yaml from ${file}: ${error.message}`),
  );

  return { aigne, rootDir: nodejs.path.dirname(file) };
}

export async function findAIGNEFile(path: string): Promise<string> {
  const possibleFiles = AIGNE_FILE_NAME.includes(nodejs.path.basename(path))
    ? [path]
    : AIGNE_FILE_NAME.map((name) => nodejs.path.join(path, name));

  for (const file of possibleFiles) {
    try {
      const stat = await nodejs.fs.stat(file);

      if (stat.isFile()) return file;
    } catch {}
  }

  throw new Error(
    `aigne.yaml not found in ${path}. Please ensure you are in the correct directory or provide a valid path.`,
  );
}
