import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { z } from "zod";
import { tryOrThrow } from "../utils/type-utils.js";
import { camelizeSchema, optionalize } from "./schema.js";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

export const aigneFileSchema = camelizeSchema(
  z.object({
    name: optionalize(z.string()),
    description: optionalize(z.string()),
    model: optionalize(
      z.union([
        z.string(),
        camelizeSchema(
          z.object({
            provider: z.string().nullish(),
            name: z.string().nullish(),
            temperature: z.number().min(0).max(2).nullish(),
            topP: z.number().min(0).nullish(),
            frequencyPenalty: z.number().min(-2).max(2).nullish(),
            presencePenalty: z.number().min(-2).max(2).nullish(),
          }),
        ),
      ]),
    ).transform((v) => (typeof v === "string" ? { name: v } : v)),
    agents: optionalize(z.array(z.string())),
    skills: optionalize(z.array(z.string())),
    mcpServer: optionalize(
      z.object({
        agents: optionalize(z.array(z.string())),
      }),
    ),
    cli: optionalize(
      camelizeSchema(
        z.object({
          agents: optionalize(z.array(z.string())),
          initAgent: optionalize(
            camelizeSchema(
              z.object({
                agent: z.string(),
                outputPath: z.string(),
              }),
            ),
          ),
        }),
      ),
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
      aigneFileSchema.parse({ ...json, model: json.model ?? json.chat_model ?? json.chatModel }),
    (error) => new Error(`Failed to validate aigne.yaml from ${file}: ${error.message}`),
  );

  return { aigne, rootDir: nodejs.path.dirname(file) };
}

async function findAIGNEFile(path: string): Promise<string> {
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
