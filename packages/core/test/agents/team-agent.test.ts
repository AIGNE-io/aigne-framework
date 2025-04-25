import { expect, spyOn, test } from "bun:test";
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { TeamAgent, type TeamAgentProcessMethod } from "@aigne/core/agents/team-agent";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import {
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";

const processMethods: TeamAgentProcessMethod[] = ["sequential", "parallel"];

test.each(processMethods)(
  "TeamAgent should return streaming response with %s process method (multiple agent with different output keys)",
  async (method) => {
    const model = new OpenAIChatModel();

    const engine = new ExecutionEngine({ model });

    const first = AIAgent.from({
      outputKey: "first",
    });

    const second = AIAgent.from({
      outputKey: "second",
    });

    spyOn(model, "process")
      .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, ")))
      .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, world!")));

    const team = TeamAgent.from({
      tools: [first, second],
      processMethod: method,
    });

    const stream = await engine.call(team, "hello", { streaming: true });

    expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
  },
);

test.each(processMethods)(
  "TeamAgent should return streaming response with %s process method (multiple agent with same output key)",
  async (method) => {
    const model = new OpenAIChatModel();

    const engine = new ExecutionEngine({ model });

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
      tools: [first, second],
      processMethod: method,
    });

    const stream = await engine.call(team, "hello", { streaming: true });

    expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
  },
);
