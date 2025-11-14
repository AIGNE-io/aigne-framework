# 记忆

本指南提供了构建一个能记住先前对话的聊天机器人的分步流程。通过遵循这些说明，您将创建一个有状态的 Agent，它使用 `FSMemory` 插件来持久化会话数据，从而实现连续且具有上下文感知能力的交互。

## 概述

此示例演示了如何使用 AIGNE 框架在聊天机器人中实现记忆功能。该 Agent 利用了 `FSMemory` 插件，该插件将对话历史和用户个人资料信息存储在本地文件系统中。这使得聊天机器人能够回忆起会话中的过往互动，从而提供更加个性化和连贯的用户体验。

## 先决条件

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js**：20.0 或更高版本。
*   **npm**：随 Node.js 安装一同提供。
*   **OpenAI API 密钥**：连接 OpenAI 模型所需。您可以从 [OpenAI API 密钥](https://platform.openai.com/api-keys)页面获取密钥。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需本地安装。

### 运行示例

在您的终端中执行以下命令，与启用了记忆功能的聊天机器人进行互动。第一个命令告知机器人您的偏好，第二个命令测试其回忆该信息的能力。

```bash 运行带记忆功能的聊天机器人 icon=lucide:terminal
# 发送第一条消息以建立一个事实
npx -y @aigne/example-memory --input 'I like blue color'

# 发送第二条消息以测试聊天机器人的记忆力
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

要进行连续对话，请在交互模式下运行聊天机器人：

```bash 在交互式聊天模式下运行 icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### 连接到 AI 模型

聊天机器人需要连接到大型语言模型 (LLM) 才能正常工作。如果您尚未配置模型提供商，CLI 将在首次运行时提示您选择一种连接方法。

![AI 模型的初始连接提示](../../../examples/memory/run-example.png)

您有三种主要方式连接到 AI 模型：

#### 1. 通过官方 AIGNE Hub 连接（推荐）

这是最简单的方法。AIGNE Hub 是一项提供多种模型访问权限的服务，并为新用户提供免费额度。

1.  选择第一个选项：`Connect to the Arcblock official AIGNE Hub`。
2.  您的网络浏览器将打开 AIGNE Hub 授权页面。
3.  按照屏幕上的说明批准连接。新用户将免费获得 400,000 个 token 的赠款。

![授权 AIGNE CLI 连接到 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 通过自托管的 AIGNE Hub 连接

如果您的组织运行着一个私有的 AIGNE Hub 实例，您可以直接连接到它。

1.  选择第二个选项：`Connect to your self-hosted AIGNE Hub`。
2.  在提示时输入您自托管的 AIGNE Hub 实例的 URL。
3.  按照后续提示完成连接。

有关部署自托管 AIGNE Hub 的说明，请参阅 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ)。

![输入自托管 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 通过第三方模型提供商连接

您可以通过将相应的 API 密钥配置为环境变量，直接连接到第三方模型提供商，如 OpenAI。

例如，要连接到 OpenAI，请设置 `OPENAI_API_KEY` 环境变量：

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key" # 替换为您的实际密钥
```

设置环境变量后，再次运行该示例。有关支持的提供商及其相应环境变量的列表，请参阅 [`.env.local.example`](https://github.com/AIGNE-io/aigne-framework/blob/main/examples/memory/.env.local.example) 文件。

## 记忆如何运作

记忆功能是通过 `history` 和 `UserProfileMemory` 模块实现的，它们是 AIGNE 框架的增强文件系统（AFS）的组件。

下图说明了聊天机器人如何记录和检索信息以在对话中保持上下文。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
  }

  UserProfileMemory: {
    label: "UserProfileMemory"
  }

  AFS: {
    label: "增强文件系统 (AFS)"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }

    history: {
      label: "history"
      shape: cylinder
    }

    user-profile: {
      label: "user_profile"
      shape: cylinder
    }
  }
}

AI-Model: {
  label: "AI 模型 (LLM)"
}

# 记录流程
User -> AIGNE-Framework.AI-Agent: "1. 发送消息"
AIGNE-Framework.AI-Agent -> User: "2. 接收响应"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "3. 保存对话"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.history: "4. 分析历史记录"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.user-profile: "5. 存储提取的个人资料"

# 检索流程
User -> AIGNE-Framework.AI-Agent: "6. 发送新消息"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.user-profile: "7. 加载用户个人资料"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "8. 加载聊天历史记录"
AIGNE-Framework.AI-Agent -> AI-Model: "9. 发送带上下文的提示"
AI-Model -> AIGNE-Framework.AI-Agent: "10. 生成响应"
AIGNE-Framework.AI-Agent -> User: "11. 传递有信息的响应"
```

### 记录对话

1.  用户发送消息并收到响应后，该对话对（用户输入和 AI 输出）将被保存到 AFS 的 `history` 模块中。
2.  同时，`UserProfileMemory` 模块会分析对话历史，以提取和推断用户个人资料详情（例如，姓名、偏好）。然后，这些信息会存储在 AFS 的 `user_profile` 模块中。

### 检索对话

当收到新的用户消息时，框架会检索存储的信息，为 AI 模型提供上下文。

1.  **加载用户个人资料**：Agent 从 `UserProfileMemory` 加载数据并将其注入到系统提示中。这确保 AI 从一开始就了解用户的个人资料。

    ```text 带记忆的系统提示
    You are a friendly chatbot

    <related-memories>
    - |
      name:
        - name: Bob
      interests:
        - content: likes blue color

    </related-memories>
    ```

2.  **注入对话历史**：来自 `history` 模块的近期对话轮次会附加到消息列表中，提供即时的对话上下文。

    ```json 带历史记录的聊天消息
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..."
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "I'm Bob and I like blue color"
          }
        ]
      },
      {
        "role": "agent",
        "content": [
          {
            "type": "text",
            "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?"
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is my favorite color?"
          }
        ]
      }
    ]
    ```

3.  **生成响应**：AI 模型处理完整的上下文——包括带有用户个人资料的系统提示和近期的聊天历史——以生成一个有信息的响应。

    **AI 响应：**

    ```text
    You mentioned earlier that you like the color blue
    ```

## 调试

要监控和分析 Agent 的行为，您可以使用 `aigne observe` 命令。该工具会启动一个本地 Web 服务器，提供一个用户界面，用于检查执行跟踪、调用详情和其他运行时数据。

1.  启动观察服务器：

    ```bash 启动 AIGNE 观察器 icon=lucide:terminal
    aigne observe
    ```

    ![显示可观察性服务器正在运行的终端输出](../../../examples/images/aigne-observe-execute.png)

2.  打开浏览器并导航到提供的本地 URL（通常是 `http://localhost:7893`），以查看最近的 Agent 执行列表并检查其跟踪记录。

    ![显示跟踪列表的 Aigne 可观察性 Web 界面](../../../examples/images/aigne-observe-list.png)

## 总结

此示例演示了如何使用 AIGNE 框架实现具有持久记忆的聊天机器人。通过利用 `FSMemory` 插件，聊天机器人可以记录和检索对话历史和用户个人资料信息，从而实现更具上下文感知和个性化的互动。

有关更高级的记忆持久化选项，请参阅 [DID Spaces Memory](./examples-memory-did-spaces.md) 示例，该示例演示了如何使用去中心化存储。