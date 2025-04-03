import { mock } from "bun:test";

export async function mockModule(
  modulePath: string,
  renderMocks: () => Promise<Record<string, unknown>> | Record<string, unknown>,
) {
  const original = await import(modulePath).then((res) => ({ ...res })).catch(() => ({}));
  const mocks = await Promise.resolve(renderMocks())
    .then((modules) => ({ modules }))
    .catch((error) => ({ error }));

  await mock.module(modulePath, () => {
    if ("error" in mocks) throw mocks.error;
    console.log({ original, mock: mocks.modules });
    return { ...original, ...mocks.modules };
  });
  return {
    [Symbol.asyncDispose]: async () => {
      await mock.module(modulePath, () => original);
    },
  };
}
