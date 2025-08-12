import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { inspect } from "node:util";
import {
  Agent,
  type AgentInput,
  type AgentInvokeOptions,
  type AgentOutput,
  type AgentProcessAsyncGenerator,
  type AgentResponseChunk,
  type AgentResponseStream,
  AIAgent,
  AIAgentToolChoice,
  AIGNE,
  FunctionAgent,
  isAgentResponseDelta,
  type Message,
  textDelta,
} from "@aigne/core";
import { guideRailAgentOptions } from "@aigne/core/agents/guide-rail-agent";
import {
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";
import { z } from "zod";
import { OpenAIChatModel } from "../_mocks/mock-models.js";
import { expectType } from "../_utils/expect.js";
import { createToolCallResponse } from "../_utils/openai-like-utils.js";

test("Custom agent", async () => {
  // #region example-custom-agent

  class MyAgent extends Agent {
    process(input: Message): Message {
      console.log(input);

      return {
        text: "Hello, How can I assist you today?",
      };
    }
  }

  const agent = new MyAgent();

  const result = await agent.invoke({ message: "hello" });

  console.log(result); // { text: "Hello, How can I assist you today?" }

  expect(result).toEqual({ text: "Hello, How can I assist you today?" });

  // #endregion example-custom-agent
});

test("Custom agent returning a direct object", async () => {
  // #region example-process-direct-response

  class DirectResponseAgent extends Agent {
    process(input: Message): Message {
      // Process input and return a direct object response
      return {
        text: `Hello, I received your message: ${JSON.stringify(input)}`,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      };
    }
  }

  const agent = new DirectResponseAgent();

  const result = await agent.invoke({ message: "Hello" });

  console.log(result); // { text: "Hello, I received your message: { message: 'Hello' }", confidence: 0.95, timestamp: "2023-10-01T12:00:00Z" }

  expect(result).toEqual({
    text: expect.stringContaining("Hello, I received your message:"),
    confidence: 0.95,
    timestamp: expect.any(String),
  });

  // #endregion example-process-direct-response
});

test("Agent returning a ReadableStream", async () => {
  // #region example-process-streaming-response

  class StreamResponseAgent extends Agent {
    process(_input: Message): AgentResponseStream<Message> {
      // Return a ReadableStream as a streaming response
      return new ReadableStream({
        start(controller) {
          controller.enqueue(textDelta({ text: "Hello" }));
          controller.enqueue(textDelta({ text: ", " }));
          controller.enqueue(textDelta({ text: "This" }));
          controller.enqueue(textDelta({ text: " is" }));
          controller.enqueue(textDelta({ text: "..." }));
          controller.close();
        },
      });
    }
  }

  const agent = new StreamResponseAgent();
  const stream = await agent.invoke({ message: "Hello" }, { streaming: true });

  let fullText = "";
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) fullText += text;
    }
  }

  console.log(fullText); // Output: "Hello, This is..."

  expect(fullText).toBe("Hello, This is...");
  // #endregion example-process-streaming-response
});

test("Agent using AsyncGenerator", async () => {
  // #region example-process-async-generator

  class AsyncGeneratorAgent extends Agent {
    async *process(
      _input: Message,
      _options: AgentInvokeOptions,
    ): AgentProcessAsyncGenerator<Message> {
      // Use async generator to produce streaming results
      yield textDelta({ message: "This" });
      yield textDelta({ message: "," });
      yield textDelta({ message: " " });
      yield textDelta({ message: "This" });
      yield textDelta({ message: " " });
      yield textDelta({ message: "is" });
      yield textDelta({ message: "..." });

      // Optional return a JSON object at the end
      return { time: new Date().toISOString() };
    }
  }

  const agent = new AsyncGeneratorAgent();
  const stream = await agent.invoke({ message: "Hello" }, { streaming: true });

  const message: string[] = [];
  let json: Message | undefined;

  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.message;
      if (text) message.push(text);
      if (chunk.delta.json) json = chunk.delta.json;
    }
  }

  console.log(message); // Output: ["This", ",", " ", "This", " ", "is", "..."]
  console.log(json); // Output: { time: "2023-10-01T12:00:00Z" }

  expect(message).toEqual(["This", ",", " ", "This", " ", "is", "..."]);
  expect(json).toEqual({ time: expect.any(String) });

  // #endregion example-process-async-generator
});

