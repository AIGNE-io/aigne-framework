# 工作流程路由器

本指南示範如何建置一個智慧型工作流程，該工作流程能自動將使用者請求路由到最合適的專門 Agent。您將學習如何建立一個作為智慧型分派器的「分流」Agent，它會分析傳入的查詢，並根據查詢內容將其轉發給其他 Agent。

## 總覽

在許多應用程式中，使用者請求可能分為不同類別，例如產品支援、使用者回饋或一般問題。路由器工作流程提供了一種有效的方式來處理這種情況，它使用一個主要 Agent 對請求進行分類，並將其委派給正確的下游 Agent。這種模式確保使用者能夠快速有效地連接到正確的資源。

該工作流程由一個主要的 `triage` Agent 和幾個專門的 Agent 組成：

-   **Triage Agent**：入口點。它會分析使用者的查詢，並決定應由哪個專門 Agent 處理。
-   **Product Support Agent**：處理與產品使用相關的問題。
-   **Feedback Agent**：管理使用者回饋和建議。
-   **Other Agent**：一個通用 Agent，用於處理不屬於其他類別的查詢。

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "工作流程路由器"
  shape: rectangle

  Triage-Agent: {
    label: "Triage Agent"

    shape: diamond
  }

  Specialized-Agents: {
    shape: rectangle
    grid-columns: 3

    Product-Support-Agent: {
      label: "Product Support Agent"
      shape: rectangle
    }

    Feedback-Agent: {
      label: "Feedback Agent"
      shape: rectangle
    }

    Other-Agent: {
      label: "Other Agent"
      shape: rectangle
    }
  }
}

User -> Workflow.Triage-Agent: "使用者查詢"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Product-Support-Agent: "路由至"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Feedback-Agent: "路由至"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Other-Agent: "路由至"
```

## 先決條件

在執行此範例之前，請確保您已安裝並設定好以下項目：

-   **Node.js**：版本 20.0 或更高。
-   **npm**：隨 Node.js 一起安裝。
-   **OpenAI API 金鑰**：您需要一個 OpenAI 的 API 金鑰來連接其語言模型。您可以從 [OpenAI 平台](https://platform.openai.com/api-keys)取得一個。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需任何本機安裝。

### 執行範例

此範例可以以單次模式、互動式聊天模式執行，或直接透過管道傳入輸入。

1.  **單次模式（預設）**
    此命令會使用預設問題執行工作流程，然後結束。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router
    ```

2.  **互動式聊天模式**
    使用 `--chat` 旗標來啟動一個互動式對話，您可以在其中提出多個問題。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router --chat
    ```

3.  **管道輸入**
    您可以將問題直接透過管道傳入命令中。

    ```sh icon=lucide:terminal
    echo "How do I return a product?" | npx -y @aigne/example-workflow-router
    ```

### 連接到 AI 模型

當您第一次執行範例時，系統會提示您連接到一個 AI 模型。您有幾個選項：

1.  **AIGNE Hub（官方）**：最簡單的入門方式。瀏覽器將會開啟，您可以按照提示進行連接。新使用者會獲得免費的 token 額度。
2.  **AIGNE Hub（自行託管）**：如果您自行託管 AIGNE Hub 執行個體，您可以提供其 URL 進行連接。
3.  **第三方模型提供商**：您可以透過設定包含 API 金鑰的環境變數，直接連接到像 OpenAI 這樣的提供商。

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY="your_openai_api_key_here"
    ```

    設定金鑰後，再次執行範例命令。

## 實作深入探討

此工作流程的核心是 `triage` Agent，它將其他 Agent 作為「技能」或「工具」使用。透過將 `toolChoice` 設定為 `"router"`，您可以指示 `triage` Agent 從可用的技能中精確選擇一個來處理傳入的請求。

### 程式碼範例

以下 TypeScript 程式碼示範如何定義專門的 Agent 和主要的路由 Agent。

