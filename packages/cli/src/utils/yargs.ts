import { fstat } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { isatty } from "node:tty";
import { promisify } from "node:util";
import { type Agent, AIAgent, type Message, readAllString } from "@aigne/core";
import { pick } from "@aigne/core/utils/type-utils.js";
import { parse } from "yaml";
import type { Argv } from "yargs";
import {
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodType,
  ZodUnknown,
} from "zod";

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

export function withAgentInputSchema(yargs: Argv, agent: Agent) {
  const inputSchema: { [key: string]: ZodType } =
    agent.inputSchema instanceof ZodObject ? agent.inputSchema.shape : {};

  for (const [option, config] of Object.entries(inputSchema)) {
    const type = inferZodType(config);

    yargs.option(option, {
      type: type.type,
      description: config.description,
      array: type.array,
    });

    if (!type.optional) {
      yargs.demandOption(option);
    }
  }

  return yargs
    .option("input", {
      type: "string",
      array: true,
      description: "Input to the agent, use @<file> to read from a file",
      alias: ["i"],
    })
    .option("format", {
      type: "string",
      description: 'Input format, can be "json" or "yaml"',
      choices: ["json", "yaml"],
    }) as Argv<{
    input?: string[];
    format?: "json" | "yaml";
  }>;
}

export async function parseAgentInput(
  i: Message & { input?: string[]; format?: "json" | "yaml" },
  agent: Agent,
) {
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
  { format }: { format?: "raw" | "json" | "yaml" } = {},
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
