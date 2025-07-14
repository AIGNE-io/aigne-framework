import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, AIGNE, FunctionAgent, type Message } from "@aigne/core";
import { ProcessMode, TeamAgent } from "@aigne/core/agents/team-agent.js";
import {
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";
import { z } from "zod";
import { OpenAIChatModel } from "../_mocks/mock-models.js";

test("TeamAgent.from with sequential mode", async () => {
  // #region example-team-agent-sequential

  // Create individual specialized agents
  const translatorAgent = FunctionAgent.from({
    name: "translator",
    process: (input: Message) => ({
      translation: `${input.text} (translation)`,
    }),
  });

  const formatterAgent = FunctionAgent.from({
    name: "formatter",
    process: (input: Message) => ({
      formatted: `[formatted] ${input.translation || input.text}`,
    }),
  });

  // Create a sequential TeamAgent with specialized agents
  const teamAgent = TeamAgent.from({
    name: "sequential-team",
    mode: ProcessMode.sequential,
    skills: [translatorAgent, formatterAgent],
  });

  const result = await teamAgent.invoke({ text: "Hello world" });

  expect(result).toEqual({
    translation: "Hello world (translation)",
    formatted: "[formatted] Hello world (translation)",
  });
  console.log(result);
  // Expected output: {
  //   translation: "Hello world (translation)",
  //   formatted: "[formatted] Hello world (translation)"
  // }

  // #endregion example-team-agent-sequential
});

test("TeamAgent.from with parallel mode", async () => {
  // #region example-team-agent-parallel

  const googleSearch = FunctionAgent.from({
    name: "google-search",
    process: (input: Message) => ({
      googleResults: `Google search results for ${input.query}`,
    }),
  });

  const braveSearch = FunctionAgent.from({
    name: "brave-search",
    process: (input: Message) => ({
      braveResults: `Brave search results for ${input.query}`,
    }),
  });

  const teamAgent = TeamAgent.from({
    name: "parallel-team",
    mode: ProcessMode.parallel,
    skills: [googleSearch, braveSearch],
  });

  const result = await teamAgent.invoke({ query: "AI news" });

  expect(result).toEqual({
    googleResults: "Google search results for AI news",
    braveResults: "Brave search results for AI news",
  });

  console.log(result);
  // Expected output: {
  //   googleResults: "Google search results for AI news",
  //   braveResults: "Brave search results for AI news"
  // }

  // #endregion example-team-agent-parallel
});

const processModes = Object.values(ProcessMode);

test.each(processModes)(
  "TeamAgent should return streaming response with %s process method (multiple agent with different output keys)",
  async (mode) => {
    const model = new OpenAIChatModel();

    const aigne = new AIGNE({ model });

    const first = AIAgent.from({
      outputKey: "first",
      inputKey: "message",
    });

    const second = AIAgent.from({
      outputKey: "second",
      inputKey: "message",
    });

    spyOn(model, "process")
      .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, ")))
      .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, world!")));

    const team = TeamAgent.from({
      skills: [first, second],
      mode,
    });

    const stream = await aigne.invoke(team, { message: "hello" }, { streaming: true });

    expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
  },
);

test.each(processModes)(
  "TeamAgent should return streaming response with %s process method (multiple agent with same output key)",
  async (mode) => {
    const model = new OpenAIChatModel();

    const aigne = new AIGNE({ model });

    const first = AIAgent.from({
      outputKey: "text",
    });

    const second = AIAgent.from({
      outputKey: "text",
    });

    spyOn(model, "process")
      .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, ")))
      .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, world!")));

    const team = TeamAgent.from({
      skills: [first, second],
      mode,
    });

    const stream = await aigne.invoke(team, { message: "hello" }, { streaming: true });

    expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
  },
);

test("TeamAgent with sequential mode should yield output chunks correctly", async () => {
  const teamAgent = TeamAgent.from({
    name: "sequential-team",
    mode: ProcessMode.sequential,
    skills: [
      FunctionAgent.from({
        name: "search",
        process: async ({ question }: Message) => {
          return {
            question,
            result: [
              { title: "First Result", link: "https://example.com/1" },
              { title: "Second Result", link: "https://example.com/2" },
            ],
          };
        },
      }),
      AIAgent.from({
        name: "summarizer",
        instructions: "Summarize the search results:\n{{result}}",
        outputKey: "summary",
      }),
    ],
  });

  const aigne = new AIGNE({ model: new OpenAIChatModel() });

  assert(aigne.model);
  spyOn(aigne.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("First Result, Second Result"),
  );

  const stream = await aigne.invoke(teamAgent, { question: "What is AIGNE?" }, { streaming: true });
  expect(await readableStreamToArray(stream)).toMatchSnapshot();
});

test("TeamAgent with iterateOn should process array input correctly", async () => {
  const skill = FunctionAgent.from((input: { title: string }) => {
    return {
      description: `Description for ${input.title}`,
    };
  });
  const skillProcess = spyOn(skill, "process");

  const teamAgent = TeamAgent.from({
    mode: ProcessMode.sequential,
    inputSchema: z.object({
      sections: z.array(z.object({ title: z.string() })),
    }),
    iterateOn: "sections",
    skills: [skill],
  });

  const aigne = new AIGNE({});

  const response = await aigne.invoke(teamAgent, {
    sections: new Array(3).fill(0).map((_, index) => ({ title: `Test title ${index}` })),
  });
  expect(response).toMatchSnapshot();
  expect(skillProcess.mock.calls.map((i) => i[0])).toMatchSnapshot();
});

test("TeamAgent with iterateOn should iterate with previous step's output", async () => {
  const skill = FunctionAgent.from((input: { title: string }) => {
    return {
      description: `Description for ${input.title}`,
    };
  });
  const skillProcess = spyOn(skill, "process");

  const teamAgent = TeamAgent.from({
    mode: ProcessMode.sequential,
    inputSchema: z.object({
      sections: z.array(z.object({ title: z.string() })),
    }),
    iterateOn: "sections",
    iterateWithPreviousOutput: true,
    skills: [skill],
  });

  const aigne = new AIGNE({});

  const response = await aigne.invoke(teamAgent, {
    sections: new Array(3).fill(0).map((_, index) => ({ title: `Test title ${index}` })),
  });
  expect(response).toMatchSnapshot();
  expect(skillProcess.mock.calls.map((i) => i[0])).toMatchSnapshot();
});

test("TeamAgent should throw an error if skills is empty", async () => {
  const teamAgent = TeamAgent.from({
    mode: ProcessMode.sequential,
  });

  const aigne = new AIGNE({});

  expect(aigne.invoke(teamAgent, {})).rejects.toThrow(
    "TeamAgent must have at least one skill defined.",
  );
});
