# 记忆

本指南演示了如何构建一个有状态的聊天机器人，该机器人可以在多个会话之间保留对话历史。通过利用 `FSMemory` 插件，Agent 可以将回话数据持久化到本地文件系统，使其能够回忆起之前的交互。

## 概述

在许多对话式 AI 应用中，让 Agent 记住过去交互的上下文以提供连贯且相关的响应至关重要。AIGNE 框架通过其记忆组件解决了这个问题。本示例重点介绍 `FSMemory`，这是一种在本地磁盘上持久化对话历史的直接解决方案。

这种方法非常适合开发、测试或可以在本地管理状态而无需外部数据库或服务的应用。对于更高级或分布式的持久化，请考虑 [DIDSpacesMemory](./examples-memory-did-spaces.md) 等替代方案。

## 如何运行示例

你可以直接使用 `npx` 运行此示例。该命令将下载必要的软件包并执行聊天机器人脚本。

要在交互模式下启动聊天机器人，请在终端中执行以下命令：

```sh
npx -y @aigne/example-memory --chat
```

如果你尚未配置你的 LLM API 密钥，系统将提示你连接到 AIGNE Hub，该中心提供了一种简单的入门方式。

![AI 模型的初始连接提示](../../../examples/afs-memory/run-example.png)

## 代码详解

本示例的核心是将 `FSMemory` 插件与 `AIAgent` 集成。Agent 被配置为使用此记忆模块来自动保存和检索给定会话的对话历史。

下图说明了在聊天会话期间，`AIAgent`、`FSMemory` 插件和文件系统是如何交互的：

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![记忆](assets/diagram/examples-memory-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

### `main.ts`

主脚本初始化 Agent、注册记忆插件并启动对话循环。

```typescript main.ts icon=logos:typescript
import { AIAgent, AIGNE, FSMemory, command, define, option } from '@aigne/framework';
import { ChatOllama } from '@aigne/ollama';
import path from 'node:path';

const program = define({
  name: 'memory-chatbot',
  version: '1.0.0',
});

program(
  command({
    name: 'chat',
    description: 'Chat with the bot',
    options: [
      option({
        name: '--chat',
        description: 'Chat with the bot',
      }),
    ],
    action: async (_, { session }) => {
      const memory = new FSMemory({
        path: path.join(__dirname, '..', '.memory'),
        sessionId: session.id,
      });

      const llm = new ChatOllama({
        model: 'llama3',
      });

      const chatbot = new AIAgent({
        name: 'chatbot',
        model: llm,
        memory,
        instructions:
          'Your name is Mega. You are a helpful assistant. Please answer the user question.',
      });

      const aigne = new AIGNE({
        agents: [chatbot],
      });

      await aigne.chat(chatbot, {
        endOfStream: (message) => {
          if (message.type === 'end') {
            process.stdout.write('\n');
          }
          if (message.type === 'chunk') {
            process.stdout.write(message.payload.content);
          }
        },
      });
    },
  })
);

program.run();
```

该脚本的关键组成部分：

1.  **导入模块**：我们从 AIGNE 框架中导入 `AIAgent`、`AIGNE` 和 `FSMemory`。
2.  **初始化 `FSMemory`**：创建 `FSMemory` 的一个实例。
    *   `path`：指定将存储对话日志的目录 (`.memory`)。
    *   `sessionId`：对话会话的唯一标识符。这可确保不同聊天会话的历史记录分开存储。
3.  **配置 `AIAgent`**：实例化 `chatbot` Agent。
    *   `model`：用于生成响应的语言模型。
    *   `memory`：将 `FSMemory` 实例传递给 Agent 的构造函数。这将 Agent 连接到持久化层。
    *   `instructions`：定义 Agent 角色和目标的系统提示。
4.  **运行聊天**：`aigne.chat()` 方法启动交互式会话。框架会在会话开始时自动处理从 `FSMemory` 加载过去的消息，并在对话进行中保存新消息。

## 总结

在本示例中，你学习了如何使用 `FSMemory` 插件创建一个具有持久记忆的聊天机器人。这使得 Agent 能够通过从本地文件系统存储和检索对话历史来维持跨多个交互的上下文。这个基础概念是构建更高级、更具上下文感知能力的 AI 应用的关键。