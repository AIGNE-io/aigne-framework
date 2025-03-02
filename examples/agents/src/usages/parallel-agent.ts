import {
  AIAgent,
  ChatMessagesTemplate,
  ChatModelOpenAI,
  ParallelAgent,
  Task,
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
});

const generateContentAgent = AIAgent.from({
  model,
  messages: ChatMessagesTemplate.from([
    UserMessageTemplate.from("Write an article content about {{topic}}."),
  ]),
});

const writerAgent = ParallelAgent.from({
  tasks: [
    new Task("title", generateTitleAgent),
    new Task("content", generateContentAgent),
  ],
});

const result = await writerAgent.run({ topic: "AI" });

console.log(result);

// output:
// {
//   title: {
//     text: "Beyond Imagination: The Transformative Power of Artificial Intelligence in Shaping Our Future",
//   },
//   content: {
//     text: "### The Transformative Power of Artificial Intelligence: Revolutionizing Our World\n\n#### Introduction\n\nArtificial Intelligence (AI) has transcended ..."
//   }
// }
