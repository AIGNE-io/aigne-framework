# 🚀 构建你的 AI Agent 军团

[English](index.md) | **中文**

欢迎来到 AIGNE 的魔法世界！🎭 在这里，您可以像搭积木一样轻松创建强大的 AI 代理。无论是聊天机器人、工具助手，还是复杂的智能系统，AIGNE 都能让您的创意变为现实。

✨ **只需几行配置，即可拥有专属 AI 助手！**

## 🎯 项目配置文件 (aigne.yaml) - 您的 AI 世界指挥中心

`aigne.yaml` 是 AIGNE 项目的主配置文件，定义项目的整体设置以及包含的代理列表。

### 📝 基本结构 - 简单到令人惊喜

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
```

### 🔧 配置选项详解 - 每个参数都有它的魔法

* `chat_model`: 定义默认使用的 AI 模型配置
  * `provider`: 【可选】模型提供商，可选值为 `openai`、`claude`、`xai`
  * `name`: 模型名称（如 `gpt-4o-mini`、`gpt-4o` 等）
  * `temperature`: 模型输出的随机性（0.0-1.0）。值越低，输出越确定性；值越高，输出越多样化和创新。
  * `top_p`: 【可选】采样时考虑的最高概率 token 数量
  * `frequency_penalty`: 【可选】降低重复出现 token 的概率
  * `presence_penalty`: 【可选】增加新 token 出现的概率
* `agents`: 项目包含的所有代理配置文件路径列表

## 🎨 Agent 定义 - 三种创建方式，任您选择

就像选择画笔一样，AIGNE 为您提供了三种不同的 Agent 创建方式。每种方式都有其独特的优势，选择最适合您项目需求的那一种：

### 🤖 [创建 AI Agent](agent.zh.md) - 最直观的方式

* 📋 项目配置文件 (aigne.yaml) - 一切的起点
* 💬 YAML 格式代理定义 (chat.yaml) - 简洁优雅
* 🛠️ 基本配置和开发流程 - 新手友好

### 🔗 [创建 MCP Agent](mcp.zh.md) - 连接外部世界的桥梁

* 📁 MCP 代理配置 (filesystem.yaml) - 文件系统集成
* 🌐 连接外部工具和资源 - 无限可能
* 🔌 Model Context Protocol 集成 - 标准化连接

### ⚡ [通过 JS Function 创建 Agent](function.zh.md) - 程序员的最爱

* 💻 JavaScript 代理实现 (plus.js) - 代码即智能
* 🧪 代理测试文件 (plus.test.js) - 质量保证
* 🚀 高级功能和最佳实践 - 释放全部潜能
