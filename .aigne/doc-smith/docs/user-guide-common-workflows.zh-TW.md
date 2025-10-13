本指南提供了您在幾分鐘內安裝 AIGNE 框架並執行第一個 AI 應用程式所需的一切。我們將逐步引導您設定環境、安裝必要的套件，並建立一個簡單而強大的多 Agent 工作流程。

## 1. 先決條件

在開始之前，請確保您的系統上已安裝 Node.js。AIGNE 框架需要較新版本的 Node.js 才能正常運作。

*   **Node.js**：20.0 或更高版本

您可以在終端機中執行以下指令來檢查您的 Node.js 版本：

```bash
node -v
```

如果您尚未安裝 Node.js 或需要升級，我們建議使用版本管理器（如 `nvm`）或從 [Node.js 官方網站](https://nodejs.org/)下載。

## 2. 安裝

您可以使用您偏好的套件管理器將 AIGNE 框架新增至您的專案中：`npm`、`yarn` 或 `pnpm`。

### 使用 npm

```bash
npm install @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/core
```

此指令會安裝核心套件，其中提供了建立 AI Agent 和工作流程所需的基本建構區塊。

## 3. 您的第一個 AIGNE 應用程式

讓我們來建立一個簡單的應用程式，以展示「Handoff」工作流程模式。在此範例中，`AgentA` 將接收初始提示，然後將對話交接給具有不同個性的 `AgentB`。

此範例還需要一個模型提供者來驅動 Agent。本指南將使用 OpenAI。

首先，安裝 OpenAI 模型套件：

```bash
npm install @aigne/openai
```

現在，建立一個新的 TypeScript 檔案（例如 `index.ts`），並新增以下程式碼：

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 用於載入環境變數
import * as dotenv from "dotenv";
dotenv.config();

// 1. 設定 AI 模型
// 確保您已在 .env 檔案中設定 OPENAI_API_KEY
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定義「Handoff」技能
// 此函式定義了從 AgentA 將控制權轉移給 AgentB 的條件。
function transferToB() {
  return agentB;
}

// 3. 定義您的 Agent
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. When the user asks to talk to agent b, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // 附加 handoff 技能
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 4. 初始化 AIGNE 框架
const aigne = new AIGNE({ model });

// 執行應用程式的主函式
async function main() {
  // 5. 啟動與 AgentA 的會話
  const userAgent = aigne.invoke(agentA);

  // 6. 第一次互動：觸發 handoff
  console.log("User: transfer to agent b");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log("Agent:", result1);
  // 預期輸出：
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  // 7. 第二次互動：與 AgentB 聊天
  // 現在會話已永久交給 AgentB
  console.log("\nUser: It's a beautiful day");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log("Agent:", result2);
  // 預期輸出：
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main().catch(console.error);
```

### 程式碼解析

1.  **設定 AI 模型**：我們匯入 `OpenAIChatModel` 並使用 API 金鑰對其進行初始化。最佳實踐是從環境變數中載入像 API 金鑰這樣的密鑰。
2.  **定義「Handoff」技能**：`transferToB` 函式是一個*技能*。執行時，它會返回 `agentB` 的定義，向 AIGNE 發出信號，表示應將控制權轉移給該 Agent。
3.  **定義您的 Agent**：我們使用 `AIAgent.from()` 建立兩個不同的 Agent。
    *   `agentA` 是初始的聯絡點。其 `skills` 陣列包含 `transferToB` 函式，使其能夠執行交接。
    *   `agentB` 有一個特定的個性——它只用俳句說話。
4.  **初始化 AIGNE 框架**：我們建立一個 `AIGNE` 的實例，並傳入它將用來驅動 Agent 的模型。
5.  **啟動會話**：`aigne.invoke(agentA)` 會建立一個有狀態的使用者會話，從 `agentA` 開始。
6.  **觸發 Handoff**：第一條訊息「transfer to agent b」符合 `agentA` 的指示，`agentA` 隨後執行 `transferToB` 技能。對話現在永久交接給 `agentB`。輸出鍵為 `B`，表示回應來自 `agentB`。
7.  **與 AgentB 聊天**：第二條訊息被傳送到同一個 `userAgent` 會話。由於交接已經發生，`agentB` 會收到訊息並根據其指示以俳句回應。

## 4. 執行程式碼

若要執行此範例，請依照以下步驟操作：

1.  在您專案的根目錄中**建立一個 `.env` 檔案**來儲存您的 OpenAI API 金鑰：
    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

2.  **安裝 `dotenv` 和 `ts-node`** 以管理環境變數並直接執行 TypeScript：
    ```bash
    npm install dotenv ts-node typescript
    ```

3.  使用 `ts-node` **執行腳本**：
    ```bash
    npx ts-node index.ts
    ```

您將在主控台中看到 Agent 互動並執行交接的輸出。

## 後續步驟

恭喜！您已成功建立並執行了您的第一個 AIGNE 應用程式。

接下來，您可以探索該框架更進階的功能：

*   **探索主要功能**：了解模組化設計、多模型支援和程式碼執行能力。
*   **探索工作流程模式**：深入研究其他強大的模式，如 Sequential、Router 和 Concurrency，以建構更複雜的應用程式。
*   **查閱 API 參考文件**：取得所有可用類別、方法和設定的詳細資訊。