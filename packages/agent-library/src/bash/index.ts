import { type SpawnOptions, spawn } from "node:child_process";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentResponseStream,
  type Message,
} from "@aigne/core";
import { getNestAgentSchema, type NestAgentSchema } from "@aigne/core/loader/agent-yaml.js";
import { type LoadOptions, loadNestAgent } from "@aigne/core/loader/index.js";
import { camelizeSchema, optionalize } from "@aigne/core/loader/schema.js";
import {
  SandboxManager,
  type SandboxRuntimeConfig,
  SandboxRuntimeConfigSchema,
} from "@anthropic-ai/sandbox-runtime";
import { rgPath } from "@vscode/ripgrep";
import z, { ZodObject, type ZodOptional, type ZodRawShape, type ZodType } from "zod";
import { Mutex } from "../utils/mutex.js";

const DEFAULT_TIMEOUT = 60e3; // 60 seconds

export interface BashAgentOptions extends AgentOptions<BashAgentInput, BashAgentOutput> {
  // Optional sandbox configuration for executing scripts in a controlled environment
  // See https://github.com/anthropic-experimental/sandbox-runtime?tab=readme-ov-file#complete-configuration-example for details
  sandbox?:
    | Partial<{ [K in keyof SandboxRuntimeConfig]: Partial<SandboxRuntimeConfig[K]> }>
    | boolean;

  inputKey?: string; // Optional input key for the bash script

  /**
   * Optional timeout for script execution in milliseconds
   * @default 60000 (60 seconds)
   */
  timeout?: number; // Optional timeout for script execution in milliseconds

  /**
   * Optional permissions configuration for command execution control
   * Inspired by Claude Code's permission system
   */
  permissions?: {
    /**
     * Whitelist: Commands that are allowed to execute without approval
     * Supports exact match or prefix match with ':*' wildcard
     * Examples: ['npm run test:*', 'git status', 'ls:*']
     */
    allow?: string[];

    /**
     * Blacklist: Commands that are completely forbidden
     * Takes highest priority over allow and defaultMode
     * Examples: ['rm:*', 'sudo:*', 'curl:*']
     */
    deny?: string[];

    /**
     * Default permission mode when command doesn't match allow/deny lists
     * @default 'allow'
     */
    defaultMode?: "allow" | "ask" | "deny";

    /**
     * Callback function invoked when a command requires user approval (ask mode)
     * Return true to approve, false to reject
     * @param script - The script that requires approval
     * @returns Promise resolving to approval decision
     */
    guard?: BashAgent["guard"];
  };
}

export interface LoadBashAgentOptions extends Omit<BashAgentOptions, "permissions"> {
  permissions?: Omit<NonNullable<BashAgentOptions["permissions"]>, "guard"> & {
    guard?: NestAgentSchema;
  };
}

export interface BashAgentInput extends Message {
  script?: string;
}

export interface BashAgentOutput extends Message {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
}

let sandboxInitialization: Promise<void> | undefined;
const mutex = new Mutex();

export class BashAgent extends Agent<BashAgentInput, BashAgentOutput> {
  override tag = "Bash";

  static schema({ filepath }: { filepath: string }) {
    const nestAgentSchema = getNestAgentSchema({ filepath });

    return camelizeSchema(
      z.object({
        sandbox: optionalize(
          z.union([makeShapePropertiesOptions(SandboxRuntimeConfigSchema, 2), z.boolean()]),
        ),
        inputKey: optionalize(z.string().describe("The input key for the bash script.")),
        timeout: optionalize(z.number().describe("Timeout for script execution in milliseconds.")),
        permissions: optionalize(
          camelizeSchema(
            z.object({
              allow: optionalize(z.array(z.string())),
              deny: optionalize(z.array(z.string())),
              defaultMode: optionalize(z.enum(["allow", "ask", "deny"])),
              guard: optionalize(nestAgentSchema),
            }),
          ),
        ),
      }),
    );
  }

  static override async load(options: {
    filepath: string;
    parsed: LoadBashAgentOptions;
    options?: LoadOptions;
  }) {
    const parsed = await BashAgent.schema(options).parseAsync(options.parsed);

    return new BashAgent({
      ...parsed,
      permissions: {
        ...parsed.permissions,
        guard: parsed.permissions?.guard
          ? await loadNestAgent(options.filepath, parsed.permissions.guard, options.options ?? {}, {
              outputSchema: z.object({
                approved: z.boolean().describe("Whether the command is approved by the user."),
                reason: z.string().describe("Optional reason for rejection.").optional(),
              }),
            })
          : undefined,
      },
    }) as Agent;
  }