test("Agent returning another agent (transfer agent)", async () => {
  // #region example-process-transfer

  class SpecialistAgent extends Agent {
    process(_input: Message): Message {
      return {
        response: "This is a specialist response",
        expertise: "technical",
      };
    }
  }

  class MainAgent extends Agent {
    process(_input: Message): Agent {
      // Create a specialized agent for handling technical issues
      return new SpecialistAgent();
    }
  }

  const aigne = new AIGNE({});
  const mainAgent = new MainAgent();

  const result = await aigne.invoke(mainAgent, { message: "technical question" });
  console.log(result); // { response: "This is a specialist response", expertise: "technical" }

  expect(result).toEqual({ response: "This is a specialist response", expertise: "technical" });

  // #endregion example-process-transfer
});

test("Agent.invoke with regular response", async () => {
  // #region example-invoke

  // Create a chat model
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
  });

  // Create an Agent instance
  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
    inputKey: "message",
  });

  // Invoke the agent
  const result = await aigne.invoke(agent, { message: "hello" });

  console.log(result); // Output: { message: "Hello, How can I assist you today?" }

  expect(result).toEqual({ message: "Hello, How can I assist you today?" });

  // #endregion example-invoke
});

test("Agent.invoke with streaming response", async () => {
  // #region example-invoke-streaming

  // Create a chat model
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
  });

  // Create an Agent instance
  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
    inputKey: "message",
  });

  // Invoke the agent with streaming enabled
  const stream = await aigne.invoke(agent, { message: "hello" }, { streaming: true });

  const chunks: string[] = [];

  // Read the stream using an async iterator
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.message;
      if (text) {
        chunks.push(text);
      }
    }
  }

  console.log(chunks); // Output: ["Hello", ",", " ", "How", " ", "can", " ", "I", " ", "assist", " ", "you", " ", "today", "?"]

  expect(chunks).toMatchSnapshot();

  // #endregion example-invoke-streaming
});

test("FunctionAgent.from a function", async () => {
  // #region example-function-agent

  const agent = FunctionAgent.from(({ name }: { name: string }) => {
    return {
      greeting: `Hello, ${name}!`,
    };
  });

  const result = await agent.invoke({ name: "Alice" });

  console.log(result); // Output: { greeting: "Hello, Alice!" }

  expect(result).toEqual({ greeting: "Hello, Alice!" });

  // #endregion example-function-agent
});

test("FunctionAgent.from a function without options", async () => {
  // #region example-function-agent-from-function

  const agent = FunctionAgent.from(({ a, b }: { a: number; b: number }) => {
    return { sum: a + b };
  });

  const result = await agent.invoke({ a: 5, b: 10 });

  console.log(result); // Output: { sum: 15 }

  expect(result).toEqual({ sum: 15 });

  // #endregion example-function-agent-from-function
});

test("FunctionAgent.from a function return stream", async () => {
  // #region example-function-agent-stream

  const agent = FunctionAgent.from(({ name }: { name: string }) => {
    return new ReadableStream<AgentResponseChunk<{ text: string }>>({
      start(controller) {
        controller.enqueue(textDelta({ text: "Hello" }));
        controller.enqueue(textDelta({ text: ", " }));
        controller.enqueue(textDelta({ text: name }));
        controller.enqueue(textDelta({ text: "!" }));
        controller.close();
      },
    });
  });

  const result = await agent.invoke({ name: "Alice" });

  console.log(result); // Output: { text: "Hello, Alice!" }

  expect(result).toEqual({ text: "Hello, Alice!" });

  // #endregion example-function-agent-stream
});

