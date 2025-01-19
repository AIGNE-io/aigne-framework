# Agent

`Agent` 是一个基础的 `Runnable` 实现，其封装并简化了 `Runnable` 的 API，使其更容易处理 `streaming` 数据，同时也统一了输入输出的数据校验。

## AIGNE Framework 中内置的 Agents

AIGNE Framework 提供了多种内置的 `Agent`，满足不同场景的需求：

- **LLMAgent**：
  使用大语言模型实现的 AI Agent，可以通过人类语言设计运行逻辑。

- **LLMDecisionAgent**：
  基于大语言模型的决策 Agent，可根据给定的一组 `Runnable` 自动选择最适合的一个运行。

- **OpenAPIAgent**：
  调用开放 API 的 Agent，适用于各种场景的数据查询，如天气、新闻、股票价格、加密货币价格等。

- **BlockletAPIAgent**：
  使用 Blocklet API 构建的 Agent，可调用 Blocklet 提供的服务，如 DID Connect、DID Spaces、NFT、ABT Network 等功能。

- **PipelineAgent**：
  将多个 `Runnable` 组合成一个有序执行的 `Runnable`，按顺序依次运行每个步骤。

- **FunctionAgent**：
  使用 JavaScript 函数实现的 Agent，可用于数学计算、逻辑判断等精确计算场景。

- **SandboxFunctionAgent**：
  功能类似于 `FunctionAgent`，但运行于受限的沙盒环境中，确保安全性并限制函数的运行权限。

## LLM Model

`LLMAgent` 通过集成 `LLMModel` 来处理运行逻辑。`LLMModel` 是一个特殊的 `Runnable`，负责为 `LLMAgent` 提供大语言模型的功能支持。任何实现了 `LLM Model` 接口的 `Runnable` 都可以被 `LLMAgent` 使用。

### 内置的 LLM Model 实现

AIGNE Framework 中包含以下两种内置的 LLM Model：

- **OpenaiLLMModel**：
  提供对 OpenAI 模型的支持，可用于调用 GPT 系列模型。

- **GeminiLLMModel**：
  提供对 Gemini 模型的支持，适合需要更多可定制化的场景。

## 总结

通过丰富的内置 `Agent` 和灵活的 `LLM Model` 支持，AIGNE Framework 提供了强大的工具链，帮助开发者快速构建智能应用和复杂的逻辑流程。
