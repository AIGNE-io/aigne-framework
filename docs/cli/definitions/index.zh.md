# Agent 定义

[English](index.md) | **中文**

AIGNE 提供了灵活的 AI 代理创建方式。您可以通过简单的配置文件创建各种类型的 AI 代理，包括聊天机器人、工具助手和复杂的智能系统。

## 项目配置文件 (aigne.yaml)

`aigne.yaml` 是 AIGNE 项目的主配置文件，定义项目的整体设置以及包含的代理列表。

### 基本结构

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
```

### 配置选项

* `chat_model`: 定义默认使用的 AI 模型配置
  * `provider`: 【可选】模型提供商，可选值为 `openai`、`claude`、`xai`
  * `name`: 模型名称（如 `gpt-4o-mini`、`gpt-4o` 等）
  * `temperature`: 模型输出的随机性（0.0-1.0）。值越低，输出越确定性；值越高，输出越多样化和创新。
  * `top_p`: 【可选】采样时考虑的最高概率 token 数量
  * `frequency_penalty`: 【可选】降低重复出现 token 的概率
  * `presence_penalty`: 【可选】增加新 token 出现的概率
* `agents`: 项目包含的所有代理配置文件路径列表

## Agent 创建方式

AIGNE 提供三种不同的 Agent 创建方式，您可以根据项目需求选择合适的方式：

### [创建 AI Agent](agent.zh.md)

* 使用 YAML 格式的代理定义文件
* 适合快速创建聊天机器人和简单 AI 助手
* 配置简单，易于上手

### [创建 MCP Agent](mcp.zh.md)

* 通过 Model Context Protocol 连接外部资源
* 支持文件系统、数据库等外部工具集成
* 适合需要访问外部数据的复杂应用

### [通过 JS Function 创建 Agent](function.zh.md)

* 使用 JavaScript 函数实现自定义逻辑
* 支持完整的测试框架
* 适合需要复杂业务逻辑的高级应用
