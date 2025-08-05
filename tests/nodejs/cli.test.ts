import { spawnSync } from "node:child_process";
import { runAgentWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { assert, expect, test, vi } from "vitest";

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
    chat: false,
    input: { message: "Hello, What is your name?" },
  });

  expect(result?.result).toEqual({
    message: "Hello, I am a chatbot!",
  });
});

test("AIGNE cli should work in Node.js", async () => {
  const { status, stdout } = spawnSync("npx", ["aigne", "--version"], { stdio: "pipe" });

  console.log({ status, stdout: stdout.toString() });

  expect(status).toBe(0);
  expect(stdout.toString()).toMatch(/\d+\.\d+\.\d+/);
});
