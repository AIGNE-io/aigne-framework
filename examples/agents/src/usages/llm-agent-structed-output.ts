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

const chatbot = AIAgent.from({
  model,
  messages,
  outputSchema: z.object({
    sum: z.number().describe("The sum of two numbers"),
  }),
});

const result = await chatbot.run({ a: 10, b: 1 });

console.log(result);

// output:
// {
//   sum: 11
// }