test("FunctionAgent.from a function return async iterator", async () => {
  // #region example-function-agent-async-generator

  const agent = FunctionAgent.from(async function* ({ name }: { name: string }) {
    yield textDelta({ text: "Hello" });
    yield textDelta({ text: ", " });
    yield textDelta({ text: name });
    yield textDelta({ text: "!" });
  });

  const result = await agent.invoke({ name: "Alice" });

  console.log(result); // Output: { text: "Hello, Alice!" }

  expect(result).toEqual({ text: "Hello, Alice!" });

  // #endregion example-function-agent-async-generator
});

test("Agent.shutdown", async () => {
  // #region example-agent-shutdown

  class MyAgent extends Agent {
    override process(input: Message): Message {
      return { text: `Hello, ${input}` };
    }

    override async shutdown() {
      console.log("Agent is shutting down...");
      // Clean up resources, close connections, etc.
    }
  }

  const agent = new MyAgent();

  const shutdown = spyOn(agent, "shutdown");

  await agent.shutdown();

  expect(shutdown).toHaveBeenCalled();

  // #endregion example-agent-shutdown
});

test("Agent.shutdown by `using` statement", async () => {
  // #region example-agent-shutdown-by-using

  class MyAgent extends Agent {
    override process(input: Message): Message {
      return { text: `Hello, ${input}` };
    }

    override async shutdown() {
      console.log("Agent is shutting down...");
      // Clean up resources, close connections, etc.
    }
  }

  // agent will be automatically disposed of at the end of this block
  await using agent = new MyAgent();

  const shutdown = spyOn(agent, "shutdown");
  expect(shutdown).not.toHaveBeenCalled();

  // #endregion example-agent-shutdown-by-using
});

test("Agent should return the original error from guide rails", async () => {
  const legalModel = new OpenAIChatModel();

  const financial = AIAgent.from({
    ...guideRailAgentOptions,
    model: legalModel,
    instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
  });

  class MyAgent extends Agent {
    override process(_input: Message): Message {
      return {
        text: "Bitcoin will likely reach $100,000 by next month based on current market trends.",
      };
    }
  }

  const agent = new MyAgent({ guideRails: [financial] });

  spyOn(legalModel, "process").mockReturnValueOnce(
    Promise.resolve({
      json: {
        abort: true,
        reason:
          "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
      },
    }),
  );

  const result = await agent.invoke({ message: "What will be the price of Bitcoin next year?" });

  expect(result).toEqual({
    $status: "GuideRailError",
    abort: true,
    reason:
      "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
  });
});

test("Agent can be intercepted by guide rails", async () => {
  // #region example-agent-guide-rails

  const model = new OpenAIChatModel();

  const legalModel = new OpenAIChatModel();

  const aigne = new AIGNE({ model });

  const financial = AIAgent.from({
    ...guideRailAgentOptions,
    model: legalModel,
    instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
  });

  const agent = AIAgent.from({
    guideRails: [financial],
  });

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "Bitcoin will likely reach $100,000 by next month based on current market trends.",
    }),
  );

  spyOn(legalModel, "process").mockReturnValueOnce(
    Promise.resolve({
      json: {
        abort: true,
        reason:
          "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
      },
    }),
  );

  const result = await aigne.invoke(agent, {
    message: "What will be the price of Bitcoin next month?",
  });

  console.log(result);
  // Output:
  // {
  //   "$status": "GuideRailError",
  //   "message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
  // }

  expect(result).toEqual({
    $status: "GuideRailError",
    message:
      "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
  });

  // #endregion example-agent-guide-rails
});

