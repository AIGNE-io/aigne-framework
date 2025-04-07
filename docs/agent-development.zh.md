# AIGNE 代理开发指南

[English](agent-development.md) | **中文**

AIGNE 框架使开发者能够通过简单的配置和代码文件创建强大的 AI 代理。本指南详细介绍如何编写 AIGNE 框架的核心文件：项目配置文件 `aigne.yaml`，代理定义文件（可以是 YAML 格式如 `chat.yaml` 或 JavaScript 格式如 `plus.js`）以及相应的测试文件。

## 目录

- [项目配置文件 (aigne.yaml)](#项目配置文件-aigneyaml)
- [YAML 格式代理定义 (chat.yaml)](#yaml-格式代理定义-chatyaml)
- [JavaScript 格式代理定义 (plus.js)](#javascript-格式代理定义-plusjs)
- [MCP 格式代理定义 (filesystem.yaml)](#mcp-格式代理定义-filesystemyaml)
- [代理测试文件 (plus.test.js)](#代理测试文件-plustestjs)
- [开发流程与最佳实践](#开发流程与最佳实践)

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

### 配置选项详解

- `chat_model`: 定义默认使用的 AI 模型配置
  - `provider`: 【可选】模型提供商，可选值为 `openai`、`claude`、`xai`
  - `name`: 模型名称（如 `gpt-4o-mini`、`gpt-4o` 等）
  - `temperature`: 模型输出的随机性（0.0-1.0）。值越低，输出越确定性；值越高，输出越多样化和创新。
  - `top_p`: 【可选】采样时考虑的最高概率 token 数量
  - `frequency_penalty`: 【可选】降低重复出现 token 的概率
  - `presence_penalty`: 【可选】增加新 token 出现的概率
- `agents`: 项目包含的所有代理配置文件路径列表

## YAML 格式代理定义 (chat.yaml)

代理可以通过 YAML 文件定义（如 `chat.yaml`），指定代理的基本信息、指令和可用工具。

### 基本结构

```yaml
name: chat
description: Chat agent
instructions: |
  You are a helpful assistant that can answer questions and provide information on a wide range of topics.
  Your goal is to assist users in finding the information they need and to engage in friendly conversation.
input_schema:
  type: object
  properties:
    message:
      type: string
      description: User message
  required:
    - "message"
output_schema:
  type: object
  properties:
    response:
      type: string
      description: AI response
  required:
    - "response"
output_key: text
tools:
  - plus.js
```

### 配置选项详解

- `name`: 代理的唯一标识符，用于在系统中引用该代理
- `description`: 简短描述代理的功能和用途
- `instructions`: 指导代理行为的详细指令（使用 YAML 的多行文本格式）
- `input_schema`: 【可选】输入参数的 JSON Schema 定义
  - `type`: 输入数据类型（顶层必须为 `object`）
  - `properties`: 输入参数的详细定义
  - `required`: 必须提供的参数列表
- `output_schema`: 【可选】输出结果的 JSON Schema 定义（仅当需要结构化数据输出时使用）
  - `type`: 输出数据类型（顶层必须为 `object`）
  - `properties`: 输出结果的详细定义
  - `required`: 必须返回的参数列表
- `output_key`: 【可选】输出文本的键名（默认为 `$message`，仅当没有 `output_schema` 时有效）
- `tools`: 【可选】代理可以使用的工具列表（JavaScript 文件，实现特定功能）

## JavaScript 格式代理定义 (plus.js)

代理也可以直接通过 JavaScript 代码定义，例如 `plus.js`。这些文件导出一个异步函数，接收输入参数并返回结果。

### 基本结构

```javascript
export default async function plus({ a, b }) {
  return { sum: a + b };
}

plus.description = "This agent adds two numbers together.";

plus.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "First number" },
    b: { type: "number", description: "Second number" },
  },
  required: ["a", "b"],
};

plus.output_schema = {
  type: "object",
  properties: {
    sum: { type: "number", description: "Sum of a and b" },
  },
  required: ["sum"],
};
```

### 结构详解

- `export default async function xxx()`: 导出工具的主函数，接收输入参数并返回结果
- `xxx.description`: 函数描述，提供工具的简要说明
- `xxx.input_schema`: 输入参数的 JSON Schema 定义，标准 JSON Schema 格式
- `xxx.output_schema`: 输出结果的 JSON Schema 定义，标准 JSON Schema 格式

## MCP 格式代理定义 (filesystem.yaml)

AIGNE 还支持 [MCP（Model Context Protocol）](https://modelcontextprotocol.io/introduction)代理，它允许您通过 MCP 服务器连接外部工具和资源。这些代理通过具有特定格式的 YAML 文件定义。

### 基本结构

MCP 代理可以通过两种方式定义：

1. 使用本地命令：

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

2. 使用 URL 连接到远程 MCP 服务器：

```yaml
type: mcp
url: "http://localhost:3000"
```

### 配置选项详解

使用本地命令时：
- `type`：必须设置为 `mcp`，表明这是一个 MCP 代理
- `command`：运行 MCP 服务器的基本命令
- `args`：传递给命令的参数数组
  - 第一个元素通常是实现 MCP 服务器的包名
  - 根据特定 MCP 服务器的需求，可以传递额外的参数

连接到远程服务器时：
- `type`：必须设置为 `mcp`，表明这是一个 MCP 代理
- `url`：要连接的远程 MCP 服务器的 URL

### MCP 代理工作原理

MCP 代理通过连接实现 Model Context Protocol 的 MCP 服务器工作。这些服务器可以提供：

1. **工具（Tools）**：可以被 AI 调用的可执行函数
2. **资源（Resources）**：可以被 AI 访问的数据源
3. **资源模板（Resource Templates）**：用于动态生成资源的模式

当 MCP 代理初始化时，AIGNE 框架将：

1. 使用提供的命令和参数启动 MCP 服务器
2. 连接到服务器并发现可用的工具和资源
3. 通过标准化接口使这些工具和资源对 AI 可用

## 代理测试文件 (plus.test.js)

AIGNE 支持使用 Node.js 内置测试框架编写测试。测试文件通常与代理实现文件位于同一目录，命名为 `xxx.test.js`。

```javascript
import assert from "node:assert";
import test from "node:test";
import plus from "./plus.js";

test("plus should add two numbers correctly", async () => {
  assert.deepEqual(await plus({ a: 1, b: 2 }), { sum: 3 });
});
```

## 开发流程与最佳实践

### 开发流程

1. 安装 AIGNE CLI：`npm install -g @aigne/cli`
2. 使用 AIGNE CLI 创建项目：`aigne create my-project`
3. 根据需求修改 `aigne.yaml` 配置
4. 创建或修改代理定义文件：
   - YAML 格式代理（如 `chat.yaml`）
   - JavaScript 格式代理（如 `plus.js`）
5. 编写测试文件验证功能
6. 使用 `aigne run` 运行代理，或 `aigne test` 执行测试

### 调试技巧

使用 `DEBUG` 环境变量查看详细日志：

```bash
# 显示所有 AIGNE 相关日志
export DEBUG=aigne:*

aigne run
# 或
aigne test
```

---

通过本指南，您应该能够开始开发和测试 AIGNE 代理。随着对框架的深入了解，您可以创建更复杂、更强大的代理系统。

参考 [AIGNE 官方文档](https://docs.aigne.io) 获取更多高级功能和示例。
