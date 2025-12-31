import { runAgentWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { assert, expect, test, vi } from "vitest";
import { spawnAsync } from "./utils.js";

test("runAgentWithAIGNE should work in Node.js", async () => {
  const agent = AIAgent.from({
    name: "memory_example",
    instructions: "You are a friendly chatbot",
    inputKey: "message",
  });

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });

  assert(aigne.model);
  vi.spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "Hello, I am a chatbot!",
  });

  const result = await runAgentWithAIGNE(aigne, agent, {
    interactive: false,
    input: { message: "Hello, What is your name?" },
  });

  expect(result?.result).toEqual({
    message: "Hello, I am a chatbot!",
  });
});

test("AIGNE cli should work in Node.js", async () => {
  const { status, stdout, stderr } = await spawnAsync("aigne", ["--version"], {
    shell: true,
  });

  if (stderr) console.error(stderr);

  expect({ status, stdout }).toEqual({
    status: 0,
    stdout: expect.stringMatching(/\d+\.\d+\.\d+/),
  });
});
