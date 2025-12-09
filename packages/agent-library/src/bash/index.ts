import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import type { AgentOptions } from "node:http";
import {
  Agent,
  type AgentResponseChunk,
  type AgentResponseStream,
  type Message,
} from "@aigne/core";
import { SandboxManager, type SandboxRuntimeConfig } from "@anthropic-ai/sandbox-runtime";
import { rgPath } from "@vscode/ripgrep";
import z from "zod";
import { Mutex } from "../utils/mutex.js";

export interface BashAgentOptions extends AgentOptions {
  sandbox?:
    | Partial<{ [K in keyof SandboxRuntimeConfig]: Partial<SandboxRuntimeConfig[K]> }>
    | boolean;
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
    if (!SandboxManager.isSupportedPlatform(platform)) {
      throw new Error(`Sandboxed execution is not supported on this platform ${platform}`);
    }

    return new ReadableStream<AgentResponseChunk<BashAgentOutput>>({
      start: async (controller) => {
        const extractResult = async (child: ChildProcessWithoutNullStreams) =>
          new Promise<void>((resolve) => {
            child.stdout.on("data", (chunk) => {
              controller.enqueue({ delta: { text: { stdout: chunk.toString() } } });
            });

            child.stderr.on("data", (chunk) => {
              controller.enqueue({ delta: { text: { stderr: chunk.toString() } } });
            });

            child.on("error", (error) => {
              controller.enqueue({ delta: { text: { stderr: error.message } } });
              resolve();
            });

            child.on("close", (code) => {
              if (typeof code === "number")
                controller.enqueue({ delta: { json: { exitCode: code } } });
              controller.close();
              resolve();
            });
          });

        try {
          if (this.options.sandbox === false) {
            const child = spawn("bash", ["-c", input.script], {
              stdio: "pipe",
            });
            await extractResult(child);
          } else {
            await this.runInSandbox(
              typeof this.options.sandbox === "boolean" ? {} : this.options.sandbox,
              input.script,
              async (sandboxedCommand) => {
                const child = spawn(sandboxedCommand, {
                  stdio: "pipe",
                  shell: true,
                });
                await extractResult(child);
              },
            );
          }
        } catch (error) {
          controller.enqueue({ delta: { text: { stderr: `Error: ${error.message}` } } });
        }
      },
    });
  }

  async runInSandbox(
    config: Exclude<BashAgentOptions["sandbox"], boolean>,
    script: string,
    task: (script: string) => Promise<void>,
  ) {
    await mutex.runExclusive(async () => {
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

      await task(sandboxedCommand);
    });
  }
}

export default BashAgent;
