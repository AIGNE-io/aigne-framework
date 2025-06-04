import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { assert, expect, test, vi } from "vitest";

test("AIGNE core should work in Node.js", async () => {
  const agent = AIAgent.from({
    name: "memory_example",
    instructions: "You are a friendly chatbot",
  });

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });

  assert(aigne.model);
  vi.spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "Hello, I am a chatbot!",
  });

  const result = await aigne.invoke(agent, "Hello, What is your name?");

  expect(result).toEqual({
    $message: "Hello, I am a chatbot!",
  });
});
