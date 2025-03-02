import { FunctionAgent, Runtime, reflection, runAll } from "@aigne/core";

const titleGenerator = FunctionAgent.from({
  function: ({ topic }: { topic: string }) => ({
    title: `The title is: ${topic}`,
  }),
});

const introGenerator = FunctionAgent.from({
  function: ({ title, topic }: { title: string; topic: string }) => ({
    introduction: `Introduction of the article ${title} about topic ${topic}`,
  }),
});

const contentGenerator = FunctionAgent.from({
  function: ({ title, topic }: { title: string; topic: string }) => ({
    content: `Content of the article ${title} about topic ${topic}`,
  }),
});

const posterGenerator = FunctionAgent.from({
  function: ({ topic, title }: { topic: string; title: string }) => ({
    poster: "https://www.example.com/poster.jpg",
  }),
});

const runtime = new Runtime();

runtime
  .runSequential(titleGenerator, { topic: "AI" })
  .then(reflection(introGenerator, FunctionAgent.from({})))
  .then(({ result }) => {});
