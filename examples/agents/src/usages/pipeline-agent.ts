import {
  AIAgent,
  ChatMessagesTemplate,
  ChatModelOpenAI,
  UserMessageTemplate,
} from "@aigne/core";

const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const generateTitleAgent = AIAgent.from({
  model,
  messages: ChatMessagesTemplate.from([
    UserMessageTemplate.from("Generate a fancy article title about {{topic}}."),
  ]),
  outputKey: "title",
});

const writeArticleAgent = AIAgent.from({
  model,
  messages: ChatMessagesTemplate.from([
    UserMessageTemplate.from("Write an article about {{title}}."),
  ]),
});

const pipeline = generateTitleAgent.pipe(writeArticleAgent);

const result = await pipeline.run({ topic: "AI" });

console.log(result);

// output:
// {
//   text: "# Envisioning the Future: How Artificial Intelligence is Redefining Innovation..."
// }
