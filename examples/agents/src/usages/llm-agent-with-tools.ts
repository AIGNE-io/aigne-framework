import {
  AIAgent,
  ChatMessagesTemplate,
  ChatModelOpenAI,
  FunctionAgent,
  Tool,
  UserMessageTemplate,
} from "@aigne/core";
import { z } from "zod";

const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const messages = ChatMessagesTemplate.from([
  UserMessageTemplate.from("{{a}} + {{b}} = ?"),
]);

const plus = FunctionAgent.from({
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  function: ({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }),
});

const plusTool = Tool.from({
  name: "plus",
  description: "Adds two numbers together",
  agent: plus,
});

const chatbot = AIAgent.from({
  model,
  messages,
  tools: [plusTool],
});

const result = await chatbot.run({ a: 10, b: 1 });

console.log(result);

// output:
// {
//   text: "10 + 1 = 11.",
// }
