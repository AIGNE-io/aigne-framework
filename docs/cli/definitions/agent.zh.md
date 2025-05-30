# 创建 AI Agent

[English](agent.md) | **中文**

使用 AIGNE 的 YAML 配置方式，您可以快速创建功能强大的 AI Agent。通过简单的配置文件，即可定义 AI 的行为、输入输出格式和技能。

## 基本结构

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
skills:
  - plus.js
```

## 配置选项

* `name`: 代理的唯一标识符
* `description`: 简短描述代理的功能和用途
* `instructions`: 指导代理行为的详细指令（使用 YAML 的多行文本格式）
* `input_schema`: 【可选】输入参数的 JSON Schema 定义
  * `type`: 输入数据类型（顶层必须为 `object`）
  * `properties`: 输入参数的详细定义
  * `required`: 必须提供的参数列表
* `output_schema`: 【可选】输出结果的 JSON Schema 定义（仅当需要结构化数据输出时使用）
  * `type`: 输出数据类型（顶层必须为 `object`）
  * `properties`: 输出结果的详细定义
  * `required`: 必须返回的参数列表
* `output_key`: 【可选】输出文本的键名（默认为 `$message`，仅当没有 `output_schema` 时有效）
* `skills`: 【可选】代理可以使用的工具列表（JavaScript 文件，实现特定功能）
* `memory`: 【可选】启用代理的对话记忆功能。可以是：
  * 布尔值（`true` 启用，`false` 禁用）
  * 包含配置选项的对象：
    * `subscribe_topic`: 代理应该订阅的记忆主题数组

***

通过上述配置，您可以创建功能丰富的 AIGNE 代理。主要功能包括：

* 创建具有不同行为模式的 AI 助手
* 为 AI 配备各种技能和工具
* 启用对话记忆和学习能力
* 与其他系统和资源集成

**建议：** 从简单的聊天机器人开始，逐步添加更多功能来扩展 AI Agent 的能力。
