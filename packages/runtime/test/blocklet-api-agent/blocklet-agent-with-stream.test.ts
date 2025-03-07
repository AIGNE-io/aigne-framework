import { expect, mock, spyOn, test } from "bun:test";
import { mockFetch } from "@aryzing/bun-mock-fetch";

import { BlockletAPIAgent } from "../../src/provider/blocklet-api-agent";
import {
  BlockletOpenAPIResponse,
  openAPITestInputs,
  openAPITestOutputs,
} from "../mocks/blocklet-open-api";

const appUrl = "https://api.example.com";

mock.module("@blocklet/sdk/lib/config", () => ({
  default: { env: { appUrl } },
}));

mock.module("@blocklet/sdk/lib/component", () => ({
  getComponentMountPoint: () => "/discuss-kit/",
}));

mockFetch("https://api.example.com/.well-known/service/openapi.json", {
  data: BlockletOpenAPIResponse,
});

const testAPI = BlockletOpenAPIResponse.paths["/api/v1/sdk/posts/{id}"];
const apiId = testAPI.get["x-id"];

test("BlockletAPIAgent.run with get method with streaming response", async () => {
  const agent = BlockletAPIAgent.create({
    inputs: openAPITestInputs,
    outputs: openAPITestOutputs,
    apiId,
  });

  spyOn(agent, "fetch").mockImplementation((request) => Promise.resolve(request));

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
        url: "https://api.example.com/discuss-kit/api/v1/sdk/posts/123",
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
