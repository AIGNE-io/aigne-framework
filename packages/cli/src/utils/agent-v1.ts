import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { glob } from "glob";
import { parse, stringify } from "yaml";

export async function isV1Package(src: string) {
  return stat(join(src, "project.yaml"))
    .then((res) => res.isFile())
    .catch((error) => {
      if (error.code === "ENOENT") return false;
      throw error;
    });
}

export async function toAIGNEPackage(src: string, dst: string) {
  const definition = await loadAgentV1Package(src);

  const aigne = {
    chat_model: {
      name: "gpt-4o-mini", // TODO: get from config
    },
    agents: <string[]>[],
  };

  for (const agent of definition.agents) {
    const { content } = await assistantToAigneV2(agent, definition);
    const filename = getAgentFilename(agent);
    await writeFile(join(dst, filename), content);
    aigne.agents.push(filename);
  }

  await writeFile(join(dst, "aigne.yaml"), stringify(aigne));
}

async function loadAgentV1Package(path: string) {
  const agentFilePaths = await glob("prompts/**/*.yaml", {
    cwd: path,
  });

  const project: ProjectDefinitionV1["project"] = parse(
    await readFile(join(path, "project.yaml"), "utf8"),
  );

  const definition: ProjectDefinitionV1 = {
    project,
    agents: [],
  };

  for (const filename of agentFilePaths) {
    const agent = parse(await readFile(join(path, filename), "utf8"));
    definition.agents.push(agent);
  }

  return definition;
}

function assistantToAigneV2(agent: AgentV1, project: ProjectDefinitionV1) {
  const converter = AGENT_MAP[agent.type];

  if (!converter) throw new Error(`Unsupported agent type: ${agent.type}`);

  return converter(agent, project);
}

const AGENT_MAP: {
  [key: string]: (
    agent: AgentV1,
    project: ProjectDefinitionV1,
  ) => Promise<{ content: string }> | { content: string };
} = {
  prompt: (agent: AgentV1) => {
    if (agent.type !== "prompt")
      throw new Error(`Expected agent type 'prompt', but got '${agent.type}'`);

    const obj = {
      name: agent.name || agent.id,
      description: agent.description,
      input_schema: convertInputSchema(agent),
      output_schema: convertOutputSchema(agent),
      instructions: agent.prompts
        ?.filter(
          (i): i is Extract<Prompt, { type: "message" }> =>
            i.visibility !== "hidden" && i.type === "message",
        )
        .map((i) => i.data.content) // TODO: should support multiple messages with different roles
        .join("\n"),
    };

    return {
      content: stringify(obj),
    };
  },
  function: async (agent: AgentV1) => {
    if (agent.type !== "function")
      throw new Error(`Expected agent type 'function', but got '${agent.type}'`);

    const inputNames = agent.parameters?.map((i) => i.key).filter(Boolean) ?? [];

    return {
      content: await formatCode(`\
export default async function agent({${inputNames.join(", ")}}) {
${agent.code}
}

agent.agent_name = ${JSON.stringify(agent.name || agent.id)};

agent.description = ${agent.description ? JSON.stringify(agent.description) : "undefined"};

agent.input_schema = ${JSON.stringify(convertInputSchema(agent))};

agent.output_schema = ${JSON.stringify(convertOutputSchema(agent))};
`),
    };
  },
  router: (agent: AgentV1, project: ProjectDefinitionV1) => {
    if (agent.type !== "router")
      throw new Error(`Expected agent type 'router', but got '${agent.type}'`);

    return {
      content: stringify({
        name: agent.name || agent.id,
        description: agent.description,
        instructions: agent.prompt,
        input_schema: convertInputSchema(agent),
        output_schema: convertOutputSchema(agent),
        tools: agent.routes?.map((i) => {
          const tool = project.agents.find((j) => j.id === i.id);
          if (!tool) throw new Error(`Tool ${i.id} not found in project definition`);
          return getAgentFilename(tool);
        }),
        tool_choice: "router",
      }),
    };
  },
};

function getAgentFilename(agent: AgentV1) {
  switch (agent.type) {
    case "prompt":
    case "router":
      return `${agent.name || agent.id}.yaml`;
    case "function":
      return `${agent.name || agent.id}.js`;
    default:
      throw new Error(`Unsupported agent type: ${agent.type}`);
  }
}

async function formatCode(code: string) {
  const [prettier, typescriptPlugin, estreePlugin] = await Promise.all([
    import("prettier"),
    import("prettier/plugins/typescript"),
    import("prettier/plugins/estree"),
  ]);

  return prettier.format(code, {
    parser: "typescript",
    plugins: [typescriptPlugin, estreePlugin.default],
    printWidth: 120,
    useTabs: false,
    tabWidth: 2,
    trailingComma: "es5",
    bracketSameLine: true,
    semi: true,
    singleQuote: true,
  });
}

