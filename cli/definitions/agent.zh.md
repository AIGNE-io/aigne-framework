# 🤖 创建 AI Agent - 让智能触手可及

[English](agent.md) | **中文**

🎉 想要拥有一个专属的 AI 助手吗？使用 AIGNE 的 YAML 配置方式，您只需几分钟就能创建出功能强大的 AI Agent！无需复杂的编程知识，就像填写表单一样简单。

## 🏗️ 基本结构 - 构建您的 AI 助手蓝图

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

## 🔍 配置选项详解 - 每个参数背后的秘密

* `name`: 🏷️ 代理的唯一标识符，就像给您的 AI 助手起个名字
* `description`: 📝 简短描述代理的功能和用途，让别人一眼就知道它能做什么
* `instructions`: 📚 指导代理行为的详细指令（使用 YAML 的多行文本格式），这是 AI 的"人格设定"
* `input_schema`: 📥 【可选】输入参数的 JSON Schema 定义，定义 AI 接收什么样的数据
  * `type`: 输入数据类型（顶层必须为 `object`）
  * `properties`: 输入参数的详细定义，像设计表单字段一样
  * `required`: 必须提供的参数列表，确保关键信息不遗漏
* `output_schema`: 📤 【可选】输出结果的 JSON Schema 定义（仅当需要结构化数据输出时使用）
  * `type`: 输出数据类型（顶层必须为 `object`）
  * `properties`: 输出结果的详细定义，让 AI 知道返回什么格式
  * `required`: 必须返回的参数列表，保证输出的完整性
* `output_key`: 🔑 【可选】输出文本的键名（默认为 `$message`，仅当没有 `output_schema` 时有效）
* `skills`: 🛠️ 【可选】代理可以使用的工具列表（JavaScript 文件，实现特定功能），为您的 AI 装备超能力
* `memory`: 🧠 【可选】启用代理的对话记忆功能，让 AI 记住你们的对话历史。可以是：
  * 布尔值（`true` 启用，`false` 禁用）
  * 包含配置选项的对象：
    * `subscribe_topic`: 代理应该订阅的记忆主题数组

***

🎊 **恭喜！** 通过上述配置，您已经掌握了创建 AIGNE 代理的核心技能。现在您可以：

✅ 创建具有不同性格的 AI 助手
✅ 为 AI 配备各种技能和工具
✅ 让 AI 拥有记忆和学习能力
✅ 与其他系统和资源无缝集成

💡 **小贴士：** 从简单的聊天机器人开始，逐步添加更多功能，您会发现 AI Agent 的无限可能！
