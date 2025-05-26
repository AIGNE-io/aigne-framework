import { expect, spyOn, test } from "bun:test";
import { nanoid } from "nanoid";
import {
  type AgentProcessResult,
  type AgentResponseStream,
  jsonDelta,
  textDelta,
} from "../../src/agents/agent.js";
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "../../src/agents/chat-model.js";

test("ChatModel implementation", async () => {
  // #region example-chat-model
  class TestChatModel extends ChatModel {
    override process(input: ChatModelInput): ChatModelOutput {
      // You can fetch upstream api here
      return {
        model: "gpt-4o",
        text: `Processed: ${input.messages[0]?.content || ""}`,
        usage: {
          inputTokens: 5,
          outputTokens: 10,
        },
      };
    }
  }

  const model = new TestChatModel();
  const result = await model.invoke({
    messages: [{ role: "user", content: "Hello" }],
  });

  console.log(result);
  // Output:
  // {
  //   text: "Processed: Hello",
  //   model: "gpt-4o",
  //   usage: {
  //     inputTokens: 5,
  //     outputTokens: 10
  //   }
  // }
  expect(result).toEqual({
    text: "Processed: Hello",
    model: "gpt-4o",
    usage: { inputTokens: 5, outputTokens: 10 },
  });
  // #endregion example-chat-model
});

test("ChatModel with streaming response", async () => {
  // #region example-chat-model-streaming
  class StreamingChatModel extends ChatModel {
    override process(_input: ChatModelInput): AgentResponseStream<ChatModelOutput> {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(textDelta({ text: "Processing" }));
          controller.enqueue(textDelta({ text: " your" }));
          controller.enqueue(textDelta({ text: " request" }));
          controller.enqueue(textDelta({ text: "..." }));
          controller.enqueue(
            jsonDelta({ model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } }),
          );
          controller.close();
        },
      });
    }
  }

  const model = new StreamingChatModel();
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Hello" }],
    },
    { streaming: true },
  );

  let fullText = "";
  const json: Partial<AgentProcessResult<ChatModelOutput>> = {};
  for await (const chunk of stream) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }

  console.log(fullText); // Output: "Processing your request..."
  console.log(json); // // Output: { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } }
  expect(fullText).toBe("Processing your request...");
  expect(json).toEqual({
    model: "gpt-4o",
    usage: { inputTokens: 5, outputTokens: 10 },
  });
  // #endregion example-chat-model-streaming
});

test("ChatModel with streaming response with async generator", async () => {
  // #region example-chat-model-streaming-async-generator
  class StreamingChatModel extends ChatModel {
    override async *process(_input: ChatModelInput): AgentProcessResult<ChatModelOutput> {
      yield textDelta({ text: "Processing" });
      yield textDelta({ text: " your" });
      yield textDelta({ text: " request" });
      yield textDelta({ text: "..." });

      return { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } };
    }
  }

  const model = new StreamingChatModel();
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Hello" }],
    },
    { streaming: true },
  );

  let fullText = "";
  const json: Partial<AgentProcessResult<ChatModelOutput>> = {};
  for await (const chunk of stream) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }

  console.log(fullText); // Output: "Processing your request..."
  console.log(json); // // Output: { model: "gpt-4o", usage: { inputTokens: 5, outputTokens: 10 } }
  expect(fullText).toBe("Processing your request...");
  expect(json).toEqual({
    model: "gpt-4o",
    usage: { inputTokens: 5, outputTokens: 10 },
  });
  // #endregion example-chat-model-streaming-async-generator
});

test("ChatModel with tools", async () => {
  // #region example-chat-model-tools
  class ToolEnabledChatModel extends ChatModel {
    override process(input: ChatModelInput): ChatModelOutput {
      // Mock a response with tool calls based on input
      const toolName = input.tools?.[0]?.function?.name;
      if (toolName) {
        return {
          toolCalls: [
            {
              id: "call_123",
              type: "function",
              function: {
                name: toolName,
                arguments: { param: "value" },
              },
            },
          ],
        };
      }

      return {
        text: "No tools available",
      };
    }
  }

  const model = new ToolEnabledChatModel();

  const result = await model.invoke({
    messages: [{ role: "user", content: "What's the weather?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get weather for a location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The location to get weather for",
              },
            },
          },
        },
      },
    ],
  });

  console.log(result);
  /* Output:
  {
    toolCalls: [
      {
        id: "call_123",
        type: "function",
        function: {
          name: "get_weather",
          arguments: { param: "value" }
        }
      }
    ]
  }
  */

  expect(result).toEqual({
    toolCalls: [
      {
        id: "call_123",
        type: "function",
        function: {
          name: "get_weather",
          arguments: { param: "value" },
        },
      },
    ],
  });
  // #endregion example-chat-model-tools
});

test("ChatModel should return capabilities", async () => {
  class ToolsChatModel extends ChatModel {
    override process(input: ChatModelInput): ChatModelOutput {
      const tool = input.tools?.[0];
      if (!tool) return { text: "no tools available" };

      return {
        toolCalls: [
          {
            id: nanoid(),
            type: "function",
            function: { name: tool.function.name, arguments: {} },
          },
        ],
      };
    }

    protected override supportsParallelToolCalls = false;
  }

  const model = new ToolsChatModel();

  expect(model.getModelCapabilities()).toEqual({
    supportsParallelToolCalls: false,
  });
});

test("ChatModel should auto convert tool name to valid function name", async () => {
  class ToolsChatModel extends ChatModel {
    override process(input: ChatModelInput): ChatModelOutput {
      const tool = input.tools?.[0];
      if (!tool) return { text: "no tools available" };

      return {
        toolCalls: [
          {
            id: nanoid(),
            type: "function",
            function: { name: tool.function.name, arguments: {} },
          },
        ],
      };
    }
  }

  const model = new ToolsChatModel();

  const process = spyOn(model, "process");

  const result = await model.invoke({
    messages: [{ role: "user", content: "What's the weather?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "get - weather",
          description: "Get weather for a location",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
    ],
  });

  expect(result).toEqual({
    toolCalls: [
      {
        id: expect.any(String),
        type: "function",
        function: { name: "get - weather", arguments: {} },
      },
    ],
  });

  expect(process.mock.lastCall?.[0].tools?.at(0)?.function.name).toEqual("get___weather");
});
