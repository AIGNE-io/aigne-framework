# 記憶體

本指南將示範如何建構一個能夠跨會話保留對話歷史的具狀態聊天機器人。透過利用 `FSMemory` 外掛程式，Agent 可以將會話資料持久化到本地檔案系統，使其能夠回憶先前的互動。

## 概覽

在許多對話式 AI 應用程式中，Agent 記住過去互動的上下文以提供連貫且相關的回應至關重要。AIGNE 框架透過其記憶體元件來解決這個問題。本範例著重於 `FSMemory`，這是一個將對話歷史持久化到您本地磁碟的直接解決方案。

這種方法非常適合開發、測試或可以在本地管理狀態而無需外部資料庫或服務的應用程式。對於更進階或分散式的持久化儲存，可考慮使用 [DIDSpacesMemory](./examples-memory-did-spaces.md) 等替代方案。

## 如何執行範例

您可以使用 `npx` 直接執行此範例。此命令將下載必要的套件並執行聊天機器人指令碼。

若要在互動模式下啟動聊天機器人，請在您的終端機中執行以下命令：

```sh
npx -y @aigne/example-memory --interactive
```

如果您尚未設定您的 LLM API 金鑰，系統將提示您連接到 AIGNE Hub，它提供了一種簡單的入門方式。

![AI 模型的初始連接提示](../../../examples/afs-memory/run-example.png)

## 程式碼說明

此範例的核心是將 `FSMemory` 外掛程式與 `AIAgent` 整合。此 Agent 被設定為使用此記憶體模組，以自動為給定會話儲存和擷取對話歷史。

下圖說明了 `AIAgent`、`FSMemory` 外掛程式和檔案系統在聊天會話期間如何互動：

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![記憶體](assets/diagram/examples-memory-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

### `main.ts`

主指令碼會初始化 Agent、註冊記憶體外掛程式，並啟動對話迴圈。

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
        name: '--interactive',
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

該指令碼的關鍵元件：

1.  **匯入模組**：我們從 AIGNE 框架匯入 `AIAgent`、`AIGNE` 和 `FSMemory`。
2.  **初始化 `FSMemory`**：建立一個 `FSMemory` 的執行個體。
    *   `path`：指定儲存對話日誌的目錄 (`.memory`)。
    *   `sessionId`：對話會話的唯一識別碼。這確保不同聊天會話的歷史記錄分開儲存。
3.  **設定 `AIAgent`**：實例化 `chatbot` Agent。
    *   `model`：用於生成回應的語言模型。
    *   `memory`：將 `FSMemory` 執行個體傳遞給 Agent 的建構函式。這將 Agent 與持久化層連結起來。
    *   `instructions`：定義 Agent 的角色和目標的系統提示。
4.  **執行聊天**：`aigne.chat()` 方法啟動互動式會話。該框架會自動處理在會話開始時從 `FSMemory` 載入過去的訊息，並在對話進行中儲存新的訊息。

## 總結

在此範例中，您學習了如何使用 `FSMemory` 外掛程式建立一個具有持久性記憶體的聊天機器人。這使得 Agent 能夠透過從本地檔案系統儲存和擷取對話歷史來維持跨多個互動的上下文。這個基礎概念是建構更進階、具備上下文感知能力的 AI 應用程式的關鍵。
