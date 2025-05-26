import { expect, test } from "bun:test";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { XAIChatModel } from "@aigne/xai";

test("Example chat models: OpenAI", async () => {
  // #region example-chat-models-openai
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });

  expect(model).toBeInstanceOf(OpenAIChatModel);
  // #endregion example-chat-models-openai
});

test("Example chat models: Anthropic", async () => {
  // #region example-chat-models-anthropic
  const model = new AnthropicChatModel({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-v1",
  });

  expect(model).toBeInstanceOf(AnthropicChatModel);
  // #endregion example-chat-models-anthropic
});

test("Example chat models: Google Gemini", async () => {
  // #region example-chat-models-gemini
  const model = new GeminiChatModel({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.0-flash",
  });

  expect(model).toBeInstanceOf(GeminiChatModel);
  // #endregion example-chat-models-gemini
});

test("Example chat models: AWS Bedrock", async () => {
  // #region example-chat-models-bedrock
  const model = new BedrockChatModel({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: "us-east-1",
    model: "us.amazon.nova-lite-v1:0",
  });

  expect(model).toBeInstanceOf(BedrockChatModel);
  // #endregion example-chat-models-bedrock
});

test("Example chat models: Ollama", async () => {
  // #region example-chat-models-ollama
  const model = new OllamaChatModel({
    baseURL: "http://localhost:11411",
    model: "llama3.2",
  });

  expect(model).toBeInstanceOf(OllamaChatModel);
  // #endregion example-chat-models-ollama
});

test("Example chat models: OpenRouter", async () => {
  // #region example-chat-models-open-router
  const model = new OpenRouterChatModel({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    model: "openai/gpt-4o",
  });

  expect(model).toBeInstanceOf(OpenRouterChatModel);
  // #endregion example-chat-models-open-router
});

test("Example chat models: DeepSeek", async () => {
  // #region example-chat-models-deepseek
  const model = new DeepSeekChatModel({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: "deepseek-chat",
  });

  expect(model).toBeInstanceOf(DeepSeekChatModel);
  // #endregion example-chat-models-deepseek
});

test("Example chat models: XAI", async () => {
  // #region example-chat-models-xai
  const model = new XAIChatModel({
    apiKey: process.env.XAI_API_KEY,
    model: "grok-2-latest",
  });

  expect(model).toBeInstanceOf(XAIChatModel);
  // #endregion example-chat-models-xai
});
