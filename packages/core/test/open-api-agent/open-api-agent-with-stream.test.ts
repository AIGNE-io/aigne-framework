import { expect, spyOn, test } from "bun:test";

import { OpenAPIAgent } from "../../src";
import { openAPITestInputs, openAPITestOutputs } from "../mocks/open-api";

test("OpenAPIAgent.run with streaming response", async () => {
  const agent = OpenAPIAgent.create({
    inputs: openAPITestInputs,
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
  });

  spyOn(agent, "fetch").mockImplementation((request) =>
    Promise.resolve(request),
  );

  const result = await agent.run(
    {
      id: "123",
      message: "hello",
      message1: "hello world2",
      message2: "hello world3",
    },
    { stream: true },
  );

  const reader = result.getReader();

  expect(await reader.read()).toEqual({
    value: {
      $text: undefined,
      delta: {
        url: "https://api.example.com/test/123",
        method: "get",
        headers: {
          message2: "hello world3",
        },
        query: {
          message: "hello",
        },
        cookies: {
          message1: "hello world2",
        },
      },
    },
    done: false,
  });
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});

test("OpenAPIAgent.run handles stream errors", async () => {
  const agent = OpenAPIAgent.create({
    inputs: openAPITestInputs,
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
  });

  spyOn(agent, "fetch").mockImplementation(() =>
    Promise.reject(new Error("Network error")),
  );

  await expect(
    agent.run(
      {
        id: "123",
        message: "hello",
        message1: "hello world2",
        message2: "hello world3",
      },
      { stream: true },
    ),
  ).rejects.toThrow("Network error");
});
