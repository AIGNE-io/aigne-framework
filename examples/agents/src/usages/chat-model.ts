import {
  ChatMessagesTemplate,
  ChatModelOpenAI,
  UserMessageTemplate,
} from "@aigne/core";

const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const messages = ChatMessagesTemplate.from([
  UserMessageTemplate.from("Hello, I'm {{username}}. What's your name?"),
]);

const result = await model.run({
  messages: messages.format({ username: "Bob" }),
});

console.log(result);

// output:
// {
//   text: "Hello, Bob! I’m an AI language model, so I don’t have a personal name, but you can call me Assistant. How can I help you today?",
// }
