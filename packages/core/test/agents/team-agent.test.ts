import { expect, spyOn, test } from "bun:test";
import { AIAgent, AIGNE } from "@aigne/core";
import { ProcessMode, TeamAgent } from "@aigne/core/agents/team-agent";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import {
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";

const processModes = Object.values(ProcessMode);

test.each(processModes)(
  "TeamAgent should return streaming response with %s process method (multiple agent with different output keys)",
  async (mode) => {
    const model = new OpenAIChatModel();

    const aigne = new AIGNE({ model });

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
      skills: [first, second],
      mode,
    });

    const stream = await aigne.invoke(team, "hello", { streaming: true });

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

    const stream = await aigne.invoke(team, "hello", { streaming: true });

    expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
  },
);
