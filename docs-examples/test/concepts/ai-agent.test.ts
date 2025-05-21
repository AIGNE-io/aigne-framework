import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, FunctionAgent, createMessage } from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

test("Example AIAgent: basic", async () => {
  // #region example-agent-basic

  // #region example-agent-basic-create-agent
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });

  const agent = AIAgent.from({ model });
  // #endregion example-agent-basic-create-agent

  // #region example-agent-basic-invoke
  spyOn(model, "process").mockReturnValueOnce({
    text: "AIGNE is a platform for building AI agents.",
  });
  const result = await agent.invoke("What is AIGNE?");
  console.log(result);
  // Output: { $message: "AIGNE is a platform for building AI agents." }
  expect(result).toEqual({ $message: "AIGNE is a platform for building AI agents." });
  // #endregion example-agent-basic-invoke

  // #region example-agent-basic-invoke-stream
  spyOn(model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("AIGNE is a platform for building AI agents."),
  );
  const stream = await agent.invoke("What is AIGNE?", undefined, { streaming: true });
  let response = "";
  for await (const chunk of stream) {
    if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
  }
  console.log(response);
  // Output:  "AIGNE is a platform for building AI agents."
  expect(response).toEqual("AIGNE is a platform for building AI agents.");
  // #endregion example-agent-basic-invoke-stream

  // #endregion example-agent-basic
});

test("Example AIAgent: custom instructions", async () => {
  // #region example-agent-custom-instructions

  // #region example-agent-custom-instructions-create-agent

  const model = new OpenAIChatModel();

  const agent = AIAgent.from({
    model,
    instructions: "Only speak in Haikus.",
  });
  // #endregion example-agent-custom-instructions-create-agent

  // #region example-agent-custom-instructions-invoke
  spyOn(model, "process").mockReturnValueOnce({
    text: "AIGNE stands for  \nA new approach to learning,  \nKnowledge intertwined.",
  });
  const result = await agent.invoke("What is AIGNE?");
  console.log(result);
  // Output: { $message: "AIGNE stands for  \nA new approach to learning,  \nKnowledge intertwined." }
  expect(result).toEqual({
    $message: "AIGNE stands for  \nA new approach to learning,  \nKnowledge intertwined.",
  });
  // #endregion example-agent-custom-instructions-invoke

  // #endregion example-agent-custom-instructions
});

test("Example AIAgent: custom instructions with variables", async () => {
  // #region example-agent-custom-instructions-with-variables

  // #region example-agent-custom-instructions-with-variables-create-agent

  const model = new OpenAIChatModel();

  const agent = AIAgent.from({
    model,
    inputSchema: z.object({
      style: z.string().describe("The style of the response."),
    }),
    instructions: "Only speak in {{style}}.",
  });
  // #endregion example-agent-custom-instructions-with-variables-create-agent

  // #region example-agent-custom-instructions-with-variables-invoke
  spyOn(model, "process").mockReturnValueOnce({
    text: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms.",
  });
  const result = await agent.invoke(createMessage("What is AIGNE?", { style: "Haikus" }));
  console.log(result);
  // Output: { $message: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms." }
  expect(result).toEqual({
    $message: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms.",
  });
  // #endregion example-agent-custom-instructions-with-variables-invoke

  // #endregion example-agent-custom-instructions
});

test("Example AIAgent: structured output", async () => {
  // #region example-agent-structured-output

  // #region example-agent-structured-output-create-agent

  const model = new OpenAIChatModel();

  const agent = AIAgent.from({
    model,
    inputSchema: z.object({
      style: z.string().describe("The style of the response."),
    }),
    outputSchema: z.object({
      topic: z.string().describe("The topic of the request"),
      response: z.string().describe("The response to the request"),
    }),
    instructions: "Only speak in {{style}}.",
  });
  // #endregion example-agent-structured-output-create-agent

  // #region example-agent-structured-output-invoke
  spyOn(model, "process").mockReturnValueOnce({
    json: {
      topic: "AIGNE",
      response: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms.",
    },
  });
  const result = await agent.invoke(createMessage("What is AIGNE?", { style: "Haikus" }));
  console.log(result);
  // Output: { topic: "AIGNE", response: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms." }
  expect(result).toEqual({
    topic: "AIGNE",
    response: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms.",
  });
  // #endregion example-agent-structured-output-invoke

  // #endregion example-agent-structured-output
});

test("Example AIAgent: with weather skill", async () => {
  // #region example-agent-with-skills

  // #region example-agent-with-skills-create-skill
  const getWeather = FunctionAgent.from({
    name: "get_weather",
    description: "Get the current weather for a location.",
    inputSchema: z.object({
      location: z.string().describe("The location to get weather for"),
    }),
    outputSchema: z.object({
      temperature: z.number().describe("The current temperature in Celsius"),
      condition: z.string().describe("The current weather condition"),
      humidity: z.number().describe("The current humidity percentage"),
    }),
    process: async ({ location }) => {
      console.log(`Fetching weather for ${location}`);
      // This would typically call a weather API
      return {
        temperature: 22,
        condition: "Sunny",
        humidity: 45,
      };
    },
  });
  // #endregion example-agent-with-skills-create-skill

  // #region example-agent-with-skills-create-agent
  const agent = AIAgent.from({
    model: new OpenAIChatModel(),
    instructions: "You are a helpful assistant that can provide weather information.",
    skills: [getWeather],
  });
  assert(agent.model);
  // #endregion example-agent-with-skills-create-agent

  // #region example-agent-with-skills-invoke
  spyOn(agent.model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "The current weather in Beijing is 22°C with sunny conditions and 45% humidity.",
    }),
  );

  const result = await agent.invoke("What's the weather like in Beijing today?");
  console.log(result);
  // Output: { $message: "The current weather in Beijing is 22°C with sunny conditions and 45% humidity." }
  expect(result).toEqual({
    $message: "The current weather in Beijing is 22°C with sunny conditions and 45% humidity.",
  });
  // #endregion example-agent-with-skills-invoke

  // #endregion example-agent-with-skills
});
