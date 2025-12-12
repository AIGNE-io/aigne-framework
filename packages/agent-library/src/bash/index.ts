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
  static override async load(options: {
    filepath: string;
    parsed: LoadBashAgentOptions;
    options?: LoadOptions;
  }) {
    const schema = getBashAgentSchema({ filepath: options.filepath });
    const parsed = await schema.parseAsync(options.parsed);

    return new BashAgent({
      ...parsed,
      permissions: {
        ...parsed.permissions,
        guard: parsed.permissions?.guard
          ? await loadNestAgent(options.filepath, parsed.permissions.guard, options.options ?? {})
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

  guard?: Agent<{ script: string }, { approved: boolean; reason?: string }>;

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
      throw new Error(`Command blocked by permissions: ${input.script}`);
    }

    if (permission === "ask") {
      if (!this.guard) {
        throw new Error(`No guard agent configured for permission 'ask'`);
      }
      const { approved, reason } = await this.invokeChildAgent(
        this.guard,
        { script },
        { ...options, streaming: false },
      );
      if (!approved) {
        throw new Error(
          `Command rejected by user: ${input.script}, reason: ${reason || "no reason provided"}`,
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
   * @param script - The script to check permission for
   * @returns Permission decision: 'allow', 'ask', or 'deny'
   */
  private async checkPermission(script: string): Promise<"allow" | "ask" | "deny"> {
    const { permissions } = this.options;
    if (!permissions) {
      return "allow"; // No permissions configured, default to allow
    }

    // Priority 1: Check deny list (highest priority)
    if (permissions.deny?.some((pattern) => this.matchPattern(script, pattern))) {
      return "deny";
    }

    // Priority 2: Check allow list
    if (permissions.allow?.some((pattern) => this.matchPattern(script, pattern))) {
      return "allow";
    }

    // Priority 3: Apply default mode
    return permissions.defaultMode || "allow";
  }

  /**
   * Match script against a permission pattern
   * Supports exact match and prefix match with ':*' wildcard
   * @param command - The command to match
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
      const prefix = pattern.slice(0, -2);
      return command.startsWith(prefix);
    }

    return false;
  }
}

export default BashAgent;

function getBashAgentSchema({ filepath }: { filepath: string }) {
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
