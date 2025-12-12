import { fstat } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { isatty } from "node:tty";
import { promisify } from "node:util";
import {
  availableImageModels,
  availableModels,
  type LoadableImageModel,
  type LoadableModel,
} from "@aigne/aigne-hub";
import {
  type Agent,
  AIAgent,
  ChatModel,
  DEFAULT_OUTPUT_KEY,
  type FileUnionContent,
  type Message,
  readAllString,
} from "@aigne/core";
import { getLevelFromEnv, LogLevel, logger } from "@aigne/core/utils/logger.js";
import { flat, pick, tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { parse } from "yaml";
import type { Argv } from "yargs";
import z, {
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodError,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodType,
  ZodUnknown,
} from "zod";

export type InferArgv<T> = T extends Argv<infer U> ? U : never;

const MODEL_OPTIONS_GROUP_NAME = "Model Options";

export const withRunAgentCommonOptions = (yargs: Argv) =>
  yargs
    .option("chat", {
      describe: "Run chat loop in terminal",
      type: "boolean",
      default: false,
    })
    .option("model", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe: `AI model to use in format 'provider[/model]' where model is optional. Examples: 'openai' or 'openai/gpt-4o-mini'. Available providers: ${formatModelsName(
        availableModels(),
      )} (default: openai)`,
      type: "string",
    })
    .option("image-model", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe: `Image model to use in format 'provider[/model]' where model is optional. Examples: 'openai' or 'openai/gpt-image-1'. Available providers: ${formatModelsName(
        availableImageModels(),
      )} (default: openai)`,
      type: "string",
    })
    .option("temperature", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe:
        "Temperature for the model (controls randomness, higher values produce more random outputs). Range: 0.0-2.0",
      type: "number",
      coerce: customZodError("--temperature", (s) => z.coerce.number().min(0).max(2).parse(s)),
    })
    .option("top-p", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe:
        "Top P (nucleus sampling) parameter for the model (controls diversity). Range: 0.0-1.0",
      type: "number",
      coerce: customZodError("--top-p", (s) => z.coerce.number().min(0).max(1).parse(s)),
    })
    .option("presence-penalty", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe:
        "Presence penalty for the model (penalizes repeating the same tokens). Range: -2.0 to 2.0",
      type: "number",
      coerce: customZodError("--presence-penalty", (s) =>
        z.coerce.number().min(-2).max(2).parse(s),
      ),
    })
    .option("frequency-penalty", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe:
        "Frequency penalty for the model (penalizes frequency of token usage). Range: -2.0 to 2.0",
      type: "number",
      coerce: customZodError("--frequency-penalty", (s) =>
        z.coerce.number().min(-2).max(2).parse(s),
      ),
    })
    .option("input", {
      describe: "Input to the agent, use @<file> to read from a file",
      type: "string",
      array: true,
      alias: "i",
    })
    .option("input-file", {
      describe: "Input files to the agent",
      type: "string",
      array: true,
    })
    .option("format", {
      describe: "Input format for the agent (available: text, json, yaml default: text)",
      type: "string",
      choices: ["text", "json", "yaml"],
    })
    .option("output", {
      describe: "Output file to save the result (default: stdout)",
      type: "string",
      alias: "o",
    })
    .option("output-key", {
      describe: "Key in the result to save to the output file",
      type: "string",
      default: DEFAULT_OUTPUT_KEY,
    })
    .option("force", {
      describe:
        "Truncate the output file if it exists, and create directory if the output path does not exists",
      type: "boolean",
      default: false,
    })
    .option("log-level", {
      describe: `Log level for detailed debugging information. Values: ${Object.values(LogLevel).join(", ")}`,
      type: "string",
      default: getLevelFromEnv(logger.options.ns) || LogLevel.SILENT,
      coerce: customZodError("--log-level", (s) => z.nativeEnum(LogLevel).parse(s)),
    })
    .option("aigne-hub-url", {
      group: MODEL_OPTIONS_GROUP_NAME,
      describe: "Custom AIGNE Hub service URL. Used to fetch remote agent definitions or models.",
      type: "string",
    });

function formatModelsName(models: (LoadableModel | LoadableImageModel)[]): string {
  return models
    .map((i) => {
      if (typeof i.name === "string") {
        return i.name.toLowerCase().replace(/ChatModel$/i, "");
      }
      return i.name.map((n) => n.toLowerCase().replace(/ChatModel$/i, ""));
    })
    .join(", ");
}

type _AgentRunCommonOptions = Partial<InferArgv<ReturnType<typeof withAgentInputSchema>>>;

/** Convert literal string types like 'foo-bar' to 'FooBar' */
type PascalCase<S extends string> = string extends S
  ? string
  : S extends `${infer T}-${infer U}`
    ? `${Capitalize<T>}${PascalCase<U>}`
    : Capitalize<S>;

