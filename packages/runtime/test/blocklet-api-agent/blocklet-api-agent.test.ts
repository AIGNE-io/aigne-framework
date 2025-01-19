import { expect, mock, spyOn, test } from "bun:test";
import { mockFetch } from "@aryzing/bun-mock-fetch";

import { Runtime } from "@aigne/core";
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

test("BlockletAPIAgent.run with get method", async () => {
  const agent = BlockletAPIAgent.create({
    context: new Runtime({ state: { loginToken: "test_login_token" } }),
    inputs: openAPITestInputs,
    outputs: openAPITestOutputs,
    apiId,
  });

  spyOn(agent, "fetch").mockImplementation((request) =>
    Promise.resolve(request),
  );

  const result = await agent.run({
    id: "123",
    message: "hello",
    message1: "hello world2",
    message2: "hello world3",
  });

  expect(result.url).toEqual(
    "https://api.example.com/discuss-kit/api/v1/sdk/posts/123",
  );
  expect(result.method).toEqual("get");
  expect(result.query).toEqual({ message: "hello" });
  expect(result.headers).toEqual({
    message2: "hello world3",
    Authorization: "Bearer test_login_token",
  });
  expect(result.cookies).toEqual({ message1: "hello world2" });
  expect(result.body).toBeUndefined();
});
