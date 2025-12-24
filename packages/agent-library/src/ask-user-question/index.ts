import { Agent, type AgentInvokeOptions, type AgentProcessResult, type Message } from "@aigne/core";
import { optionalize } from "@aigne/core/loader/schema.js";
import { z } from "zod";

export interface AskUserQuestionAgentOption {
  label: string;
  description?: string;
}

export interface AskUserQuestionAgentInput extends Message {
  questions: {
    question: string;
    options?: AskUserQuestionAgentOption[];
    multipleSelect?: boolean;
  }[];
  allowCustomAnswer?: boolean;
}

const askUserQuestionAgentOptionSchema = z.object({
  label: z.string().describe("The display text for this option (1-5 words)"),
  description: optionalize(z.string()).describe("Explanation of what this option means"),
});

const askUserQuestionAgentInputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe("The question to ask the user"),
        options: optionalize(z.array(askUserQuestionAgentOptionSchema)).describe(
          "List of options to present to the user",
        ),
        multipleSelect: optionalize(z.boolean()).describe("Whether to allow multiple selections"),
      }),
    )
    .describe("List of questions to ask the user"),
  allowCustomAnswer: optionalize(z.boolean()).describe(
    "Whether to allow the user to provide custom answers",
  ),
});

export interface AskUserQuestionAgentOutput extends Message {
  answers: {
    question: string;
    answer: string | string[];
  }[];
}

export default class AskUserQuestionAgent extends Agent<
  AskUserQuestionAgentInput,
  AskUserQuestionAgentOutput
> {
  override tag = "AskUserQuestion";

  static schema() {
    return z.object({});
  }

  static override async load<I extends Message = any, O extends Message = any>(options: {
    filepath: string;
    parsed: object;
  }): Promise<Agent<I, O>> {
    return new AskUserQuestionAgent({
      name: defaultName,
      description: defaultDescription,
      ...options.parsed,
      inputSchema: askUserQuestionAgentInputSchema,
    }) as unknown as Agent<I, O>;
  }

  override async process(
    input: AskUserQuestionAgentInput,
    options: AgentInvokeOptions,
  ): Promise<AgentProcessResult<AskUserQuestionAgentOutput>> {
    const { prompts } = options;
    if (!prompts) throw new Error("Prompts is not available in AskUserQuestionAgent");

    const { questions, allowCustomAnswer } = input;

    const answers: AskUserQuestionAgentOutput["answers"] = [];

    for (const q of questions) {
      let answer: string | string[];

      if (q.options?.length) {
        const choices: { value: string; short?: string; description?: string }[] = q.options.map(
          (opt) => ({
            value: opt.label,
            short: opt.label,
            description: opt.description ?? opt.label,
          }),
        );

        if (allowCustomAnswer) {
          choices.push({
            short: "None of the above / Enter my own response",
            value: "OTHER_OPTION",
          });
        }

        if (!q.multipleSelect) {
          answer = await prompts.select({
            message: q.question,
            choices,
          });
        } else {
          answer = await prompts.checkbox({
            message: q.question,
            choices,
          });
        }

        if (
          answer === "OTHER_OPTION" ||
          (Array.isArray(answer) && answer.includes("OTHER_OPTION"))
        ) {
          answer = await prompts.input({
            message: `Please provide your response for: ${q.question}`,
          });
        }
      } else {
        answer = await prompts.input({
          message: q.question,
        });
      }

      answers.push({
        question: q.question,
        answer,
      });
    }

    return {
      answers,
    };
  }
}

const defaultName = "askUserQuestion";
const defaultDescription = `\
Use this tool when you need to ask the user questions during execution. This allows you to:
1. Gather user preferences or requirements
2. Clarify ambiguous instructions
3. Get decisions on implementation choices as you work
4. Offer choices to the user about what direction to take.

Usage notes:
- Users will always be able to select "Other" to provide custom text input
- Use multiSelect: true to allow multiple answers to be selected for a question
- If you recommend a specific option, make that the first option in the list and add "(Recommended)" at the end of the label
`;
