import { afterAll, afterEach, describe, expect, mock, test } from "bun:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AIGNE_ENV_FILE } from "@aigne/cli/utils/aigne-hub/constants.js";
import { loadAIGNE } from "@aigne/cli/utils/load-aigne.js";
import { pick } from "@aigne/core/utils/type-utils.js";
import { withEnv } from "@aigne/test-utils/utils/with-env.js";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";
import { createHonoServer } from "../_mocks_/server.js";

afterEach(() => {
  delete process.env.AIGNE_HUB_API_URL;
});

describe("load aigne", () => {
  describe("loadAIGNE", () => {
    test("should load aigne successfully with default env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      await writeFile(AIGNE_ENV_FILE, stringify({ default: { AIGNE_HUB_API_URL: url } }));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with default env file with custom url", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async (data) => {
        if (data.type === "input") {
          return { customUrl: url };
        }
        return { subscribe: "custom" };
      });

      await writeFile(AIGNE_ENV_FILE, stringify({ default: { AIGNE_HUB_API_URL: url } }));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with no env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with empty env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(AIGNE_ENV_FILE, stringify({}));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with no host env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          test: {
            AIGNE_HUB_API_KEY: "123",
          },
        }),
      );

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with no host key env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          [new URL(url).host]: {
            AIGNE_HUB_API_KEY1: "123",
          },
        }),
      );

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      close();
    });

    test("should load aigne successfully with no host key env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          [new URL(url).host]: {
            AIGNE_HUB_API_KEY: "123",
            AIGNE_HUB_API_URL: url,
          },
        }),
      );

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        modelOptions: { model: "aignehub/openai/gpt-4o", inquirerPromptFn: mockInquirerPrompt },
      });

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("123");
      close();
    });

    afterEach(async () => {
      await rm(AIGNE_ENV_FILE, { force: true });
    });
  });

  test("should prioritize MODEL env over options from aigne.yaml", async () => {
    const aigne1 = await loadAIGNE({
      path: join(import.meta.dirname, "../../test-agents"),
      modelOptions: {},
      imageModelOptions: {},
    });

    expect(aigne1.model?.name).toBe("OpenAIChatModel");
    expect(aigne1.imageModel?.name).toBe("OpenAIImageModel");

    using _ = withEnv({
      MODEL: "gemini/gemini-2.0-pro",
      IMAGE_MODEL: "gemini/gemini-2.5-flash-image-preview",
      GEMINI_API_KEY: "YOUR_GEMINI_API_KEY",
      ANTHROPIC_API_KEY: "YOUR_ANTHROPIC_API_KEY",
    });

    const aigne2 = await loadAIGNE({
      path: join(import.meta.dirname, "../../test-agents"),
      modelOptions: {},
      imageModelOptions: {},
    });
    expect(aigne2.model?.name).toBe("GeminiChatModel");
    expect(aigne2.imageModel?.name).toBe("GeminiImageModel");

    const aigne3 = await loadAIGNE({
      path: join(import.meta.dirname, "../../test-agents"),
      modelOptions: { model: "anthropic:claude-3-7-sonnet-latest" },
      imageModelOptions: { model: "doubao/seedream-4.0" },
    });
    expect(aigne3.model?.name).toBe("AnthropicChatModel");
    expect(aigne3.imageModel?.name).toBe("DoubaoImageModel");
  });

  test("should load models with custom options", async () => {
    const aigne1 = await loadAIGNE({
      path: join(import.meta.dirname, "../../test-agents"),
      modelOptions: {},
      imageModelOptions: {},
    });

    expect(pick(aigne1.model?.options ?? {}, "model", "modelOptions")).toMatchInlineSnapshot(`
      {
        "model": "gpt-4o-mini",
        "modelOptions": {
          "customOption": 1,
        },
      }
    `);
    expect(pick(aigne1.imageModel?.options ?? {}, "model", "modelOptions")).toMatchInlineSnapshot(`
      {
        "model": "gpt-image-1",
        "modelOptions": {
          "quality": "standard",
        },
      }
    `);
  });

  afterAll(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
  });
});
