import archiver from "archiver";

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

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const a of mockPackage) {
          controller.enqueue(a);
        }
      } catch (error) {
        controller.error(error);
      }
      controller.close();
    },
  });
}