  constructor(public options: BashAgentOptions) {
    super({
      name: "Bash",
      description: `\
Execute bash scripts and return stdout and stderr output.

When to use:
- Running system commands or bash scripts
- Interacting with command-line tools
`,
      ...options,
      inputSchema: z.object({
        [options.inputKey || "script"]: z.string().describe("The bash script to execute."),
      }),
      outputSchema: z.object({
        stdout: z.string().describe("The standard output from the bash script.").optional(),
        stderr: z.string().describe("The standard error output from the bash script.").optional(),
        exitCode: z.number().describe("The exit code of the bash script execution.").optional(),
      }),
    });

    this.guard = this.options.permissions?.guard;
    this.inputKey = this.options.inputKey;
  }

  inputKey?: string;

  guard?: Agent<{ script?: string }, { approved: boolean; reason?: string }>;

  override async process(
    input: BashAgentInput,
    options: AgentInvokeOptions,
  ): Promise<AgentResponseStream<BashAgentOutput>> {
    const script = input[this.inputKey || "script"];
    if (typeof script !== "string")
      throw new Error(`Invalid or missing script input: ${this.inputKey || "script"}`);

    // Permission check
    const permission = await this.checkPermission(script);

    if (permission === "deny") {
      throw new Error(`Command blocked by permissions: ${script}`);
    }

    if (permission === "ask") {
      if (!this.guard) {
        throw new Error(`No guard agent configured for permission 'ask'`);
      }
      const { approved, reason } = await this.invokeChildAgent(this.guard, input, {
        ...options,
        streaming: false,
      });
      if (!approved) {
        throw new Error(
          `Command rejected by guard agent (${this.guard.name}): ${script}, reason: ${reason || "no reason provided"}`,
        );
      }
    }

    const platform =
      (<{ [key in NodeJS.Platform]: Parameters<typeof SandboxManager.isSupportedPlatform>[0] }>{
        win32: "windows",
        darwin: "macos",
        linux: "linux",
      })[globalThis.process.platform] || "unknown";

    if (this.options.sandbox === false) {
      return this.spawn("bash", ["-c", script]);
    } else {
      if (!SandboxManager.isSupportedPlatform(platform)) {
        throw new Error(`Sandboxed execution is not supported on this platform ${platform}`);
      }

      return await this.runInSandbox(
        typeof this.options.sandbox === "boolean" ? {} : this.options.sandbox,
        script,
        async (sandboxedCommand) => {
          return this.spawn(sandboxedCommand, undefined, {
            shell: true,
          });
        },
      );
    }
  }

