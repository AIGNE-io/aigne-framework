import { spawn } from "node:child_process";
import { glob, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { rgPath } from "@vscode/ripgrep";
import fm from "front-matter";
import { stringify } from "yaml";
import { z } from "zod";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { mergeAgentResponseChunk } from "../utils/stream-utils.js";
import {
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponseChunk,
  FunctionAgent,
  isAgentResponseDelta,
  type Message,
} from "./agent.js";
import { AIAgent } from "./ai-agent.js";
import type { ChatModelInputMessage, ChatModelOutput } from "./chat-model.js";

export interface AgenticAgentOptions extends AgentOptions {
  instructions?: string | PromptBuilder;
  outputKey?: string;
  isSkillAgent?: boolean;
}

export class AgenticAgent<I extends Message, O extends Message> extends AIAgent {
  constructor(public options: AgenticAgentOptions) {
    super(options);

    if (!options.isSkillAgent) {
      this.instructions = PromptBuilder.from(`\
  You are an intelligent agent that can perform complex tasks by utilizing specialized skills.

  {% if plan %}
  Complete the following plan to accomplish the user's objective:

  <plan>
  {{plan}}
  </plan>
  {% endif %}
  `);
    }

    this.skills.push(BashTool, ReadTool, WriteTool, GrepTool, GlobTool);
    if (!options.isSkillAgent) {
      this.skills.push(SkillTool);
    }
  }

  override async *process(input: I, options: AgentInvokeOptions): AgentProcessResult<O> {
    const model = this.model || options.model || options.context.model;
    if (!model) throw new Error("model is required to run AIAgent");

    const planRes = !this.options.isSkillAgent
      ? await this.invokeChildAgent(
          planner,
          { objective: input[this.inputKey!] },
          { ...options, streaming: false },
        )
      : undefined;

    const { messages, tools, toolChoice, toolAgents } = await this.instructions.build({
      ...options,
      input: { ...input, plan: planRes?.plan.steps.length ? planRes.plan : undefined },
      model,
      agent: this,
    });

    if (planRes?.plan.steps.length) {
      yield { delta: { text: { [this.outputKey]: `\n\nPlan:\n${stringify(planRes.plan)}` } } };
    }

    const toolMessages: ChatModelInputMessage[] = [];

    const modelOptions = await model.getModelOptions(input, options);

    while (true) {
      const stream = await this.invokeChildAgent(
        model,
        { messages: messages.concat(toolMessages), tools, toolChoice, modelOptions },
        { ...options, streaming: true },
      );

      const modelOutput: ChatModelOutput = {};

      for await (const chunk of stream) {
        if (isAgentResponseDelta(chunk)) {
          if (chunk.delta.text?.text) {
            yield { delta: { text: { [this.outputKey]: chunk.delta.text.text } } };
          }

          if (chunk.delta.json) {
            Object.assign(modelOutput, chunk.delta.json);
          }
        }
      }

      if (!modelOutput.toolCalls?.length) {
        return;
      }

      toolMessages.push({
        role: "agent",
        toolCalls: modelOutput.toolCalls,
      });

      for (const call of modelOutput.toolCalls) {
        const tool = toolAgents?.find((i) => i.name === call.function.name);
        if (!tool) {
          throw new Error(`Tool agent not found: ${call.function.name}`);
        }

        yield {
          delta: {
            text: {
              [this.outputKey]:
                `\n\nInvoking tool: ${tool.name} ${JSON.stringify(call.function.arguments)}`,
            },
          },
        };

        const toolStream = await this.invokeChildAgent(tool, call.function.arguments, {
          ...options,
          streaming: true,
        });

        const toolResult: Message = {};

        for await (const toolChunk of toolStream) {
          if (isAgentResponseDelta(toolChunk) && toolChunk.delta.text) {
            const { stdout, stderr, [this.outputKey]: output } = toolChunk.delta.text;
            if (stdout || stderr || output) {
              yield { delta: { text: { [this.outputKey]: stderr || stdout || output } } };
            }
          }

          mergeAgentResponseChunk(toolResult, toolChunk);
        }

        toolMessages.push({
          role: "tool",
          name: tool.name,
          toolCallId: call.id,
          content: JSON.stringify(toolResult),
        });
      }
    }
  }
}

const BashTool = FunctionAgent.from({
  name: "Bash",
  description: "Execute bash scripts and return stdout and stderr output",
  inputSchema: z.object({
    script: z.string().describe("The bash script to execute."),
  }),
  process: async (input: { script: string }) => {
    return new ReadableStream<
      AgentResponseChunk<{ stdout?: string; stderr?: string; exitCode?: number }>
    >({
      start(controller) {
        const child = spawn("bash", ["-c", input.script], {
          stdio: "pipe",
          shell: false,
        });

        child.stdout.on("data", (chunk) => {
          controller.enqueue({ delta: { text: { stdout: chunk.toString() } } });
        });

        child.stderr.on("data", (chunk) => {
          controller.enqueue({ delta: { text: { stderr: chunk.toString() } } });
        });

        child.on("error", (error) => {
          controller.enqueue({ delta: { text: { stderr: error.message } } });
        });

        child.on("close", (code) => {
          if (typeof code === "number") controller.enqueue({ delta: { json: { exitCode: code } } });
          controller.close();
        });
      },
    });
  },
});

const ReadTool = FunctionAgent.from({
  name: "Read",
  description: "Read contents of a file",
  inputSchema: z.object({
    path: z.string().describe("The file path to read."),
  }),
  process: async (input: { path: string }) => {
    return new ReadableStream<AgentResponseChunk<{ content?: string; error?: string }>>({
      async start(controller) {
        try {
          const content = await readFile(input.path, "utf-8");
          controller.enqueue({ delta: { text: { content } } });
        } catch (error) {
          controller.enqueue({
            delta: { text: { error: `Failed to read file: ${error.message}` } },
          });
        }
        controller.close();
      },
    });
  },
});

const WriteTool = FunctionAgent.from({
  name: "Write",
  description: "Write content to a file",
  inputSchema: z.object({
    path: z.string().describe("The file path to write to."),
    content: z.string().describe("The content to write."),
  }),
  process: async (input: { path: string; content: string }) => {
    return new ReadableStream<AgentResponseChunk<{ success?: boolean; error?: string }>>({
      async start(controller) {
        try {
          await writeFile(input.path, input.content, "utf-8");
          controller.enqueue({ delta: { json: { success: true } } });
        } catch (error) {
          controller.enqueue({
            delta: { text: { error: `Failed to write file: ${error.message}` } },
          });
          controller.enqueue({ delta: { json: { success: false } } });
        }
        controller.close();
      },
    });
  },
});

const GrepTool = FunctionAgent.from({
  name: "Grep",
  description: "Search for patterns in files using ripgrep",
  inputSchema: z.object({
    pattern: z.string().describe("The search pattern (regex)."),
    path: z.string().optional().describe("The path to search in (defaults to current directory)."),
    glob: z.string().optional().describe("File pattern to filter (e.g., '*.ts')."),
  }),
  process: async (input: { pattern: string; path?: string; glob?: string }) => {
    return new ReadableStream<
      AgentResponseChunk<{ matches?: string; error?: string; exitCode?: number }>
    >({
      start(controller) {
        try {
          const args = ["--json", "--no-heading", "--with-filename"];

          if (input.glob) {
            args.push("--glob", input.glob);
          }

          args.push(input.pattern);

          if (input.path) {
            args.push(input.path);
          } else {
            args.push(".");
          }

          const rg = spawn(rgPath, args);

          rg.stdout.on("data", (data: Buffer) => {
            console.log("GrepTool stdout:", data.toString());
            controller.enqueue({ delta: { text: { matches: data.toString() } } });
          });

          rg.stderr.on("data", (data: Buffer) => {
            console.log("GrepTool stderr:", data.toString());
            controller.enqueue({ delta: { text: { error: data.toString() } } });
          });

          rg.on("close", (code) => {
            console.log("GrepTool process closed with code:", code);
            if (typeof code === "number") {
              controller.enqueue({ delta: { json: { exitCode: code } } });
            }
            controller.close();
          });

          rg.on("error", (error) => {
            console.log("GrepTool process error:", error);
            controller.enqueue({
              delta: { text: { error: `Failed to spawn ripgrep: ${error.message}` } },
            });
            controller.close();
          });
        } catch (error) {
          controller.enqueue({
            delta: { text: { error: `GrepTool encountered an error: ${error.message}` } },
          });
          controller.close();
        }
      },
    });
  },
});

const GlobTool = FunctionAgent.from({
  name: "Glob",
  description: "Find files matching a glob pattern",
  inputSchema: z.object({
    pattern: z.string().describe("The glob pattern (e.g., '**/*.ts')."),
    path: z
      .string()
      .optional()
      .describe("The base path to search in (defaults to current directory)."),
  }),
  process: async (input: { pattern: string; path?: string }) => {
    return new ReadableStream<AgentResponseChunk<{ files?: string; error?: string }>>({
      async start(controller) {
        try {
          const options = input.path ? { cwd: input.path } : {};
          const files: string[] = [];

          for await (const file of glob(input.pattern, options)) {
            files.push(file);
            controller.enqueue({ delta: { text: { files: `${file}\n` } } });
          }
        } catch (error) {
          controller.enqueue({
            delta: { text: { error: `Failed to glob files: ${error.message}` } },
          });
        }
        controller.close();
      },
    });
  },
});

const skills = await loadAgentSkills();

const SkillTool = FunctionAgent.from({
  name: "Skill",
  taskTitle: "Invoke {{skill}} to {{intent}}",
  taskRenderMode: "collapse",
  description: `\
Invoke a predefined skill by name to perform a specific task. available skills:
${skills.map((s) => `${s.name}: ${s.description}`).join("\n\n")}
`,
  inputSchema: z.object({
    skill: z.string().describe("The name of the skill agent to invoke."),
    intent: z.string().optional().describe("The intent or purpose for invoking the skill."),
  }),
  process: async (input: { skill: string; intent?: string }, options) => {
    const skill = skills.find((s) => s.name === input.skill);
    if (!skill) throw new Error(`Skill not found: ${input.skill}`);

    const agent = new AgenticAgent({
      name: input.skill,
      taskTitle: "{{intent}}",
      isSkillAgent: true,
      instructions: `\
You are {{skill.name}}, a specialized skill agent. {{skill.description}}

<skill_path>
{{skill.path}}
</skill_path>

<skill_definition>
{{skill.content}}
</skill_definition>

<autonomy_instruction>
You are an autonomous agent with access to powerful tools (Bash, Read, Write, Grep, Glob) that allow you to gather ANY information you need and complete tasks independently.

Proactively use these tools - Don't wait to be told what to read or where to look. If you need information, use the tools to get it. Explore, search, read, and verify as needed to accomplish your task effectively.
</autonomy_instruction>

<task>
{{intent}}
</task>
      `,
    });

    return options.context.invoke(agent, { ...input, skill }, options);
  },
});

interface AgentSkill {
  path: string;
  name: string;
  description: string;
  content: string;
}

async function loadAgentSkills() {
  const skills: AgentSkill[] = [];

  const root = resolve("/Users/chao/.claude/plugins/marketplaces/anthropic-agent-skills");

  for await (const item of glob("**/SKILL.md", { cwd: root })) {
    const path = join(root, item);
    const skill = await readFile(path, "utf-8");
    const meta = fm<{ name: string; description: string }>(skill);

    skills.push({
      path,
      name: meta.attributes.name as string,
      description: meta.attributes.description as string,
      content: meta.body,
    });
  }

  return skills;
}

const planner = new AIAgent({
  name: "AgenticPlanner",
  instructions: `\
You are an intelligent task planner that analyzes user objectives and creates detailed execution plans using specialized skills.

## Your Role
Analyze the user's objective and break it down into a sequence of actionable steps. Each step should invoke a specific skill that has the capabilities to accomplish the task.

## Available Skills

${skills.map((s) => `### ${s.name}\n${s.description}`).join("\n\n")}

## Output Format
For each step in your plan, you must provide:
- **action**: A concise title/summary of the task (like a heading)
- **skill**: The name of the skill to invoke
- **intent**: Detailed instructions and context for what the skill should accomplish (the task details)

## Guidelines

1. **Break down complex objectives** into simple, sequential steps
2. **Choose the right skill** for each step based on the task requirements
3. **Write clear action titles** - short, descriptive summaries (e.g., "Create landing page", "Generate API documentation")
4. **Provide detailed intents** - give the skill complete context, requirements, and specific instructions
5. **Consider dependencies** - ensure steps are ordered logically
6. **Minimize steps** - combine related actions when possible
7. **Return empty steps array** if the objective is just a question or doesn't require any actions
8. **Only use available skills** - each step must use one of the skills listed above

## User Objective
{{objective}}

## Your Task
Analyze the objective above and create a detailed execution plan. Think step by step about:
1. What skills are needed to accomplish this objective?
2. How should the tasks be broken down?
3. What concise title (action) describes each task?
4. What detailed instructions (intent) should each skill receive?
5. What is the logical order of operations?

Generate a plan with concrete, actionable steps that can be executed by the available skills.
  `,
  outputSchema: z.object({
    plan: z.object({
      steps: z
        .array(
          z.object({
            action: z.string().describe("A concise title/summary of the task."),
            skill: z.string().describe("The skill name to invoke."),
            intent: z
              .string()
              .describe("Detailed instructions and context for what the skill should accomplish."),
          }),
        )
        .describe("The list of steps in the plan, empty if no actions are needed."),
    }),
  }),
});
