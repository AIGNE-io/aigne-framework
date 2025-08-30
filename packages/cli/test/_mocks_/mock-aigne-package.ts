import { randomUUID } from "node:crypto";
import type { AgentV1, ProjectDefinitionV1 } from "@aigne/cli/utils/agent-v1";
import archiver from "archiver";
import { stringify } from "yaml";

const randomId = () => randomUUID();

export async function mockAIGNEPackage() {
  const mockPackage = archiver("tar", {
    gzip: true,
    store: false,
  });
  mockPackage.append(
    `\
chat_model:
name: gpt-4o-mini
agents:
  - chat.yaml
cli:
  agents:
    - chat.yaml
  `,
    { name: "aigne.yaml" },
  );
  mockPackage.append(
    `\
name: chat
description: A simple chat agent
instructions: You are a helpful assistant.
  `,
    {
      name: "chat.yaml",
    },
  );

  await mockPackage.finalize();

  return archiverToReadableStream(mockPackage);
}

export async function mockAIGNEV1Package() {
  const mockPackage = archiver("tar", {
    gzip: true,
    store: false,
  });
  mockPackage.append(
    stringify(<ProjectDefinitionV1["project"]>{
      id: randomId(),
      name: "test-aigne-v1-package",
      description: "A simple test package",
    }),
    { name: "project.yaml" },
  );

  const testInputOutput: AgentV1 & { type: "prompt" } = {
    id: randomId(),
    type: "prompt",
    name: "chat",
    description: "A simple chat agent",
    parameters: [
      {
        id: randomId(),
        key: "question",
        placeholder: "What are you searching for?",
      },
      {
        id: randomId(),
        key: "category",
        type: "string",
        placeholder: "Category of the question",
      },
      {
        id: randomId(),
        key: "language",
        type: "language",
        placeholder: "Language of the question",
      },
      {
        id: randomId(),
        key: "tags",
        type: "select",
        options: [
          {
            id: randomId(),
            label: "tag1",
            value: "tag1",
          },
          {
            id: randomId(),
            label: "tag2",
            value: "tag2",
          },
        ],
      },
    ],
    outputVariables: [
      {
        id: randomId(),
        name: "$text",
        type: "string",
      },
      {
        id: randomId(),
        name: "meta",
        type: "object",
        properties: [
          {
            id: randomId(),
            name: "category",
            description: "Category of the question",
            required: true,
          },
        ],
      },
      {
        id: randomId(),
        name: "tags",
        type: "array",
        element: {
          id: randomId(),
          type: "string",
          description: "Tag of the question",
        },
        description: "Tags of the question",
      },
    ],
    prompts: [
      {
        type: "message",
        data: {
          id: randomId(),
          role: "system",
          content: "You are a helpful assistant.",
        },
      },
    ],
  };
  mockPackage.append(stringify(testInputOutput), {
    name: "prompts/testInputOutput.yaml",
  });

  const llm: AgentV1 & { type: "prompt" } = {
    id: randomId(),
    type: "prompt",
    name: "chat",
    description: "A simple chat agent",
    parameters: [
      {
        id: randomId(),
        key: "question",
        placeholder: "What are you searching for?",
      },
    ],
    outputVariables: [
      {
        id: randomId(),
        name: "$text",
        type: "string",
      },
    ],
    prompts: [
      {
        type: "message",
        data: {
          id: randomId(),
          role: "system",
          content: "You are a helpful assistant.",
        },
      },
    ],
  };
  mockPackage.append(stringify(llm), {
    name: "prompts/llm.yaml",
  });

  const plus: AgentV1 & { type: "function" } = {
    id: randomId(),
    type: "function",
    name: "plus",
    description: "A simple plus agent",
    parameters: [
      {
        id: randomId(),
        key: "a",
        type: "number",
        placeholder: "First number",
      },
      {
        id: randomId(),
        key: "b",
        type: "number",
        placeholder: "Second number",
      },
    ],
    outputVariables: [
      {
        id: randomId(),
        name: "result",
        type: "number",
      },
    ],
    code: `\
return {
  result: a + b
};
`,
  };
  mockPackage.append(stringify(plus), {
    name: "prompts/plus.yaml",
  });

  const decision: AgentV1 & { type: "router" } = {
    id: randomId(),
    type: "router",
    name: "decision",
    description: "A simple decision agent",
    prompt: "You are a decision agent.",
    routes: [
      {
        id: llm.id,
      },
      {
        id: plus.id,
      },
    ],
  };
  mockPackage.append(stringify(decision), {
    name: "prompts/chat.yaml",
  });

  await mockPackage.finalize();

  return archiverToReadableStream(mockPackage);
}

function archiverToReadableStream(archiver: archiver.Archiver) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const a of archiver) {
          controller.enqueue(a);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
