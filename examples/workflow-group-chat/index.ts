#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { randomUUID } from "node:crypto";
import {
  AIAgent,
  ExecutionEngine,
  FunctionAgent,
  PromptTemplate,
  UserAgent,
  createMessage,
  getMessage,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { logger } from "@aigne/core/utils/logger.js";
import inquirer from "inquirer";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  model: "gpt-4o",
});

const engine = new ExecutionEngine({
  model,
});

const DEFAULT_TOPIC = "DEFAULT_TOPIC";

const writer = AIAgent.from({
  name: "writer",
  description: "Writer for creating any text content",
  publishTopic: DEFAULT_TOPIC,
  memory: { subscribeTopic: DEFAULT_TOPIC },
  instructions: "You are a Writer. You produce good work.",
});

const editor = AIAgent.from({
  name: "editor",
  description: "Editor for planning and reviewing the content",
  publishTopic: DEFAULT_TOPIC,
  memory: { subscribeTopic: DEFAULT_TOPIC },
  instructions: `\
You are an Editor. Plan and guide the task given by the user.
Provide critical feedbacks to the draft and illustration produced by Writer and Illustrator.
Approve if the task is completed and the draft and illustration meets user's requirements.`,
});

const generateImage = FunctionAgent.from({
  name: "generate_image",
  description: "Generate an image",
  inputSchema: z.object({
    character_appearance: z.string(),
    style_attributes: z.string(),
    worn_and_carried: z.string(),
    scenario: z.string(),
  }),
  fn: (input) => {
    return { ...input, url: `https://example.com/${randomUUID()}.jpg` };
  },
});

const illustrator = AIAgent.from({
  name: "illustrator",
  description: "An illustrator for creating images",
  publishTopic: DEFAULT_TOPIC,
  memory: { subscribeTopic: DEFAULT_TOPIC },
  instructions: `\
You are an Illustrator. You use the generate_image tool to create images given user's requirement.
Make sure the images have consistent characters and style.`,
  tools: [generateImage],
  toolChoice: "auto",
  outputSchema: z.object({
    images: z
      .array(
        z.object({
          url: z.string().describe("The URL of the image"),
        }),
      )
      .describe("The images created by the illustrator"),
  }),
});

let isFirstQuestion = true;

const user = UserAgent.from({
  context: engine.newContext(),
  name: "user",
  description: "User for providing final approval",
  publishTopic: DEFAULT_TOPIC,
  memory: { subscribeTopic: DEFAULT_TOPIC },
  async process() {
    logger.globalSpinner.stop();
    const { question } = await inquirer.prompt([
      {
        type: "input",
        name: "question",
        message: "💬",
        required: true,
        default: isFirstQuestion
          ? "Please write a short story about the gingerbread man with up to 3 photo-realistic illustrations."
          : undefined,
      },
    ]);
    isFirstQuestion = false;
    logger.globalSpinner.start();
    return createMessage(question);
  },
});

const roles = [writer, editor, illustrator, user];

const manager = AIAgent.from({
  name: "manager",
  subscribeTopic: DEFAULT_TOPIC,
  publishTopic: (output) => output.role,
  memory: { subscribeTopic: DEFAULT_TOPIC },
  instructions: PromptTemplate.from(`\
  You are participating in a role-playing game. The available roles are:

  <roles>
  {{roles}}
  </roles>

  Instructions:
  1. Read the following conversation history
  2. Identify the last speaking role in the conversation.
  3. If the last role is **not** "user," respond as "user" to approve and continue.
  4. Otherwise, select the next role **logically** based on the context of the conversation (do not repeat the same role unless necessary).
  5. Make sure responses align with the role’s personality and purpose in the game.
  `).format({
    roles: roles.map((i) => `${i.topic}: ${i.description}`).join("\n"),
  }),
  outputSchema: z.object({
    role: z
      .union(assertZodUnionArray(roles.map((i) => z.literal(i.topic))))
      .describe("The next role to play"),
  }),
});

engine.addAgent(user, writer, editor, illustrator, manager);

engine.subscribe(DEFAULT_TOPIC, (message) => {
  console.log(
    "------------- Received message -------------\n",
    `${message.source}:`,
    getMessage(message.message) || message.message,
    "\n--------------------------------------------",
  );
});

await engine.call(user, {});

function assertZodUnionArray<T extends z.ZodType>(union: T[]): [T, T, ...T[]] {
  if (!(union.length >= 2)) throw new Error("Union must have at least 2 items");
  return union as [T, T, ...T[]];
}
