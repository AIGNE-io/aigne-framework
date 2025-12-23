import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import { getterSchema } from "../agents/agent.js";
import { type Role, roleSchema } from "../agents/chat-model.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { ChatMessagesTemplate, parseChatMessages } from "../prompt/template.js";
import { camelize } from "../utils/camelize.js";
import { isRecord } from "../utils/type-utils.js";

export const inputOutputSchema = ({ path }: { path: string }) => {
  const includeExternalSchema = async (schema: any): Promise<typeof schema> => {
    if (schema?.type === "object" && schema.properties) {
      return {
        ...schema,
        properties: Object.fromEntries(
          await Promise.all(
            Object.entries(schema.properties).map(async ([key, value]) => [
              key,
              await includeExternalSchema(value),
            ]),
          ),
        ),
      };
    }

    if (schema?.type === "array" && schema.items) {
      return { ...schema, items: await includeExternalSchema(schema.items) };
    }

    // Load nested schemas from file
    if (typeof schema === "string") {
      const raw = await nodejs.fs.readFile(
        nodejs.path.join(nodejs.path.dirname(path), schema),
        "utf8",
      );
      return nestedJsonSchema.parseAsync(parse(raw));
    }
    return schema;
  };

  const nestedJsonSchema = z
    .object({
      type: z.string(),
    })
    .passthrough()
    .transform((v) => includeExternalSchema(v));

  const jsonSchemaSchema = z
    .object({
      type: z.literal("object"),
      properties: z.record(z.any()),
      required: z.array(z.string()).optional(),
      additionalProperties: z.boolean().optional(),
    })
    .transform((v) => includeExternalSchema(v));

  return z.union([
    z
      .string()
      .transform((v) =>
        nodejs.fs
          .readFile(nodejs.path.join(nodejs.path.dirname(path), v), "utf8")
          .then((raw) => jsonSchemaSchema.parseAsync(parse(raw))),
      ) as unknown as ZodType<z.infer<typeof jsonSchemaSchema>>,
    jsonSchemaSchema,
  ]);
};

export const defaultInputSchema = z.record(z.string(), getterSchema(z.unknown()));

const chatModelObjectSchema = camelizeSchema(
  z
    .object({
      model: optionalize(getterSchema(z.string())),
      temperature: optionalize(getterSchema(z.number().min(0).max(2))),
      topP: optionalize(getterSchema(z.number().min(0))),
      frequencyPenalty: optionalize(getterSchema(z.number().min(-2).max(2))),
      presencePenalty: optionalize(getterSchema(z.number().min(-2).max(2))),
      thinkingEffort: optionalize(
        getterSchema(
          z.union([
            z.number().int(),
            z.literal("high"),
            z.literal("medium"),
            z.literal("low"),
            z.literal("minimal"),
          ]),
        ),
      ),
    })
    .passthrough(),
);

export const chatModelSchema = z
  .preprocess(
    (v) => {
      if (!isRecord(v)) return v;
      return {
        ...v,
        model:
          v.model ||
          (v.provider && v.name ? `${v.provider || ""}:${v.name || ""}` : undefined) ||
          undefined,
      };
    },
    z.union([z.string(), chatModelObjectSchema]),
  )
  .transform((v) =>
    typeof v === "string" ? { model: v } : v,
  ) as unknown as typeof chatModelObjectSchema;

const imageModelObjectSchema = camelizeSchema(
  z
    .object({
      model: optionalize(getterSchema(z.string())),
    })
    .passthrough(),
);

export const imageModelSchema = z
  .union([z.string(), imageModelObjectSchema])
  .transform((v) =>
    typeof v === "string" ? { model: v } : v,
  ) as unknown as typeof imageModelObjectSchema;

export function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}

export function camelizeSchema<T extends ZodType>(
  schema: T,
  { shallow = true }: { shallow?: boolean } = {},
): T {
  return z.preprocess((v) => (isRecord(v) ? camelize(v, shallow) : v), schema) as unknown as T;
}

export function preprocessSchema<T extends ZodType>(fn: (data: unknown) => unknown, schema: T): T {
  return z.preprocess(fn, schema) as unknown as T;
}

const instructionItemSchema = camelizeSchema(
  z.union([
    z.object({
      role: roleSchema.default("system"),
      url: z.string(),
      cacheControl: optionalize(
        z.object({
          type: z.literal("ephemeral"),
          ttl: optionalize(z.union([z.literal("5m"), z.literal("1h")])),
        }),
      ),
    }),
    z.object({
      role: roleSchema.default("system"),
      content: z.string(),
      cacheControl: optionalize(
        z.object({
          type: z.literal("ephemeral"),
          ttl: optionalize(z.union([z.literal("5m"), z.literal("1h")])),
        }),
      ),
    }),
  ]),
);

export type Instructions = {
  role: Exclude<Role, "tool">;
  content: string;
  path: string;
  cacheControl?: {
    type: "ephemeral";
    ttl?: "5m" | "1h";
  };
}[];

const parseInstructionItem =
  ({ filepath }: { filepath: string }) =>
  async ({
    role,
    cacheControl,
    ...v
  }: z.infer<typeof instructionItemSchema>): Promise<Instructions[number]> => {
    if (role === "tool")
      throw new Error(`'tool' role is not allowed in instruction item in agent file ${filepath}`);

    if ("content" in v && typeof v.content === "string") {
      return { role, content: v.content, path: filepath, cacheControl };
    }
    if ("url" in v && typeof v.url === "string") {
      const url = nodejs.path.isAbsolute(v.url)
        ? v.url
        : nodejs.path.join(nodejs.path.dirname(filepath), v.url);
      return nodejs.fs
        .readFile(url, "utf8")
        .then((content) => ({ role, content, path: url, cacheControl }));
    }
    throw new Error(
      `Invalid instruction item in agent file ${filepath}. Expected 'content' or 'url' property`,
    );
  };

export const getInstructionsSchema = ({ filepath }: { filepath: string }) =>
  z
    .union([z.string(), instructionItemSchema, z.array(instructionItemSchema)])
    .transform(async (v): Promise<Instructions> => {
      if (typeof v === "string") return [{ role: "system", content: v, path: filepath }];

      if (Array.isArray(v)) {
        return Promise.all(v.map((item) => parseInstructionItem({ filepath })(item)));
      }

      return [await parseInstructionItem({ filepath })(v)];
    }) as unknown as ZodType<Instructions>;

export function instructionsToPromptBuilder(instructions: Instructions) {
  return new PromptBuilder({
    instructions: ChatMessagesTemplate.from(
      parseChatMessages(
        instructions.map((i) => ({
          ...i,
          options: { workingDir: nodejs.path.dirname(i.path) },
        })),
      ),
    ),
  });
}