/** Convert literal string types like 'foo-bar' to 'fooBar' */
type CamelCase<S extends string> = string extends S
  ? string
  : S extends `${infer T}-${infer U}`
    ? `${T}${PascalCase<U>}`
    : S;

/** Convert literal string types like 'foo-bar' to 'fooBar', allowing all `PropertyKey` types */
type CamelCaseKey<K extends PropertyKey> = K extends string ? Exclude<CamelCase<K>, ""> : K;

export type AgentRunCommonOptions = {
  [key in keyof _AgentRunCommonOptions as CamelCaseKey<key>]: _AgentRunCommonOptions[key];
};

export function inferZodType(
  type: ZodType,
  opts: { array?: boolean; optional?: boolean } = {},
): {
  type: "string" | "number" | "boolean";
  array?: boolean;
  optional?: boolean;
} {
  if (type instanceof ZodUnknown || type instanceof ZodAny) {
    return { type: "string", optional: true };
  }

  opts.optional ??= type.isNullable() || type.isOptional();

  if ("innerType" in type._def && type._def.innerType instanceof ZodType) {
    return inferZodType(type._def.innerType, opts);
  }

  if (type instanceof ZodArray) {
    return inferZodType(type.element, { ...opts, array: true });
  }

  return {
    ...opts,
    array: opts.array || undefined,
    optional: opts.optional || undefined,
    type: type instanceof ZodBoolean ? "boolean" : type instanceof ZodNumber ? "number" : "string",
  };
}

export function withAgentInputSchema(
  yargs: Argv,
  options: Pick<Agent, "inputSchema"> & { optionalInputs?: string[] },
) {
  const inputSchema: { [key: string]: ZodType } =
    options.inputSchema instanceof ZodObject ? options.inputSchema.shape : {};

  for (const [option, config] of Object.entries(inputSchema)) {
    const type = inferZodType(config);

    yargs.option(option, {
      group: "Agent Parameters",
      type: type.type,
      description: config.description,
      array: type.array,
    });

    if (!type.optional && !options.optionalInputs?.includes(option)) {
      yargs.demandOption(option);
    }
  }

  return withRunAgentCommonOptions(yargs);
}

export async function parseAgentInput(i: Message & AgentRunCommonOptions, agent: Agent) {
  const inputSchema: { [key: string]: ZodType } =
    agent.inputSchema instanceof ZodObject ? agent.inputSchema.shape : {};

  const input = Object.fromEntries(
    await Promise.all(
      Object.entries(pick(i, Object.keys(inputSchema))).map(async ([key, val]) => {
        if (typeof val === "string" && val.startsWith("@")) {
          const schema = inputSchema[key];

          val = await readFileAsInput(val, {
            format: schema instanceof ZodString ? "raw" : undefined,
          });
        }

        return [key, val];
      }),
    ),
  );

  if (agent instanceof AIAgent && agent.inputFileKey) {
    const files: FileUnionContent[] = [];
    for (const file of flat(i.inputFile, i[agent.inputFileKey] as string[]) ?? []) {
      const raw = await readFile(file.replace(/^@/, ""), "base64");
      const filename = basename(file);
      const mimeType = (await ChatModel.getMimeType(filename)) || "application/octet-stream";
      files.push({ type: "file", data: raw, filename, mimeType });
    }

    Object.assign(input, { [agent.inputFileKey]: files });
  }

  const rawInput =
    i.input ||
    (isatty(process.stdin.fd) || !(await stdinHasData())
      ? null
      : [await readAllString(process.stdin)].filter(Boolean));

  if (rawInput) {
    for (const raw of rawInput) {
      const parsed = raw.startsWith("@") ? await readFileAsInput(raw, { format: i.format }) : raw;

      if (typeof parsed !== "string") {
        Object.assign(input, parsed);
      } else {
        const inputKey = agent instanceof AIAgent ? agent.inputKey : undefined;
        if (inputKey) {
          Object.assign(input, { [inputKey]: parsed });
        }
      }
    }
  }

  return input;
}

async function readFileAsInput(
  value: string,
  { format }: { format?: "raw" | "json" | "yaml" | string } = {},
): Promise<unknown> {
  if (value.startsWith("@")) {
    const ext = extname(value);

    value = await readFile(value.slice(1), "utf8");

    if (!format) {
      if (ext === ".json") format = "json";
      else if (ext === ".yaml" || ext === ".yml") format = "yaml";
    }
  }

  if (format === "json") {
    return JSON.parse(value);
  } else if (format === "yaml") {
    return parse(value);
  }

  return value;
}

export async function stdinHasData(): Promise<boolean> {
  const stats = await promisify(fstat)(0);
  return stats.isFIFO() || stats.isFile();
}

function customZodError<T extends (...args: unknown[]) => unknown>(label: string, fn: T): T {
  return ((...args: Parameters<T>) =>
    tryOrThrow(
      () => fn(...args),
      (e) => new Error(`${label} ${e instanceof ZodError ? e.issues[0]?.message : e.message}`),
    )) as T;
}