  async spawn(
    command: string,
    args?: string[],
    options?: SpawnOptions,
  ): Promise<AgentResponseStream<BashAgentOutput>> {
    return new ReadableStream({
      start: (controller) => {
        try {
          const timeout = this.options.timeout ?? DEFAULT_TIMEOUT;

          const child = spawn(command, args, {
            ...options,
            stdio: "pipe",
            timeout,
          });

          let stderr = "";

          child.stdout.on("data", (chunk) => {
            controller.enqueue({ delta: { text: { stdout: chunk.toString() } } });
          });

          child.stderr.on("data", (chunk) => {
            controller.enqueue({ delta: { text: { stderr: chunk.toString() } } });
            stderr += chunk.toString();
          });

          child.on("error", (error) => {
            controller.error(error);
          });

          child.on("close", (code, signal) => {
            // Handle timeout or killed by signal
            if (signal) {
              const timeoutHint = signal === "SIGTERM" ? ` (likely timeout ${timeout})` : "";
              controller.error(
                new Error(`Bash script killed by signal ${signal}${timeoutHint}: ${stderr}`),
              );
              return;
            }

            // Handle normal exit
            if (typeof code === "number") {
              if (code === 0) {
                controller.enqueue({ delta: { json: { exitCode: code } } });
                controller.close();
              } else {
                controller.error(new Error(`Bash script exited with code ${code}: ${stderr}`));
              }
            } else {
              // Unexpected case: no code and no signal
              controller.error(new Error(`Bash script closed unexpectedly: ${stderr}`));
            }
          });
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  async runInSandbox<T>(
    config: Exclude<BashAgentOptions["sandbox"], boolean>,
    script: string,
    task: (script: string) => Promise<T>,
  ): Promise<T> {
    return await mutex.runExclusive(async () => {
      sandboxInitialization ??= SandboxManager.initialize({
        network: {
          allowedDomains: [],
          deniedDomains: [],
        },
        filesystem: {
          denyRead: [],
          denyWrite: [],
          allowWrite: [],
        },
        ripgrep: {
          command: rgPath,
        },
      });

      await sandboxInitialization;

      SandboxManager.updateConfig({
        ...(config as SandboxRuntimeConfig),
        network: {
          ...config?.network,
          allowedDomains: config?.network?.allowedDomains || [],
          deniedDomains: config?.network?.deniedDomains || [],
        },
        filesystem: {
          ...config?.filesystem,
          denyRead: config?.filesystem?.denyRead || [],
          denyWrite: config?.filesystem?.denyWrite || [],
          allowWrite: config?.filesystem?.allowWrite || [],
        },
        ripgrep: {
          command: rgPath,
        },
      });

      const sandboxedCommand = await SandboxManager.wrapWithSandbox(script);

      return await task(sandboxedCommand);
    });
  }

  /**
   * Check permission for executing a script
   * Permission priority: deny > allow > defaultMode
   *
   * For complex commands (with pipes, chaining, etc.), each sub-command
   * is validated separately. All sub-commands must pass permission checks.
   *
   * @param script - The script to check permission for
   * @returns Permission decision: 'allow', 'ask', or 'deny'
   */
  async checkPermission(script: string): Promise<"allow" | "ask" | "deny"> {
    const { permissions } = this.options;
    if (!permissions) {
      return "allow"; // No permissions configured, default to allow
    }

    // Split complex commands into individual commands
    const commands = this.splitCommands(script);

    // Check permission for each command
    for (const command of commands) {
      const commandPermission = this.checkSingleCommandPermission(command, permissions);

      // If any command is denied, deny the whole script
      if (commandPermission === "deny") {
        return "deny";
      }

      // If any command requires asking, the whole script requires asking
      if (commandPermission === "ask") {
        return "ask";
      }
    }

    // All commands are allowed
    return "allow";
  }

  /**
   * Split a script into individual commands by pipes, command chaining, etc.
   * Separators: | (pipe), && (AND), || (OR), & (background), ; (sequential), \n (newline)
   *
   * Note: Redirection operators (>, >>, <, <<, &>, 2>, etc.) are treated as part of
   * the command, not as separators.
   *
   * @param script - The script to split
   * @returns Array of individual commands
   */
  private splitCommands(script: string): string[] {
    // Split by pipes, &&, ||, &, ;, and newlines
    // IMPORTANT: Match longer patterns first to avoid incorrect splitting:
    // - && and || before single & and |
    // - Must use negative lookbehind/lookahead to avoid matching &> (redirect)
    // Pattern explanation: (?<!&) means "not preceded by &", (?!>) means "not followed by >"
    const parts = script.split(/(\||&&|\|\||(?<!&)&(?!>)|;|\n)/);

    const commands: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const trimmedPart = part.trim();
      // Skip empty parts and separator tokens
      if (trimmedPart && !["|", "&&", "||", "&", ";"].includes(trimmedPart)) {
        commands.push(trimmedPart);
      }
    }

    return commands.length > 0 ? commands : [script];
  }

  /**
   * Check permission for a single command
   * @param command - The command to check
   * @param permissions - Permission configuration
   * @returns Permission decision for this command
   */
  private checkSingleCommandPermission(
    command: string,
    permissions: NonNullable<BashAgentOptions["permissions"]>,
  ): "allow" | "ask" | "deny" {
    // Priority 1: Check deny list (highest priority)
    if (permissions.deny?.some((pattern) => this.matchPattern(command, pattern))) {
      return "deny";
    }

    // Priority 2: Check allow list
    if (permissions.allow?.some((pattern) => this.matchPattern(command, pattern))) {
      return "allow";
    }

    // Priority 3: Apply default mode
    return permissions.defaultMode || "allow";
  }

  /**
   * Match a single command against a permission pattern
   * Supports exact match and prefix match with ':*' wildcard
   *
   * Note: This method is called for individual commands after splitting,
   * so it doesn't need to handle complex command chaining.
   *
   * Examples:
   * - "ls:*" matches "ls", "ls -la", "ls:option"
   * - "npm run test:*" matches "npm run test", "npm run test:unit", "npm run test arg"
   *
   * @param command - The command to match (should be a single command)
   * @param pattern - The pattern to match against
   * @returns true if command matches pattern
   */
  private matchPattern(command: string, pattern: string): boolean {
    // Trim whitespace
    command = command.trim();
    pattern = pattern.trim();

    // Exact match
    if (pattern === command) {
      return true;
    }

    // Prefix match with ':*' wildcard
    if (pattern.endsWith(":*")) {
      const prefix = pattern.slice(0, -2).trim();
      // Match if command equals prefix or starts with prefix followed by space or colon
      return command === prefix || command.startsWith(prefix) || command.startsWith(`${prefix}:`);
    }

    return false;
  }
}

export default BashAgent;

function makeShapePropertiesOptions<T extends ZodRawShape, S extends ZodObject<T>>(
  schema: S,
  depth = 1,
): ZodObject<{ [key in keyof T]: ZodOptional<ZodType<T[key]>> }> {
  return z.object(
    Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        const isObject = value instanceof ZodObject;
        if (isObject && depth > 1) {
          return [key, optionalize(makeShapePropertiesOptions(value as ZodObject<any>, depth - 1))];
        }
        return [key, optionalize(value)];
      }),
    ) as { [key in keyof T]: ZodOptional<ZodType<T[key]>> },
  );
}
