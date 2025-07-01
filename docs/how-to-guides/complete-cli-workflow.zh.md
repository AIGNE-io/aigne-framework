# AIGNE CLI 完整使用流程指南

[English](./complete-cli-workflow.md) | [中文](./complete-cli-workflow.zh.md)

本指南将带您完整体验 AIGNE CLI 的整个工作流程，从创建项目开始，到配置 Agent，再到运行和部署服务。通过这个端到端的流程，您将掌握使用 AIGNE CLI 开发和部署 AI Agent 的完整技能。

## 概述

AIGNE CLI 提供了一套完整的命令行工具，让您能够：

* 🚀 **快速创建项目** - 使用 `aigne create` 创建新的 AIGNE 项目
* ⚙️ **配置 Agent** - 通过 YAML 文件定义 Agent 的行为和能力
* ▶️ **运行和测试** - 使用 `aigne run` 运行 Agent 并进行交互测试
* 🌐 **部署服务** - 使用 `aigne serve-mcp` 将 Agent 部署为 MCP 服务器
* 📊 **监控观察** - 使用 `aigne observe` 监控 Agent 的运行状态

## 前置准备

在开始之前，请确保您已经：

1. **安装 Node.js** - 版本 v20 或更高
2. **安装 AIGNE CLI** - 全局安装 CLI 工具
3. **准备 API 密钥** - 获取您选择的 AI 模型提供商的 API 密钥

### 安装 AIGNE CLI

```bash
npm install -g @aigne/cli
```

验证安装：

```bash
aigne --version
```

## 创建新项目

使用 `aigne create` 命令创建一个新的 AIGNE 项目：

```bash
# 交互式创建项目
aigne create

# 或者指定项目名称
aigne create my-ai-assistant
```

命令执行后，CLI 会提示您输入项目名称，然后自动创建项目目录和基础配置文件。

### 项目结构

创建的项目包含以下基本结构：

```
my-ai-assistant/
├── aigne.yaml          # 主配置文件
├── chat.yaml           # 示例 Agent 配置
├── .env.local.example  # 环境变量示例
└── README.md           # 项目说明
```

## 配置环境变量

复制环境变量示例文件并配置您的 API 密钥：

```bash
cd my-ai-assistant
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，添加您的 API 密钥：

```bash
# OpenAI API 密钥
OPENAI_API_KEY=your_openai_api_key_here

# 或者其他模型提供商的密钥
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GOOGLE_API_KEY=your_google_api_key_here
```

## 配置主项目文件

编辑 `aigne.yaml` 文件，配置项目的全局设置：

```yaml
# 配置默认的聊天模型
chat_model:
  provider: openai         # 模型提供商
  name: gpt-4o-mini        # 模型名称
  temperature: 0.7         # 控制输出的随机性

# 指定项目中的 Agent 配置文件
agents:
  - chat.yaml              # 基础聊天 Agent
  - poem.yaml              # 诗歌创作 Agent（可选）
```

## 创建和配置 Agent

### 基础 Agent 配置

编辑 `chat.yaml` 文件，定义您的 Agent：

```yaml
name: chat
description: 智能聊天助手
instructions: |
  你是一个友善、专业的 AI 助手。你能够：
  - 回答各种问题
  - 提供有用的建议
  - 协助解决问题
  - 进行自然的对话

  请始终保持礼貌、准确和有帮助的态度。
input_key: message
memory: true              # 启用对话记忆
```

### 高级 Agent 配置

创建一个更复杂的 Agent，例如 `poem.yaml`：

```yaml
name: poem
description: 诗歌创作助手
instructions: |
  你是一个诗歌创作专家。你能够：
  - 创作各种风格的诗歌
  - 分析和评论诗歌
  - 提供诗歌创作技巧

  请使用富有表现力的语言，保持诗意和艺术性。
  请以 {{topic}} 为主题创作一首 {{style}} 风格的诗歌。

# 定义输入数据结构
input_schema:
  type: object
  properties:
    topic:
      type: string
      description: 诗歌主题
    style:
      type: string
      description: 诗歌风格（如现代、古典等）
  required:
    - topic
    - style

memory: true
```

## 运行 Agent

### 基本运行

使用 `aigne run` 命令运行您的 Agent：

```bash
# 运行默认 Agent
aigne run

# 运行特定 Agent
aigne run --entry-agent poem

# 启用聊天模式进行交互
aigne run --chat
```

### 单次查询模式

```bash
# 直接提供输入进行单次查询
aigne run --input "你好，请介绍一下自己"

# 使用特定模型
aigne run --model openai:gpt-4.1 --input "解释一下机器学习的基本概念"

# 使用特定 Agent 和输入
aigne run --entry-agent poem --input-topic "春天" --input-style "现代"
```

### 调整模型参数

```bash
# 设置较低温度获得更确定的输出
aigne run --temperature 0.2 --entry-agent poem --input-topic "秋天" --input-style "古典"
```

### 启用调试模式

```bash
# 启用详细日志
aigne run --log-level debug --chat
```

## 启动监控服务

在开发和测试过程中，您可以启动监控服务来观察 Agent 的运行状态：

```bash
# 启动监控服务（默认端口 7890）
aigne observe

# 使用自定义端口
aigne observe --port 8080

# 公开访问
aigne observe --host 0.0.0.0
```

监控服务启动后，您可以在浏览器中访问 `http://localhost:7890` 查看 Agent 的运行数据和性能指标。

## 部署为 MCP 服务器

当您的 Agent 开发完成并测试通过后，可以将其部署为 MCP 服务器：

```bash
# 启动 MCP 服务器（默认端口 3000）
aigne serve-mcp

# 使用自定义配置
aigne serve-mcp --host 0.0.0.0 --port 8080 --pathname /api/agents
```

接下来你可以在支持 MCP 的客户端中连接该服务器，进行交互和调用（注意 aigne serve-mcp 仅支持 streamable http 协议）。

## 总结

通过本指南，您已经掌握了 AIGNE CLI 的完整使用流程。从项目创建到生产部署，AIGNE CLI 提供了一套完整的工具链，让您能够高效地开发和部署 AI Agent。

记住，成功的 AI Agent 开发需要：

* 清晰的需求定义
* 合理的架构设计
* 持续的监控优化

现在您可以开始构建自己的 AI Agent 项目了！🚀
