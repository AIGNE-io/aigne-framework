import {
  AIAgent,
  ChatMessagesTemplate,
  ChatModelOpenAI,
  UserMessageTemplate,
} from "@aigne/core";

ChatMessagesTemplate.from([UserMessageTemplate.from("{{a}} + {{b}} = ?")]);

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
});

const result = await chatbot.run({ a: 10, b: 1 });

console.log(result);

// output:
// {
//   text: "10 + 1 = 11.",
// }
