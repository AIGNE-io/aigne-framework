import { type SpawnOptions, spawn } from "node:child_process";
import { Agent, type AgentOptions, type AgentResponseStream, type Message } from "@aigne/core";
import { SandboxManager, type SandboxRuntimeConfig } from "@anthropic-ai/sandbox-runtime";
import { rgPath } from "@vscode/ripgrep";
import z from "zod";
import { Mutex } from "../utils/mutex.js";

const DEFAULT_TIMEOUT = 60e3; // 60 seconds

export interface BashAgentOptions extends AgentOptions<BashAgentInput, BashAgentOutput> {
  // Optional sandbox configuration for executing scripts in a controlled environment
  // See https://github.com/anthropic-experimental/sandbox-runtime?tab=readme-ov-file#complete-configuration-example for details
  sandbox?:
    | Partial<{ [K in keyof SandboxRuntimeConfig]: Partial<SandboxRuntimeConfig[K]> }>
    | boolean;

  /**
   * Optional timeout for script execution in milliseconds
   * @default 60000 (60 seconds)
   */
  timeout?: number; // Optional timeout for script execution in milliseconds
}

export interface BashAgentInput extends Message {
  script: string;
}

export interface BashAgentOutput extends Message {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
}

let sandboxInitialization: Promise<void> | undefined;
const mutex = new Mutex();

export class BashAgent extends Agent<BashAgentInput, BashAgentOutput> {
  static override async load(options: { filepath: string; parsed: object }) {
    return new BashAgent(options.parsed) as Agent;
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
        script: z.string().describe("The bash script to execute."),
      }),
      outputSchema: z.object({
        stdout: z.string().describe("The standard output from the bash script.").optional(),
        stderr: z.string().describe("The standard error output from the bash script.").optional(),
        exitCode: z.number().describe("The exit code of the bash script execution.").optional(),
      }),
    });
  }

  override async process(input: BashAgentInput): Promise<AgentResponseStream<BashAgentOutput>> {
    const platform =
      (<{ [key in NodeJS.Platform]: Parameters<typeof SandboxManager.isSupportedPlatform>[0] }>{
        win32: "windows",
        darwin: "macos",
        linux: "linux",
      })[globalThis.process.platform] || "unknown";

    if (this.options.sandbox === false) {
      return this.spawn("bash", ["-c", input.script]);
    } else {
      if (!SandboxManager.isSupportedPlatform(platform)) {
        throw new Error(`Sandboxed execution is not supported on this platform ${platform}`);
      }

      return await this.runInSandbox(
        typeof this.options.sandbox === "boolean" ? {} : this.options.sandbox,
        input.script,
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
          const child = spawn(command, args, {
            ...options,
            stdio: "pipe",
            timeout: this.options.timeout ?? DEFAULT_TIMEOUT,
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

          child.on("close", (code) => {
            if (typeof code === "number") {
              if (code === 0) {
                controller.enqueue({ delta: { json: { exitCode: code } } });
                controller.close();
              } else {
                controller.error(new Error(`Bash script exited with code ${code}: ${stderr}`));
              }
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
}

export default BashAgent;
