import {
  AIAgent,
  ChatMessagesTemplate,
  ChatModelOpenAI,
  EvaluationAgent,
  EvaluationCheckAgent,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";

const model = new ChatModelOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});

const worker = AIAgent.from({
  model,
  messages: ChatMessagesTemplate.from([
    SystemMessageTemplate.from(`\
previous generate and review result:
tweet: {{tweet}}
reject reason: {{reason}}

You need to refer to the results of the previous review to answer the user’s questions
`),
    UserMessageTemplate.from("Generate a tweet about {{topic}}"),
  ]),
  outputKey: "tweet",
});

const checker = EvaluationCheckAgent.from({
  model,
  messages: ChatMessagesTemplate.from(
    `\
You are a responsible content reviewer, and you need to check the content below.

## Rules
- The content should be about the topic.
- The content should includes '#ArcBlock' hash.

## Topic
{{topic}}

## Content to review:
{{tweet}}`,
  ),
  reasonOutputKey: "reason",
});

const evaluation = EvaluationAgent.from({
  worker,
  checker,
});

const result = await evaluation.run({ topic: "AIGNE" });

console.log(result);

// output:
// {
//   tweet: "🚀 Excited to dive into the world of AIGNE! 🌐 A game-changer in AI governance, it paves the way for ethical and transparent AI development. Let's embrace innovation while ensuring responsibility! #AIGNE #AIethics #Innovation #ArcBlock",
// }