```typescript router.ts icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化聊天模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定義專門的 Agent
const productSupport = AIAgent.from({
  name: "product_support",
  description: "協助處理任何與產品相關問題的 Agent。",
  instructions: `您是一個能夠處理任何與產品相關問題的 Agent。
  您的目標是提供關於產品的準確且有用的資訊。
  請保持禮貌、專業，並確保使用者感到被支援。`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "協助處理任何與回饋相關問題的 Agent。",
  instructions: `您是一個能夠處理任何與回饋相關問題的 Agent。
  您的目標是傾聽使用者的回饋，確認他們的輸入，並提供適當的回應。
  請展現同理心、理解力，並確保使用者感到被傾聽。`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "協助處理任何一般性問題的 Agent。",
  instructions: `您是一個能夠處理任何一般性問題的 Agent。
  您的目標是在廣泛的主題上提供準確且有用的資訊。
  請保持友善、知識淵博，並確保使用者對提供的資訊感到滿意。`,
  outputKey: "other",
});

// 3. 定義 Triage (Router) Agent
const triage = AIAgent.from({
  name: "triage",
  instructions: `您是一個能夠將問題路由到適當 Agent 的 Agent。
  您的目標是理解使用者的查詢，並將他們引導至最適合協助他們的 Agent。
  請保持高效、清晰，並確保使用者能快速連接到正確的資源。`,
  skills: [productSupport, feedback, other],
  toolChoice: "router", // 這會啟用路由器模式
});

// 4. 初始化 AIGNE 並呼叫工作流程
const aigne = new AIGNE({ model });

// 範例 1：產品支援查詢
const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);

// 範例 2：回饋查詢
const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);

// 範例 3：一般查詢
const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
```

### 預期輸出

當您執行程式碼時，`triage` Agent 會分析每個問題，並將其路由到相應的專門 Agent。最終的輸出將是一個物件，其鍵值為所選 Agent 的 `outputKey`。

**產品支援查詢：**
```json
{
  "product_support": "我很樂意協助您！不過，我需要知道您指的是哪個具體的產品。請問您能提供您所想的產品名稱或類型嗎？"
}
```

**回饋查詢：**
```json
{
  "feedback": "感謝您分享您的回饋！我隨時準備傾聽。請繼續，讓我知道您想分享關於這個應用程式的什麼內容。"
}
```

**一般查詢：**
```json
{
  "other": "我無法提供即時的天氣更新。不過，您可以查看可靠的天氣網站或手機上的天氣應用程式來了解您所在地區的目前天氣狀況。如果您告訴我您的位置，我可以推薦一些可以找到準確天氣資訊的來源！"
}
```

## 從原始碼執行（可選）

如果您偏好從儲存庫的本機複本執行範例，請依照以下步驟操作。

1.  **複製儲存庫**

    ```sh icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安裝依賴項**

    導覽至範例目錄並使用 `pnpm` 安裝依賴項。

    ```sh icon=lucide:terminal
    cd aigne-framework/examples/workflow-router
    pnpm install
    ```

3.  **執行範例**

    使用 `pnpm start` 命令來執行工作流程。命令列參數必須在 `--` 之後傳遞。

    ```sh icon=lucide:terminal
    # 以單次模式執行
    pnpm start

    # 以互動式聊天模式執行
    pnpm start -- --chat

    # 使用管道輸入
    echo "How do I return a product?" | pnpm start
    ```

### 命令列選項

您可以使用以下參數自訂執行：

| 參數 | 說明 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--chat` | 以互動式聊天模式執行。 |
| `--model <provider[:model]>` | 要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 |
| `--temperature <value>` | 模型生成的溫度值。 |
| `--top-p <value>` | Top-p 取樣值。 |
| `--presence-penalty <value>` | 存在懲罰值。 |
| `--frequency-penalty <value>` | 頻率懲罰值。 |
| `--log-level <level>` | 設定日誌層級：`ERROR`、`WARN`、`INFO`、`DEBUG` 或 `TRACE`。 |
| `--input`, `-i <input>` | 直接指定輸入。 |

## 總結

此範例展示了一種用於建構複雜 AI 工作流程的強大且常見的模式。透過建立一個路由器 Agent，您可以有效地管理任務並將其委派給專門的 Agent，從而實現更準確、更高效的應用程式。

若要繼續探索，請考慮以下相關範例：

<x-cards data-columns="2">
  <x-card data-title="循序工作流程" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    學習如何建置 Agent 依照特定、有序的順序執行任務的工作流程。
  </x-card>
  <x-card data-title="交接工作流程" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    在專門的 Agent 之間建立無縫過渡，以逐步解決複雜問題。
  </x-card>
</x-cards>