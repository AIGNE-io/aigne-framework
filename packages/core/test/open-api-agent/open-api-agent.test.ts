import { expect, spyOn, test } from "bun:test";

import { OpenAPIAgent } from "../../src";
import { openAPITestInputs, openAPITestOutputs } from "../mocks/open-api";

test("OpenAPIAgent.run with get method", async () => {
  const agent = OpenAPIAgent.create({
    inputs: openAPITestInputs,
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
    method: "get",
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

  expect(result.url).toEqual("https://api.example.com/test/123");
  expect(result.method.toLowerCase()).toEqual("get");
  expect(result.query).toEqual({ message: "hello" });
  expect(result.headers).toEqual({ message2: "hello world3" });
  expect(result.cookies).toEqual({ message1: "hello world2" });
  expect(result.body).toBeUndefined();
});

test("OpenAPIAgent.run with post method", async () => {
  const agent = OpenAPIAgent.create({
    inputs: {
      ...openAPITestInputs,
      message3: {
        type: "string",
        required: true,
        in: "body",
      },
    },
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
    method: "post",
  });

  spyOn(agent, "fetch").mockImplementation((request) =>
    Promise.resolve(request),
  );

  const result = await agent.run({
    id: "123",
    message: "hello",
    message1: "hello world2",
    message2: "hello world3",
    message3: "hello world4",
  });

  expect(result.url).toEqual("https://api.example.com/test/123");
  expect(result.method.toLowerCase()).toEqual("post");
  expect(result.query).toEqual({ message: "hello" });
  expect(result.headers).toEqual({ message2: "hello world3" });
  expect(result.cookies).toEqual({ message1: "hello world2" });
  expect(result.body).toEqual({ message3: "hello world4" });
});

test("OpenAPIAgent.run with get method and default parameter position in query", async () => {
  const agent = OpenAPIAgent.create({
    inputs: {
      message1: {
        type: "string",
        required: true,
      },
    },
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
    method: "get",
  });

  spyOn(agent, "fetch").mockImplementation((request) =>
    Promise.resolve(request),
  );

  const result = await agent.run({
    message1: "hello world2",
  });

  expect(result.url).toEqual("https://api.example.com/test/{id}");
  expect(result.method.toLowerCase()).toEqual("get");
  expect(result.query).toEqual({ message1: "hello world2" });
  expect(result.body).toBeUndefined();
});

test("OpenAPIAgent.run with basic auth", async () => {
  const agent = OpenAPIAgent.create({
    inputs: {},
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
    auth: {
      type: "basic",
      token: "123456",
      key: "Auth",
    },
  });

  spyOn(agent, "fetch").mockImplementation((request) =>
    Promise.resolve(request),
  );

  const result = await agent.run({});

  expect(result.headers).toEqual({ Auth: "Basic 123456" });
});

test("OpenAPIAgent.run with bearer auth", async () => {
  const agent = OpenAPIAgent.create({
    inputs: {},
    outputs: openAPITestOutputs,
    url: "https://api.example.com/test/{id}",
    method: "get",
    auth: {
      type: "bearer",
      token: "123456",
    },
  });

  spyOn(agent, "fetch").mockImplementation((request) =>
    Promise.resolve(request),
  );

  const result = await agent.run({});

  expect(result.headers).toEqual({ Authorization: "Bearer 123456" });
});