test("Agent should respond result if no any guide rails error", async () => {
  const model = new OpenAIChatModel();

  const legalModel = new OpenAIChatModel();

  const aigne = new AIGNE({ model });

  const financial = AIAgent.from({
    ...guideRailAgentOptions,
    model: legalModel,
    instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
  });

  const agent = AIAgent.from({
    guideRails: [financial],
    inputKey: "message",
  });

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "You can use AIGNE Framework create a useful agent!",
    }),
  );

  spyOn(legalModel, "process").mockReturnValueOnce(
    Promise.resolve({
      json: {
        abort: false,
        reason: "That is a normal response",
      },
    }),
  );

  const result = await aigne.invoke(agent, { message: "How to create an agent?" });

  expect(result).toEqual({
    message: "You can use AIGNE Framework create a useful agent!",
  });
});

test("Agent inspect should return it's name", async () => {
  expect(inspect(AIAgent.from({}))).toBe("AIAgent");

  expect(inspect(AIAgent.from({ name: "test_agent" }))).toBe("test_agent");
});

test("Agent should check input and output schema", async () => {
  const plus = FunctionAgent.from({
    name: "test-agent-plus",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      sum: z.number(),
    }),
    process: async (input) => {
      return {
        sum: input.a + input.b,
      };
    },
  });

  expect(
    plus.invoke({ a: "foo" as unknown as number, b: "bar" as unknown as number }),
  ).rejects.toThrow(
    "Agent test-agent-plus input check arguments error: a: Expected number, received string, b: Expected number, received string",
  );

  spyOn(plus, "_process").mockReturnValueOnce({
    sum: "3" as unknown as number,
  });
  expect(plus.invoke({ a: 1, b: 2 })).rejects.toThrow(
    "Agent test-agent-plus output check arguments error: sum: Expected number, received string",
  );
});

test("Agent hooks simple example", async () => {
  // #region example-agent-hooks

  const model = new OpenAIChatModel();

  const aigne = new AIGNE({ model });

  const weather = FunctionAgent.from({
    name: "weather",
    description: "Get the weather of a city",
    inputSchema: z.object({
      city: z.string(),
    }),
    outputSchema: z.object({
      temperature: z.number(),
    }),
    process: async (_input) => {
      return {
        temperature: 25,
      };
    },
  });

  const agent = AIAgent.from({
    hooks: {
      onStart: (event) => {
        console.log("Agent started:", event.input);
      },
      onEnd: (event) => {
        console.log("Agent ended:", event.input, event.output);
      },
      onSkillStart: (event) => {
        console.log(`Skill ${event.skill.name} started:`, event.input);
      },
      onSkillEnd: (event) => {
        console.log(`Skill ${event.skill.name} ended:`, event.input, event.output);
      },
    },
    skills: [weather],
    inputKey: "message",
  });

  const hooks = agent.hooks.at(0);
  assert(hooks);

  const onStart = spyOn(hooks, "onStart");
  const onEnd = spyOn(hooks, "onEnd");
  const onSkillStart = spyOn(hooks, "onSkillStart");
  const onSkillEnd = spyOn(hooks, "onSkillEnd");

  spyOn(model, "process")
    .mockReturnValueOnce({ toolCalls: [createToolCallResponse("weather", { city: "Paris" })] })
    .mockReturnValueOnce({ text: "The weather in Paris is 25 degrees." });

  const result = await aigne.invoke(agent, { message: "What is the weather in Paris?" });

  console.log(result);
  // Output: { message: "The weather in Paris is 25 degrees." }

  expect(result).toEqual({ message: "The weather in Paris is 25 degrees." });
  expect(onStart).toHaveBeenLastCalledWith(
    expect.objectContaining({ input: { message: "What is the weather in Paris?" } }),
  );
  expect(onEnd).toHaveBeenLastCalledWith(
    expect.objectContaining({
      input: { message: "What is the weather in Paris?" },
      output: { message: "The weather in Paris is 25 degrees." },
    }),
  );
  expect(onSkillStart).toHaveBeenLastCalledWith(
    expect.objectContaining({
      input: expect.objectContaining({ city: "Paris" }),
      skill: weather,
    }),
  );
  expect(onSkillEnd).toHaveBeenLastCalledWith(
    expect.objectContaining({
      input: expect.objectContaining({ city: "Paris" }),
      output: { temperature: 25 },
      skill: weather,
    }),
  );

  // #endregion example-agent-hooks
});