function convertInputSchema(agent: AgentV1) {
  const parameters = (agent.parameters ?? []).filter((i) => !!i.key && !i.hidden);

  const properties = parameters.map((i) => [i.key, parameterToJsonSchema(i)]);

  return {
    type: "object",
    properties: Object.fromEntries(properties),
    required: parameters.filter((i) => i.required).map((i) => i.key),
  };
}

function parameterToJsonSchema(parameter: Parameter): object | undefined {
  switch (parameter.type) {
    case undefined:
    case "string":
    case "language":
      return {
        type: "string",
        description: parameter.placeholder,
      };
    case "select":
      return {
        type: "string",
        enum: parameter.options?.map((i) => i.value),
        description: parameter.placeholder,
      };
    case "number":
    case "boolean":
      return {
        type: parameter.type,
        description: parameter.placeholder,
      };
    default:
      throw new Error(`Unsupported parameter type: ${(parameter as Record<string, string>).type}`);
  }
}

function convertOutputSchema(agent: AgentV1) {
  const outputs = agent.outputVariables?.filter((i) => !!i.name && !i.hidden) ?? [];
  const properties = outputs
    .map((i) => [i.name, variableTypeToJsonSchema(i)])
    .filter((i) => !!i[1]);
  return {
    type: "object",
    properties: Object.fromEntries(properties),
    required: outputs.filter((i) => i.required).map((i) => i.name),
  };
}

function variableTypeToJsonSchema(output: OutputVariable): object | undefined {
  if (output.type === "object") {
    if (!output.properties) return undefined;

    return {
      type: "object",
      properties: Object.fromEntries(
        output.properties
          .filter((i): i is typeof i & { name: string } => !!i.name)
          .map((i) => [i.name, variableTypeToJsonSchema(i)])
          .filter((i) => !!i[1]),
      ),
      required: output.properties.filter((i) => i.required && i.name).map((i) => i.name),
    };
  }

  if (output.type === "array") {
    if (!output.element) return undefined;

    return {
      type: "array",
      items: variableTypeToJsonSchema(output.element),
    };
  }

  return {
    type: output.type || "string",
    description: output.description,
  };
}

export type Parameter = {
  id: string;
  key?: string;
  hidden?: boolean;
  required?: boolean;
  placeholder?: string;
} & (
  | {
      type?: "string" | "number" | "boolean" | "language";
    }
  | {
      type?: "select";
      options?: {
        id: string;
        label?: string;
        value?: string;
      }[];
    }
);

export interface VariableTypeBase {
  id: string;
  name?: string;
  description?: string;
  required?: boolean;
  hidden?: boolean;
}

export type OutputVariable = VariableTypeBase &
  (
    | {
        type?: undefined;
      }
    | {
        type: "string";
        defaultValue?: string;
      }
    | {
        type: "number";
        defaultValue?: number;
      }
    | {
        type: "boolean";
        defaultValue?: boolean;
      }
    | {
        type: "object";
        properties?: OutputVariable[];
      }
    | {
        type: "array";
        element?: OutputVariable;
      }
  );

export type AgentV1 = {
  id: string;
  name?: string;
  description?: string;
  parameters?: Parameter[];
  outputVariables?: OutputVariable[];
} & (
  | {
      type: "prompt";
      prompts?: Prompt[];
      temperature?: number;
      topP?: number;
      presencePenalty?: number;
      frequencyPenalty?: number;
      maxTokens?: number;
      model?: string;
    }
  | {
      type: "router";
      defaultToolId?: string;
      prompt?: string;
      decisionType?: "ai";
      routes?: Tool[];
      temperature?: number;
      topP?: number;
      presencePenalty?: number;
      frequencyPenalty?: number;
      maxTokens?: number;
      model?: string;
    }
  | {
      type: "image";
      prompt?: string;
      model?: string;
      n?: number;
      quality?: string;
      style?: string;
      size?: string;
      modelSettings?: {
        [key: string]: unknown;
      };
    }
  | {
      type: "api";
      requestParameters?: {
        id: string;
        key?: string;
        value?: string;
      }[];
      requestMethod?: string;
      requestUrl?: string;
      requestHeaders: {
        id: string;
        key?: string;
        value?: string;
      }[];
    }
  | {
      type: "function";
      code?: string;
    }
  | {
      type: "callAgent";
      agents?: Tool[];
    }
);

export interface ProjectDefinitionV1 {
  project: {
    name?: string;
    description?: string;
  };
  agents: AgentV1[];
}

export type Prompt =
  | {
      type: "message";
      data: PromptMessage;
      visibility?: "hidden";
    }
  | {
      type: "executeBlock";
      visibility?: "hidden";
    };

export type PromptMessage = {
  id: string;
  role: Role;
  content?: string;
  name?: string;
};

export type Role = "system" | "user" | "assistant";

export type Tool = {
  blockletDid?: string;
  projectId?: string;
  id: string;
  from?: "assistant" | "blockletAPI" | "knowledge";
  parameters?: {
    [key: string]: unknown;
  };
  functionName?: string;
};
