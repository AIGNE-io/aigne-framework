import {
  AFS,
  type AFSDriver,
  type AFSEntry,
  type AFSOptions,
  extendSchemaWithView,
  type View,
  type ViewStatus,
  type WaitStrategy,
} from "@aigne/afs";
import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

export interface AFSReadInput extends Message {
  path: string;
  withLineNumbers?: boolean;
  view?: View;
  wait?: WaitStrategy;
}

export interface AFSReadOutput extends Message {
  status: string;
  tool: string;
  path: string;
  withLineNumbers?: boolean;
  data?: AFSEntry;
  message?: string;
  viewStatus?: ViewStatus;
}

export interface AFSReadAgentOptions extends AgentOptions<AFSReadInput, AFSReadOutput> {
  afs: NonNullable<AgentOptions<AFSReadInput, AFSReadOutput>["afs"]>;
}

/**
 * Extract drivers from AFS config
 * options.afs can be: true | AFS | AFSOptions | ((afs: AFS) => AFS)
 */
function getDriversFromAfsConfig(
  afsConfig: true | AFS | AFSOptions | ((afs: AFS) => AFS),
): AFSDriver[] {
  if (afsConfig === true) {
    return [];
  }
  if (afsConfig instanceof AFS) {
    return afsConfig.drivers;
  }
  if (typeof afsConfig === "function") {
    // Function config - we can't know drivers without calling it
    // Return empty array as we can't determine drivers at construction time
    return [];
  }
  // AFSOptions - return drivers if present
  return afsConfig.drivers || [];
}

export class AFSReadAgent extends Agent<AFSReadInput, AFSReadOutput> {
  constructor(options: AFSReadAgentOptions) {
    // Extract drivers from AFS config
    const drivers = getDriversFromAfsConfig(options.afs);
    const hasDrivers = drivers.length > 0;

    // Base schema
    const baseSchema = z.object({
      path: z.string().describe("Absolute file path to read"),
      withLineNumbers: z
        .boolean()
        .optional()
        .describe("Include line numbers in output (required when planning to edit the file)"),
    });

    // Dynamically extend schema based on registered drivers
    let inputSchema: z.ZodObject<z.ZodRawShape> = extendSchemaWithView(baseSchema, drivers);

    // Add wait option only when drivers are present
    if (hasDrivers) {
      inputSchema = inputSchema.extend({
        wait: z
          .enum(["strict", "fallback"])
          .optional()
          .describe(
            "Wait strategy: 'strict' waits for view generation (default), 'fallback' returns source immediately",
          ),
      });
    }

    // Build output schema
    const baseOutputSchema = z.object({
      status: z.string(),
      tool: z.string(),
      path: z.string(),
      withLineNumbers: z.boolean().optional(),
      result: z.custom<AFSEntry>().optional(),
      message: z.string().optional(),
    });

    // Add viewStatus to output schema only when drivers are present
    const outputSchema = hasDrivers
      ? baseOutputSchema.extend({
          viewStatus: z
            .object({
              fallback: z.boolean().optional(),
            })
            .optional()
            .describe(
              "View status indicating whether the requested view was returned or fell back to source",
            ),
        })
      : baseOutputSchema;

    // Determine description based on driver availability
    const description = hasDrivers
      ? "Read file contents with optional view projection (e.g., translated version). Use when you need to review, analyze, or understand file content."
      : "Read complete file contents. Use when you need to review, analyze, or understand file content before making changes.";

    super({
      name: "afs_read",
      description,
      ...options,
      // Use type assertion for dynamically built schema
      inputSchema: inputSchema as unknown as z.ZodType<AFSReadInput>,
      outputSchema: outputSchema as unknown as z.ZodType<AFSReadOutput>,
    });
  }

  async process(input: AFSReadInput, _options: AgentInvokeOptions): Promise<AFSReadOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    const result = await this.afs.read(input.path, {
      view: input.view,
      wait: input.wait,
      context: _options.context,
    });

    let content = result.data?.content;

    if (input.withLineNumbers && typeof content === "string") {
      content = content
        .split("\n")
        .map((line, idx) => `${idx + 1}| ${line}`)
        .join("\n");
    }

    return {
      status: "success",
      tool: "afs_read",
      path: input.path,
      withLineNumbers: input.withLineNumbers,
      ...result,
      data: result.data && {
        ...result.data,
        content,
      },
    };
  }
}