test("Agent hook onHandoff should work correctly", async () => {
  const model = new OpenAIChatModel();

  const aigne = new AIGNE({ model });

  const triage = AIAgent.from({
    hooks: {
      onHandoff(event) {
        console.log("Agent handoff:", event.target.name);
      },
    },
    skills: [
      function transferToFeedback() {
        return feedback;
      },
    ],
    toolChoice: AIAgentToolChoice.router,
    inputKey: "message",
  });

  const hooks = triage.hooks.at(0);
  assert(hooks);

  const onHandoff = spyOn(hooks, "onHandoff");

  const feedback = AIAgent.from({
    inputKey: "message",
  });

  spyOn(model, "process")
    .mockReturnValueOnce({ toolCalls: [createToolCallResponse("transferToFeedback", {})] })
    .mockReturnValueOnce({ text: "Hello, I am feedback agent." });

  const result = await aigne.invoke(triage, { message: "I want to give feedback" });

  expect(onHandoff).toHaveBeenLastCalledWith(
    expect.objectContaining({
      source: triage,
      target: feedback,
      input: { message: "I want to give feedback" },
    }),
  );

  expect(result).toEqual({ message: "Hello, I am feedback agent." });
});

test("AgentInput/AgentOutput should infer correct types", async () => {
  const agent = AIAgent.from({
    inputSchema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    outputSchema: z.object({
      greeting: z.string(),
      ageInMonths: z.number(),
    }),
  });

  expectType<AgentInput<typeof agent>>().is<{ name: string; age: number }>();
  expectType<AgentOutput<typeof agent>>().is<{ greeting: string; ageInMonths: number }>();
});

test("Agent must return a record type", async () => {
  // biome-ignore lint/security/noGlobalEval: just for testing
  const agent = FunctionAgent.from(() => eval("4 * 4"));

  expect(agent.invoke({}, { streaming: false })).rejects.toThrow(
    "expect to return a record type such as {result: ...}, but got (number): 16",
  );

  expect(readableStreamToArray(await agent.invoke({}, { streaming: true }))).rejects.toThrow(
    "expect to return a record type such as {result: ...}, but got (number): 16",
  );
});

test("Agent should merge default input before invoking", async () => {
  const agent = FunctionAgent.from({
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      foo: z.string().optional(),
    }),
    defaultInput: {
      description: "Default description",
      foo: { $get: "title" },
    },
    process: async (input) => input,
  });

  const result = await agent.invoke({ title: "Test Title" });
  expect(result).toEqual({
    title: "Test Title",
    description: "Default description",
    foo: "Test Title",
  });
});

test("Agent should prioritize direct input over default input", async () => {
  const agent = FunctionAgent.from({
    inputSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
      foo: z.string().optional(),
    }),
    defaultInput: {
      description: "Default description",
      foo: { $get: "title" },
    },
    process: async (input) => input,
  });

  const result = await agent.invoke({
    title: "Test Title",
    description: "Custom description",
    foo: "Custom Foo",
  });
  expect(result).toEqual({
    title: "Test Title",
    description: "Custom description",
    foo: "Custom Foo",
  });
});

test("Agent should render task title (string template) correctly", async () => {
  const agent = AIAgent.from({
    taskTitle: "Test Task for message: {{message}}",
  });

  expect(await agent.renderTaskTitle({ message: "Hello" })).toBe("Test Task for message: Hello");
});

test("Agent should render task title (function) correctly", async () => {
  const agent = AIAgent.from({
    taskTitle: (input) =>
      input.lang === "zh" ? `测试任务: {{message}}` : `Test Task for message: {{message}}`,
  });

  expect(await agent.renderTaskTitle({ lang: "zh", message: "Hello" })).toBe("测试任务: Hello");
  expect(await agent.renderTaskTitle({ lang: "en", message: "Hello" })).toBe(
    "Test Task for message: Hello",
  );
});
