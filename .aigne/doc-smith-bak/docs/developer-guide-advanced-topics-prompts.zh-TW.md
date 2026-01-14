# 提示詞

與 AI 模型進行有效溝通，取決於所提供提示詞的品質與結構。AIGNE 框架透過其 `PromptBuilder` 類別和整合的 Nunjucks 範本引擎，提供了一個強大的系統，用於建立動態、可重複使用且結構化的提示詞。本指南將系統性地解釋這些元件。

關於提示詞如何在 Agent 中使用，請參閱 [AI Agent](./developer-guide-agents-ai-agent.md) 文件以了解更多背景資訊。

## 使用 Nunjucks 進行提示詞範本化

該框架利用 [Nunjucks 範本引擎](https://mozilla.github.io/nunjucks/) 來促進動態提示詞的建立。這允許在提示詞檔案中直接注入變數、包含外部檔案以及實現其他程式化邏輯。

所有提示詞文本都由 `PromptTemplate` 類別處理，該類別使用 Nunjucks 來渲染最終的字串。

### 變數替換

您可以使用 `{{ variable_name }}` 語法在提示詞中定義預留位置。這些預留位置在執行時期會被實際值替換。

```markdown title="analyst-prompt.md" icon=mdi:text-box
分析以下資料：

{{ data }}
```

使用此提示詞呼叫 Agent 時，您需要在輸入訊息中提供 `data` 變數。

```typescript title="index.ts" icon=logos:typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAI }s from "@aigne/openai";

const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const aigne = new AIGNE({
  model,
  agents: {
    analyst: new AIAgent({
      instructions: { path: "./analyst-prompt.md" },
      inputKey: "data",
    }),
  },
});

const result = await aigne.invoke("analyst", {
  data: "User feedback scores: 8, 9, 7, 10, 6.",
});

console.log(result);
```

### 檔案包含

Nunjucks 允許使用 `{% include "path/to/file.md" %}` 標籤從多個檔案組合提示詞。這對於在不同提示詞之間重複使用通用指令或元件非常有效。路徑是相對於包含 `include` 標籤的檔案進行解析。

例如，您可以在一個檔案中定義一組通用指令，並將其包含在另一個檔案中。

```markdown title="common-instructions.md" icon=mdi:text-box
始終以專業且基於事實的方式回應。
請勿推測或提供意見。
```

```markdown title="main-prompt.md" icon=mdi:text-box
您是一位專業的金融分析師。

{% include "./common-instructions.md" %}

分析所提供的季度收益報告。
```

這種模組化的方法簡化了提示詞管理並確保了一致性。

## 使用 ChatMessageTemplate 結構化提示詞

對於以聊天為基礎的模型，提示詞會被結構化為一系列訊息，每個訊息都有特定的角色。該框架提供了以程式化方式表示這些訊息的類別。

-   **`SystemMessageTemplate`**：為 AI 模型設定上下文或高階指令。
-   **`UserMessageTemplate`**：代表來自終端使用者的訊息。
-   **`AgentMessageTemplate`**：代表 AI 模型先前的回應，可用於少樣本提示或繼續對話。
-   **`ToolMessageTemplate`**：代表 Agent 進行工具呼叫的結果。

這些範本可以組合成一個 `ChatMessagesTemplate`，以定義一個完整的對話式提示詞。

```typescript title="structured-prompt.ts" icon=logos:typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";

const promptTemplate = new ChatMessagesTemplate([
  SystemMessageTemplate.from(
    "您是一個樂於助人的助理，能將 {{ input_language }} 翻譯成 {{ output_language }}。"
  ),
  UserMessageTemplate.from("{{ text }}"),
]);

// 此範本接著可以用於 AIAgent 的 `instructions` 中。
```

## `PromptBuilder` 類別

`PromptBuilder` 是負責組合最終發送給語言模型的完整提示詞的核心元件。它協調整個過程，將各種輸入整合成一個連貫的結構。

下圖說明了資訊流入 `PromptBuilder` 的流程：
<d2>
direction: right
style {
  stroke-width: 2
  font-size: 14
}
"使用者輸入 (訊息)": {
  shape: document
  style.fill: "#D1E7DD"
}
"提示詞範本 (.md)": {
  shape: document
  style.fill: "#D1E7DD"
}
"Agent 設定": {
  shape: document
  style.fill: "#D1E7DD"
}
"上下文": {
  shape: document
  style.fill: "#D1E7DD"
}
PromptBuilder: {
  shape: hexagon
  style.fill: "#A9CCE3"
}
"ChatModelInput (至 LLM)": {
  shape: document
  style.fill: "#FADBD8"
}

"使用者輸入 (訊息)" -> PromptBuilder
"提示詞範本 (.md)" -> PromptBuilder
"Agent 設定" -> PromptBuilder
"上下文" -> PromptBuilder

PromptBuilder -> "ChatModelInput (至 LLM)"

"Agent 設定".children: {
  "技能/工具"
  "記憶"
  "輸出結構"
}

"ChatModelInput (至 LLM)".children: {
  "渲染後的訊息"
  "工具定義"
  "回應格式"
}
</d2>

在 `build` 過程中，`PromptBuilder` 會自動執行以下操作：

1.  **載入指令**：它從字串、檔案路徑或 MCP `GetPromptResult` 物件載入提示詞範本。
2.  **渲染範本**：它使用 Nunjucks 格式化提示詞範本，並從使用者的輸入訊息中注入變數。
3.  **注入記憶**：如果 Agent 設定為使用記憶，`PromptBuilder` 會擷取相關記憶，並將其轉換為系統、使用者或 Agent 訊息，以提供對話上下文。
4.  **整合工具 (技能)**：它會收集所有可用的技能 (來自 Agent 設定和呼叫上下文)，並將它們格式化為模型的 `tools` 和 `tool_choice` 參數。
5.  **定義回應格式**：如果 Agent 有 `outputSchema`，`PromptBuilder` 會設定模型的 `responseFormat`，以強制執行結構化的 JSON 輸出。

### 實例化

建立 `PromptBuilder` 最常見的方法是透過靜態的 `PromptBuilder.from()` 方法，該方法可以接受不同的來源：

-   **從字串**：
    ```typescript
    const builder = PromptBuilder.from("您是一個樂於助人的助理。");
    ```
-   **從檔案路徑**：
    ```typescript
    const builder = PromptBuilder.from({ path: "./prompts/my-prompt.md" });
    ```

當 `AIAgent` 使用 `instructions` 定義時，它會在內部使用 `PromptBuilder.from()` 來建立和管理提示詞的建構過程。

## 總結

AIGNE 框架為提示詞工程提供了一個分層且功能強大的系統。透過理解和利用 `PromptTemplate` 搭配 Nunjucks 來處理動態內容，以及使用 `PromptBuilder` 來協調最終結構，您可以為您的 AI Agent 建立複雜、模組化且有效的提示詞。

欲了解更多資訊，請探索 [AIAgent 文件](./developer-guide-agents-ai-agent.md)，以了解這些提示詞如何整合到 Agent 生命週期中。